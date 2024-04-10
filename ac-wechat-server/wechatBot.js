// @ts-ignore
const { WechatyBuilder } = require("wechaty");

let bot;

exports.getBot = function () {
    if (!bot) {
        bot = WechatyBuilder.build({
            name: "WechatEveryDay",
            puppet: "wechaty-puppet-wechat", // 如果有token，记得更换对应的puppet
            puppetOptions: {
                uos: true,
            },
        });
    }
    return bot
}