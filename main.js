const dotenv = require('dotenv');
dotenv.config();

const botConfig = {
  // 可以讲智能体的请求地址和 token 也配置进来
};

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors')

const getBot = require('./mainBot');
const constants = require('./utils/constants');

const app = express();

app.use(express.static('public'))

app.use(cors({
  credentials: true // 允许携带cookie
}));

// 设置session
app.use(session({
  secret: constants.secret,
  resave: false,
  saveUninitialized: true,
  name: 'wechaty-session',
}));

app.use(bodyParser.json()); //将请求转换成json格式
app.use(express.urlencoded({ extended: true }))

// session 拦截
app.use(function (req, res, next) {
  const username = req.session && req.session.username;
  console.log(`path: ${req.originalUrl}, username: ${username}, query: ${JSON.stringify(req.query)}, body: ${JSON.stringify(req.body)}`);

  const skipCheckSession = ['/api/login'].includes(req.originalUrl);
  if (skipCheckSession || username) {
    if (!botConfig[username]) {
      // 初始化用户数据
      botConfig[username] = {
        autoReply: true,
        login: false,
        bot: null,
      };
    }
    return next();
  }

  res.status(403);
  res.send({ message: 'Permission Denied' });
});

// 处理登录系统请求
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username && constants.users[username] === password) {
    req.session.username = username;
    return res.send({ message: 'sucess' });
  }
  res.status(401);
  res.send({ message: 'Invalid username or password' });
});

app.get('/api/config', (req, res) => {
  const config = { ...botConfig[req.session.username] };
  delete config.bot;
  res.send(config)
})

app.get('/api/auto-reply', (req, res) => {
  botConfig[req.session.username].autoReply = req.query.autoReply === 'true';
  res.send({ autoReply: req.query })
})

app.get('/api/logout', async (req, res) => {
  const username = req.session.username;
  if (botConfig[username].bot) {
    await botConfig[username].bot.puppet.logout();
    botConfig[username].bot = null;
  }
  botConfig[username].login = false;
  res.send({});
})

app.get('/api/clear', async (req, res) => {
  // await botConfig[req.session.username].bot.logout();
  // require('fs').unlinkSync('')
  // agentcraft.memory-card.json
  res.send({});
})

app.get('/api/login', async (req, res) => {
  const username = req.session.username;
  const config = botConfig[username];
  if (!config.bot) {
    botConfig[username].bot = await getBot(config, username);
  }

  if (config.bot.isLoggedIn) {
    config.bot.qrcodeUrl = null;
    botConfig[username].login = true;
    return res.send({ status: 'sueccess' });
  }

  if (config.bot.qrcodeUrl) {
    return res.send({ qrcodeUrl: config.bot.qrcodeUrl });
  }

  const timer = setInterval(async () => {
    if (config.bot.qrcodeUrl) {
      clearInterval(timer);
      return res.send({ qrcodeUrl: config.bot.qrcodeUrl });
    }
  }, 1 * 1000);
})

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  const { address, port } = server.address();
  console.log(`Server is running: http://${address === '::' ? 'localhost' : address }:${port}`)
});