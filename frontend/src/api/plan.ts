import request from '../utils/request';

export interface Plan {
    id: number;
    patient_id: number;
    goal: string;
    phases: Array<{
        phase: string;
        actions: Record<string, string[]>;
    }>;
    generated_at_jieqi: string;
}

export interface Survey {
    id: number;
    patient_id: number;
    survey_type: string;
    answers: Record<string, number | string>;
    score: number;
    summary_advice: string;
    created_at: string;
}

export interface SurveyCreate {
    patient_id: number;
    survey_type: string;
    answers: Record<string, number | string>;
}

export interface TimelineEvent {
    id: number;
    patient_id: number;
    event_type: string;
    title: string;
    description?: string;
    occurred_at: string;
}

export const generatePlan = async (patientId: number): Promise<Plan> => {
    return request.post('/plans', null, { params: { patient_id: patientId } });
};

export const getLatestPlan = async (patientId: number): Promise<Plan> => {
    return request.get('/plans/latest', { params: { patient_id: patientId } });
};

export const getTimeline = async (patientId: number): Promise<TimelineEvent[]> => {
    return request.get('/timeline/', { params: { patient_id: patientId } });
};

// Survey APIs
export const getSurveys = async (patientId: number): Promise<Survey[]> => {
    return request.get('/surveys', { params: { patient_id: patientId } });
};

export const submitSurvey = async (data: SurveyCreate): Promise<Survey> => {
    return request.post('/surveys', data);
};

