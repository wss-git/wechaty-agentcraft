import { Form, Input, Button, Flex } from 'antd';
import { useNavigate } from 'react-router-dom';
import request from '../../utils/request';

const LoginForm = () => {
  const navigate = useNavigate();

  const onFinish = async (body: any) => {
    // 这里处理登录逻辑，如调用API
    const { ok } = await request('/api/login', { method: 'post', body }) as any;
    if (ok) {
      navigate('/');
    }
  };

  return (
    <Flex style={{
      width: '100%',
      height: '100%',
    }} justify="center" align="center">
      <Form
        onFinish={onFinish}
        layout="vertical"
        style={{
          maxWidth: 300,
          margin: 'auto',
          background: '#f5f5f5',
          padding: '70px',
          borderRadius: '5px'
        }}
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '请输入用户名！' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: '请输入密码！' }]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            登录
          </Button>
        </Form.Item>
      </Form>
    </Flex>
  );
};

export default LoginForm;