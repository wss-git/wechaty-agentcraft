const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use('/api', createProxyMiddleware({
    target: 'http://0.0.0.0:8080/api',
    changeOrigin: true,
    ws: false,
  }));
};
