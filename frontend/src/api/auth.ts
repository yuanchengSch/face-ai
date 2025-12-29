import request from '../utils/request';

export interface User {
    id: number;
    username: string;
    full_name: string;
    role: string;
    is_active: boolean;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    return request.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
};

export const register = async (
    username: string,
    password: string,
    fullName: string
): Promise<User> => {
    return request.post('/auth/register', {
        username,
        password,
        full_name: fullName,
        role: 'consultant'
    });
};

export const getCurrentUser = async (): Promise<User> => {
    return request.get('/auth/me');
};

export const initAdmin = async (): Promise<{ message: string; username: string }> => {
    return request.post('/auth/init-admin');
};

// Token 管理
export const setToken = (token: string) => {
    localStorage.setItem('access_token', token);
};

export const getToken = (): string | null => {
    return localStorage.getItem('access_token');
};

export const removeToken = () => {
    localStorage.removeItem('access_token');
};

export const isLoggedIn = (): boolean => {
    return !!getToken();
};
