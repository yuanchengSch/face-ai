import axios from 'axios';
import { Message } from '@arco-design/web-react';

const request = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    timeout: 30000,
});

// 请求拦截器 - 添加 Token
request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const status = error.response?.status;
        const msg = error.response?.data?.detail || error.message || 'Request Error';

        // 401 未授权 - 跳转登录
        if (status === 401) {
            localStorage.removeItem('access_token');
            // 如果不在登录页，跳转到登录页
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        // 404 是正常的"无数据"状态，不显示错误提示
        // Network Error 可能是初始加载，也不显示
        // 其他错误才显示提示
        if (status !== 404 && msg !== 'Network Error') {
            Message.error(msg);
        }

        return Promise.reject(error);
    }
);

export default request;
