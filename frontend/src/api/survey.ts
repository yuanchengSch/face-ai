import request from '../utils/request';

export interface SurveyAnswer {
    [key: string]: number;
}

export interface Survey {
    id: number;
    patient_id: number;
    survey_type: string;
    answers: SurveyAnswer;
    score: number;
    summary_advice: string;
    created_at: string;
}

export interface SurveyCreate {
    patient_id: number;
    survey_type: string;
    answers: SurveyAnswer;
}

// 提交问卷
export const submitSurvey = (data: SurveyCreate) => {
    return request<any, Survey>({
        url: '/surveys',
        method: 'POST',
        data
    });
};

// 获取患者问卷历史
export const getPatientSurveys = (patientId: number) => {
    return request<any, Survey[]>({
        url: '/surveys',
        method: 'GET',
        params: { patient_id: patientId }
    });
};
