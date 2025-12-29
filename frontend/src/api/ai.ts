import request from '../utils/request';

export interface ChatMessage {
    sender: 'patient' | 'doctor';
    content: string;
    timestamp?: string;
}

export interface ConsultResponse {
    reply: string;
    provider: string;
}

export const tcmConsult = (message: string, history: ChatMessage[]) => {
    return request<any, ConsultResponse>({
        url: '/ai/tcm-consult',
        method: 'POST',
        data: {
            message,
            history
        }
    });
};
