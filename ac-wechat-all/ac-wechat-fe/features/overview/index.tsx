import React, { useEffect, useState } from "react";

import { Avatar, Badge, Tabs, Paper, Slider, Blockquote, Switch, Text, LoadingOverlay, Select, Modal, Flex, Space, NumberInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useOverviewStore, updateSystemConfig } from 'store/overview';
import { IconInfoCircle } from '@tabler/icons-react';
import { getWebSocketUrl } from 'utils/index';
const relativePath = '/wechat'; // 你想要连接的WebSocket服务器的路径

const HEARTBEAT_INTERVAL = 5;
let ws: any;

export const enum ServerEventType {
  SCAN = 'scan',
  LOGIN = 'login',
  LOGOUT = 'logout',
  INFO = 'info'
}
function s(data: any) {
  return JSON.stringify(data);
}


function r(_data: any) {
  let data = {};
  try {
    data = JSON.parse(_data);
  } catch (e) {

  }
  return data;
}





function command(command: any, body?: any) {
  const data: any = {
    "type": "command",
    "command": command,
  }
  if (body) {
    data.body = body;
  }
  return data;
}


function sendHeartbeat() {
  ws && ws.send(s(command('heartbeat')));
}


function UserView({ user, isLogin, login, logout }: any) {
  const { systemConfig, setSystemConfig } = useOverviewStore();
  return <Flex align={'center'}>
    <Flex align={'center'}>
      <Avatar color="cyan" radius="xl" mr={4} >Wx</Avatar>
      <span>您好：{user}</span>
      <Switch
        ml={8}
        checked={systemConfig.autoReply === 'true'}
        onLabel="数字分身已开启"
        offLabel="数字分身已关闭"
        onChange={(event: any) => {
          let autoReply = event.currentTarget.checked ? 'true' : 'false';
          systemConfig.autoReply = autoReply;
          setSystemConfig(systemConfig);
          updateSystemConfig({ autoReply });
          if (ws && ws.send) {
            ws.send(s(command("reply", { autoReply })));
          }

        }
        }
      />
    </Flex>
    {
      isLogin ? <Badge onClick={logout} ml={124} style={{ cursor: 'pointer' }} color="pink">登出</Badge> : <Badge onClick={login} ml={4} style={{ cursor: 'pointer' }}>登录</Badge>
    }

  </Flex>
}


function UserMessage({ messages }: any) {
  const icon = <IconInfoCircle />;


  const { messageLimit, setMessageLimit, userMessageTab } = useOverviewStore();
  return <>
    <Flex align={'center'} mt={12} mb={24} >设置消息数量限制: <div style={{ width: 600, marginLeft: 12 }}><Slider defaultValue={messageLimit} labelAlwaysOn onChange={(value) => setMessageLimit(value)} /></div></Flex>
    <Tabs defaultValue="user" >
      <Tabs.List>
        <Tabs.Tab value="user">与我对话</Tabs.Tab>
        <Tabs.Tab value="robot">数字分身助手</Tabs.Tab>
        <Tabs.Tab value="group">群组</Tabs.Tab>
        <Tabs.Tab value="public">公众号</Tabs.Tab>
        <Tabs.Tab value="system">系统</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="user">
        {userMessageTab['user'].map((item: any, index: number) => {
          let color = 'blue';
          return <Blockquote color={color} cite={`– ${item.from}`} icon={icon} mt="xl" mb={12} key={`message${index}`}>
            {item.message}
          </Blockquote>
        })}
      </Tabs.Panel>
      <Tabs.Panel value="robot">

        {userMessageTab['robot'].map((item: any, index: number) => {
          let color = 'green';
          return <Blockquote color={color} cite={`– ${item.from}`} icon={icon} mt="xl" mb={12} key={`message${index}`}>
            {item.message}
          </Blockquote>
        })}
      </Tabs.Panel>
      <Tabs.Panel value="group">
        {userMessageTab['group'].map((item: any, index: number) => {
          let color = 'green';
          return <Blockquote color={color} cite={`– ${item.from}`} icon={icon} mt="xl" mb={12} key={`message${index}`}>
            {item.message}
          </Blockquote>
        })}
      </Tabs.Panel>
      <Tabs.Panel value="public">
        {userMessageTab['public'].map((item: any, index: number) => {
          let color = 'violet';
          return <Blockquote color={color} cite={`– ${item.from}`} icon={icon} mt="xl" mb={12} key={`message${index}`}>
            {item.message}
          </Blockquote>
        })}
      </Tabs.Panel>
      <Tabs.Panel value="system">
        {userMessageTab['system'].map((item: any, index: number) => {
          let color = 'red';
          return <Blockquote color={color} cite={`– ${item.from}`} icon={icon} mt="xl" mb={12} key={`message${index}`}>
            {item.message}
          </Blockquote>
        })}

      </Tabs.Panel>
    </Tabs>
  </>
}

