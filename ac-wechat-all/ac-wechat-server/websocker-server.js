const dotenv = require('dotenv');
dotenv.config();

const { createServer } = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const { getBot } = require('./wechatBot');
const reply = require('./agentcraft');

const port = process.env.port || 8080;
const server = createServer();
const bot = getBot();
const wss = new WebSocket.Server({ server, path: '/wechat' });
const startTime = new Date();
let globalUser;
let globalWs;
let qrcodeImageUrl = '';
let dynamicAutoReplay = process.env.autoReply;
const QrcodeImageUrlFileName = 'qrcode.txt'

function s(data) {
    return JSON.stringify(data);
}


function r(_data) {
    let data = {};
    try {
        data = JSON.parse(_data);
    } catch (e) {

    }
    return data;
}


function writeQrcodeImageUrlToFile(qrcodeImageUrl) {
    const filename = QrcodeImageUrlFileName;
    try {
        fs.writeFileSync(filename, qrcodeImageUrl);
    } catch (e) { }
}

function extractContent(str) {
    const regex = /<([^>]+)>/g;
    let result;
    let extractedContents = [];

    while ((result = regex.exec(str)) !== null) {
        extractedContents.push(result[1]);
    }

    return extractedContents[0];
}


function sendWs(data) {
    try {
        globalWs && globalWs.send(data)
    } catch (e) {
        console.log(e)
    }

}

function bindWeChatLogin() {
    console.log('Bind Wechat Login Event');
    bot.on('login', (user) => {
        console.log(`${user} has logged in`);
        const _user = extractContent(user);
        globalUser = _user;
        sendWs(s({
            event: 'login',
            user: _user
        }));
    })
}

function bindWeChatMessage() {
    console.log('Bind Wechat Message Event');
    bot.on('message', async (msg) => {
        console.log(msg);
        if (msg.date() < startTime) {
            return;
        }
        let autoReply = dynamicAutoReplay;

        const contact = msg.talker();
        const receiver = msg.to();
        const content = msg.text().trim();
        const room = msg.room();
        const alias = (await contact.alias()) || (await contact.name());
        const isText = msg.type() === bot.Message.Type.Text;
        if (msg.self()) {
            return;
        }
        if (room && isText) {
            const topic = await room.topic();
            const talker = await contact.name()
            console.log(
                `Group name: ${topic} talker: ${talker} content: ${content}`
            );
            try {
                sendWs(s({ event: 'info', from: topic, message: `${talker}说：${content}`, type: 'group' }));
            } catch (e) {
                console.log(e);
            }

            const pattern = RegExp(`^@${receiver.name()}\\s+[\\s]*`);
            if (await msg.mentionSelf()) {
                if (pattern.test(content)) {
                    const groupContent = content.replace(pattern, "");
                    sendWs(s({ event: 'info', from: room, message: groupContent, type: 'user' }));
                    if (autoReply == 'true') {
                        const agentcraftResponse = await reply(content);
                        if (agentcraftResponse) {
                            room.say(agentcraftResponse)
                            sendWs(s({ event: 'info', from: '机器人', message: agentcraftResponse, type: 'robot' }));
                        } else {
                            sendWs(s({ event: 'info', from: '系统', message: `收到信息：${content}，但系统未答`, type: 'system' }));
                        }
                    }
                    return;
                } else {
                    console.log(
                        "Content is not within the scope of the customizition format"
                    );
                }
            }
        } else if (isText) {
            console.log(`talker: ${alias} content: ${content}`);
            sendWs(s({ event: 'info', from: alias, message: content, type: 'user' }));
            if (autoReply == 'true') {
                const agentcraftResponse = await reply(content);
                if (agentcraftResponse) {
                    contact.say(agentcraftResponse)
                    sendWs(s({ event: 'info', from: '机器人', message: agentcraftResponse, type: 'user' })); // 方便前端信息统一展示
                    sendWs(s({ event: 'info', from: '机器人', message: agentcraftResponse, type: 'robot' }));
                } else {
                    sendWs(s({ event: 'info', from: '系统', message: `收到信息：${content}，但系统未答`, type: 'system' }));
                }
            }
        } else {
            sendWs(s({ event: 'info', from: '公众号', message: `${msg.payload.text}`, title: msg.payload.filename, type: 'public' }));
        }

    })

}

function bindScan() {
    console.log('Bind Wechat Scan Event');
    bot.on('scan', (qrcode) => {
        qrcodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}`;
        writeQrcodeImageUrlToFile(qrcodeImageUrl);
        sendWs(s({ qrcodeImageUrl, event: 'scan' }));
    });
}


function bindLogout() {
    console.log('Bind Wechat Logout Event');
    bot.on('logout', (event) => {
        console.log(event);
        sendWs(s({ event, event: 'logout' }));
    });
}

function executeCommand(data) {
    if (data.command === 'start') {
        // 删除缓存文件？
        try {
            console.log('check bot login status:', bot.isLoggedIn)
            if (!bot.isLoggedIn) {
                console.log('start');
                bot.start();
            } else {
                sendWs(s({
                    event: 'login',
                    user: globalUser
                }));
            }
            // else {
            //     const qrcodeImageUrl = readQrcodeImageUrlToFile();
            //     if (qrcodeImageUrl) {
            //         sendWs(s({ qrcodeImageUrl, event: 'scan' }));
            //     }
            // }

        } catch (e) {
            console.log(e);
            bot.start();
        }
    }
    if (data.command === 'stop') {
        bot.stop();
    }
    if (data.command === 'reply') {
        const { autoReply } = data.body;
        dynamicAutoReplay = autoReply;
    }
    if (data.command === 'heartbeat') {
        console.log('client heartbeat')
    }
}

bindScan();
bindWeChatLogin();
bindLogout();
bindWeChatMessage();
wss.on('connection', (_ws) => {
    console.log('Client connected');
    globalWs = _ws;
    _ws.on('message', (message) => {
        console.log(`Received message => ${message}`);
        const data = r(message);
        if (data.type === 'command') {
            executeCommand(data);
        }

    });

    _ws.on('close', async () => {
        // await bot.stop();  界面停止不影响机器人接收
        console.log('Client disconnected');
    });
});

server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
});