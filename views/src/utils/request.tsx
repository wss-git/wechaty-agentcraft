import history from 'history/browser';
import { message } from 'antd';

interface FetchOptions {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';
  headers?: Record<string, string>;
  body?: any;
}

// const baseUrl = 'http://localhost:8080';

async function request(url: string, {
  method,
  headers = {},
  body
}: FetchOptions = { method: 'get' }): Promise<Record<string, any>> {

  // 处理请求
  const payload = {
    method,
    headers: {
      credentials: 'include',
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  };
  if ((method === 'post' || method === 'put') && body) {
    // @ts-ignore
    payload.body = JSON.stringify(body);
  }

  const response = await fetch(url, payload);
  const { ok, status } = response;

  try {
    const jsonResponse = await response.json();

    // 处理响应
    if (ok) {
      return { ok, status, body: jsonResponse };
    }

    if (status === 403) {
      history.push('/login', { fetchStatus: 403 })
      return {};
    }
    message.error(jsonResponse.message);

    return { ok, status, body: jsonResponse };
  } catch (error) {
    throw error;
  }
}

export default request;