export function OverView() {
  const { userMessages, qrCode, isLogin, user, qrCodeOpen, setQrCode, setUser, setQrCodeOpen, setIsLogin, setUserMessages, setUserMessageTab, systemConfig } = useOverviewStore();
  const { beServiceDomain } = systemConfig;
  let hertBeatInterval: any;

  function connectWs() {
    if (!ws && beServiceDomain) {
      const wsUrl = getWebSocketUrl(beServiceDomain, relativePath);
      ws = new WebSocket(wsUrl);
      // 连接打开时触发
      ws.onopen = () => {
        setQrCodeOpen(true);
        console.log('WebSocket connection opened');
        // 发送消息到服务器
        ws.send('Hello from client!');
        // 连接启动后开始进行生成认证二维码操作
        ws.send(s(command("start")));
        // hertBeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL * 1000);
      };

      // 接收到消息时触发
      ws.onmessage = (event: any) => {
        console.log('Message from server:', event.data);
        const data: any = r(event.data) || {};
        switch (data.event) {
          case ServerEventType.SCAN:
            if (data?.qrcodeImageUrl) {
              setQrCode(data?.qrcodeImageUrl)
            }
            break;
          case ServerEventType.LOGIN:
            if (data?.user) {
              setQrCodeOpen(false);
              setQrCode('');
              setIsLogin(true);
              setUser(data?.user);
            }
            break;
          case ServerEventType.LOGOUT:
            setIsLogin(false);
            break;
          case ServerEventType.INFO:
            delete data.event;
            setUserMessages(data);
            setUserMessageTab(data);
            break;
          default:
            break;
        }

      };

      // 发生错误时触发
      ws.onerror = (error: any) => {
        console.error('WebSocket error:', error);
        hertBeatInterval && clearInterval(hertBeatInterval);
      };

      // 连接关闭时触发
      ws.onclose = () => {
        console.log('WebSocket connection closed');
        hertBeatInterval && clearInterval(hertBeatInterval);
      };
    }

  }
  useEffect(() => {
    connectWs();

  }, [])

  const logoutConfirm = () => modals.openConfirmModal({
    title: '登出',
    children: (
      <Text size="sm">
        确定登出吗
      </Text>
    ),
    labels: { confirm: '确定', cancel: '取消' },
    onCancel: () => console.log('Cancel'),
    onConfirm: () => {
      ws && ws.send(s(command('stop')))
    },
  });
  return (
    <Paper>


      <Modal
        opened={qrCodeOpen}
        closeOnClickOutside={false}
        onClose={() => { setQrCodeOpen(false) }}
        withCloseButton={true}
        size={320}
        // yOffset="280"
        title="请扫描以下二维码登录微信"
      >
        <div style={{ position: 'relative', width: 220, height: 220, border: '1px solid #eee', margin: '0 auto' }}>
          <LoadingOverlay visible={!!!qrCode} />
          {qrCode && <img src={qrCode} style={{width: '100%',height: '100%'}}/>}
        </div>
      </Modal>
      {user ?
        <div style={{ marginTop: 24 }}>
          <UserView user={user} isLogin={isLogin} login={() => {
            ws && ws.send(s(command('start')));
            setQrCodeOpen(true);
          }} logout={() => logoutConfirm()} />
          <UserMessage messages={userMessages} />
        </div> : null
      }

    </Paper>
  );
}
