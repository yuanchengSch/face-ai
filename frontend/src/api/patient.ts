import request from '../utils/request';

export interface Patient {
    id: number;
    full_name: string;
    gender: string;
    phone: string;
    age: number;
    avatar?: string;
    level: string;
    total_consumption: number;
    last_visit_at?: string;
    notes?: string;
}

export interface PatientFilter {
    search?: string;
    gender?: string;
    level?: string;
}

export const getPatients = async (filter?: PatientFilter): Promise<Patient[]> => {
    const params = new URLSearchParams();
    if (filter?.search) params.append('search', filter.search);
    if (filter?.gender) params.append('gender', filter.gender);
    if (filter?.level) params.append('level', filter.level);

    const queryString = params.toString();
    return request.get(`/patients/${queryString ? `?${queryString}` : ''}`);
};

export const getPatient = async (id: number): Promise<Patient> => {
    return request.get(`/patients/${id}`);
};

export const createPatient = async (data: Partial<Patient>): Promise<Patient> => {
    return request.post('/patients/', data);
};
