import { useEffect, useReducer, useState } from "react"
import { Button, Typography, Form, Modal } from 'antd';

import request from "../../utils/request"

const { Title } = Typography;


const Index = () => {
  const [qrcodeUrl, setQrcodeUrl] = useState('');
  const [state, dispatch]: any = useReducer(
    (preState: {}, nextState: {}) => ({ ...preState, ...nextState }),
    {},
  );

  useEffect(() => {
    getSettingConfig();
  }, []);

  const getSettingConfig = async () => {
    const { ok, body } = await request('/api/config');
    if (!ok) {
      return;
    }
    dispatch(body)
  }

  const onLogin = async () => {
    dispatch({ loginLoading: true });
    const { ok, body } = await request(`/api/login`)
    if (ok) {
      setQrcodeUrl(body?.qrcodeUrl);
      if (body?.qrcodeUrl) {
        await new Promise(r => setTimeout(r, 1000));
        await onLogin();
        return;
      }
      dispatch({ login: true });
    }
    dispatch({ loginLoading: false });
  }

  const onLogout = async () => {
    dispatch({ loginLoading: true });
    const res = await request(`/api/logout`)
    if (res.ok) {
      dispatch({ login: false });
    }
    dispatch({ loginLoading: false });
  }

  const onAutoReply = async () => {
    dispatch({ onAutoReplyLoading: true });
    const nextAutoReply = !state.autoReply;
    const res = await request(`/api/auto-reply?autoReply=${nextAutoReply}`)
    if (res.ok) {
      dispatch({autoReply: nextAutoReply});
    }
    dispatch({ onAutoReplyLoading: false });
  }

  return (
    <>
      <Title level={2}>功能管理</Title>
      <Form
        labelCol={{ span: 4 }}
      >
        <Form.Item label={`微信状态(${state.login ? '已登陆' : '未登陆'})`}>
          {!state.login ? (
            <Button
              loading={state.loginLoading}
              onClick={onLogin}
              type="primary"
            >登陆</Button>
          ) : (
              <Button
                loading={state.loginLoading}
                onClick={onLogout}
                type="primary"
                danger
              >退出</Button>
          )}
        </Form.Item>
        <Form.Item label='自动回复'>
          <Button
            loading={state.onAutoReplyLoading}
            onClick={onAutoReply}
            type="primary"
            danger={state.autoReply}
          >{!state.autoReply ? '开启' : '关闭'}</Button>
        </Form.Item>
      </Form>
      <Modal title="登陆" open={!!qrcodeUrl} footer={null} width={260}>
        <img style={{ width: '200px', height: '200px' }} src={qrcodeUrl} alt="qrcode" />
      </Modal>
    </>
  )
}

export default Index;