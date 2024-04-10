const axios = require('axios');
const request = axios.create({
    baseURL: process.env.baseUrl || '',
    headers: {
        'Authorization': `Bearer ${process.env.token || ''}`,
        'Content-Type': 'application/json'
    }
});

// 响应拦截器, 处理服务端的异常
request.interceptors.response.use(
    response => {
        return Promise.resolve(response);
    },
    error => {
        if (error.response.status) {
            console.log('from backend server:', error);
            const { status, data } = error.response;
            return Promise.resolve({ status, data: { code: status, message: data.detail } });
        }
    }
);

async function reply(question) {
    let _content = '';
    const agentType = process.env.agentType || 'knowledgeBase';
    let version = agentType === 'knowledgeBase' ? 'v1' : 'v2';
    let data = {}
    try {
        const result = await request.post(`/${version}/chat/completions`, {
            "messages": [{
                "role": "user",
                "content": question
            }],
            "stream": false,
            "max_tokens": 1024
        });
        data = result.data;
        _content = data.choices[0].message.content;
    } catch (e) {
        console.log(e.message + `/${version}/chat/completions` + JSON.stringify(data));
    }
    return _content;
};

module.exports = reply;
