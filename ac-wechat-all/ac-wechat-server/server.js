const dotenv = require('dotenv');
dotenv.config();

const qrcodeTerminal = require('qrcode-terminal');

const reply = require('./agentcraft');
const { getBot } = require('./wechatBot');
const bot = getBot();

let autoReply = process.env.autoReply === 'true';
const startTime = new Date(new Date().getTime() - 3 * 60 * 1000); // 偶现时间错位问题
console.log('startTime: ', startTime);

bot.on('scan', onScan)
bot.on('login', onLogin)
bot.on('logout', onLogout)
bot.on('message', onMessage)

async function onMessage(msg) {
    const content = msg.text().trim();
    if (msg.date() < startTime) {
        console.log('Time has passed, skip: ', content);
        return;
    }
    if (msg.self()) {
        console.log('Self content: ', content);
        if (content == '功能') {
            // // 能坚挺到发送，但是客户端看不到
            // await msg.to().say('功能列表：\n - 开启自动回复\n - 关闭自动回复\n - 功能');
        } else if (content == '开启自动回复') {
            autoReply = true;
        } else if (content == '关闭自动回复') {
            autoReply = false;
        } else {
            console.log('Self message, skip');
        }
        return;
    }

    console.log('onMessage: ', msg);

    const contact = msg.talker();
    const receiver = msg.to();
    const room = msg.room();
    const alias = (await contact.alias()) || (await contact.name());
    const isText = msg.type() === bot.Message.Type.Text;
    if (room && isText) {
        const topic = await room.topic();
        const talker = await contact.name()
        console.log(`Group name: ${topic}; talker: ${talker}; content: ${content}`);

        const pattern = RegExp(`^@${receiver.name()}\\s+[\\s]*`);
        if (await msg.mentionSelf()) {
            if (pattern.test(content)) {
                if (autoReply) {
                    const agentcraftResponse = await reply(content);
                    room.say(agentcraftResponse || '收到信息，但系统未做回答');
                }
                return;
            }
            console.log("Content is not within the scope of the customizition format");
        }
    } else if (isText) {
        console.log(`talker: ${alias} content: ${content}`);
        if (autoReply) {
            const agentcraftResponse = await reply(content);
            contact.say(agentcraftResponse || '收到信息，但系统未做回答');
        }
    } else {
        console.log('Other message, skip');
        // sendWs(s({ event: 'info', from: '公众号', message: `${msg.payload.text}`, title: msg.payload.filename, type: 'public' }));
    }
}

function onLogout(event) {
    console.log(JSON.stringify(event, null, 2));
}

function onLogin(user) {
    console.log(`${user} has logged in`);
}

function onScan(qrcode) {
    console.log('On scan: ');
    qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console
}

bot.start()
    .then(() => console.log('StarterBot', 'Starter Bot Started.'))
    .catch(e => console.error('StarterBot', e))
