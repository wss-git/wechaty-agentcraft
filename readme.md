创建一个简单的Node.js HTTP服务器，并实现登录验证和基于会话（session）的路由保护功能需要几个步骤。这里是一个基本示例，使用Express框架和express-session中间件来处理用户登录和页面重定向逻辑。为了简化演示，我们将模拟一个用户名/密码对（实际应用中应替换为数据库查询）。首先，请确保已安装了必要的依赖包：npm install express express-session body-parser
然后，您可以使用以下代码作为基础：

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();

// 设置session
app.use(session({
  secret: 'your-secret-key', // 替换为您的密钥
  resave: false,
  saveUninitialized: true,
}));

app.use(bodyParser.urlencoded({ extended: false }));

// 模拟用户账户数据
const users = {
  'username': 'password',
};

// 登录页面
app.get('/login', (req, res) => {
  if (req.session.loggedin) {
    res.redirect('/setting'); // 如果已登录，则直接跳转至设置页
  } else {
    res.send(`
      <form action="/login" method="post">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required><br>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required><br>
        <button type="submit">Login</button>
      </form>
    `);
  }
});

// 处理登录请求
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (users[username] === password) {
    req.session.loggedin = true;
    req.session.username = username;
    res.redirect('/setting');
  } else {
    res.status(401).send('Invalid username or password');
  }
});

// 设置页面，检查用户是否已登录
app.get('/setting', (req, res) => {
  if (req.session.loggedin) {
    res.send(`Welcome to the settings page, ${req.session.username}!`);
  } else {
    res.redirect('/login'); // 用户未登录时重定向至登录页
  }
});

// 添加登出功能
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
请注意，上述示例并未涵盖任何前端样式和错误处理机制，且密码明文存储极其不安全，仅作演示用途。在实际项目中，您应该使用更安全的方法来处理用户认证，如bcrypt对密码进行加密存储，并配合HTTPS提供安全保障。此外，前端部分可以使用HTML、CSS和JavaScript构建更完善的登录界面。