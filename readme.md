## 简介

丐版项目，主要是体验个人微信和AI的对接

## 项目启动

### 启动服务

```shell
npm install
# 调试：会检测文件变化
npm run dev
npm run start 
```
### 启动UI

```shell
cd views
npm install
npm run start
```

> 登陆账号和密码 agentcraft / agentcraft

## 项目打包

```shell
cd views
npm run build
cd ..
node main
```

## 待完善功能

> 也可能不会完善

+ [x] 微信登陆能力
+ [x] 微信消息对接AI并自动回复
+ [ ] 聊天信息同步到页面
+ [ ] UI 样式优化
+ [ ] 接入数据库的能力
