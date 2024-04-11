const reply = require('./utils/agentcraft');
const { WechatyBuilder, ScanStatus } = require("wechaty");

module.exports = async function (botConfig, botName) {
  const bot = botConfig.bot ? botConfig.bot : WechatyBuilder.build({
    name: botName,
    puppet: "wechaty-puppet-wechat", // 如果有token，记得更换对应的puppet
    puppetOptions: {
      uos: true,
    },
  });

  const startTime = new Date(new Date().getTime() - 1 * 60 * 1000); // 偶现时间错位问题
  console.log('startTime: ', startTime);

  // fix： 自动登录时获取不了真正的状态
  await new Promise(async resolve => {
    bot.on('scan', onScan)
    bot.on('login', onLogin)
    bot.on('logout', onLogout)
    bot.on('message', onMessage)

    async function onMessage(msg) {
      const content = msg.text().trim();
      if (!botConfig.autoReply) {
        console.log('Auto reply is False, skip: ', content);
        return;
      }
      if (msg.date() < startTime) {
        console.log('Time has passed, skip: ', content);
        return;
      }
      if (msg.self()) {
        return;
      }

      // console.log('onMessage: ', msg);

      const contact = msg.talker();
      const receiver = msg.to();
      const room = msg.room();
      const alias = (await contact.alias()) || (await contact.name());
      const isText = msg.type() === bot.Message.Type.Text;
      if (room && isText) {
        const topic = await room.topic();
        const talker = await contact.name()
        console.log(`Group name: ${topic}; talker: ${talker}; content: ${content}`);

        const mentionSelf = await msg.mentionSelf();
        const pattern = RegExp(`^@${receiver.name()}\\s+[\\s]*`);
        console.log('pattern: ', pattern, pattern.test(content));
        console.log('mentionSelf: ', mentionSelf);
        if (mentionSelf) {
          if (pattern.test(content)) {
            const agentcraftResponse = await reply(content);
            room.say(agentcraftResponse || '收到信息，但系统未做回答');
            return;
          }
          console.log("Content is not within the scope of the customizition format");
        }
      } else if (isText) {
        console.log(`talker: ${alias} content: ${content}`);
        const agentcraftResponse = await reply(content);
        contact.say(agentcraftResponse || '收到信息，但系统未做回答');
      } else {
        console.log('Other message, skip: ', content);
      }
    }

    function onLogout(event) {
      console.log('logout: ', JSON.stringify(event, null, 2));
    }

    function onScan(qrcode, status) {
      console.log('On scan: ');
      if (status === ScanStatus.Waiting) {
        console.log('生成二维码等待扫描');
        bot.qrcodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}`;
      } else if (status === ScanStatus.Timeout) {
        console.log('二维码已过期。请重新扫描。');
        bot.qrcodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}`;
      } else if (status === ScanStatus.Scanned) {
        console.log('扫描完成，请手机确认登录');
      } else if (status === ScanStatus.Confirmed) {
        console.log('已确认登录。你已经准备好了！');
      } else {
        console.log('未知状态');
      }

      resolve();
    }

    function onLogin(user) {
      console.log(`${user} has logged in`);
      resolve();
    }

    await bot.start()
      .then(() => console.log('StarterBot', 'Starter Bot Started.'))
      .catch(e => console.error('StarterBot', e))
  });

  return bot;
}