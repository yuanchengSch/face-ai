import request from '../utils/request';

export interface FaceExam {
    id: number;
    patient_id: number;
    image_url: string;
    image_hash?: string;
    image_width?: number;
    image_height?: number;
    status?: string;
    metrics: Record<string, number>;
    advice_summary: string;
    detailed_advice: string;
    ai_provider?: string;
    doctor_confirmed: boolean;
    doctor_notes?: string;
    doctor_confirmed_at?: string;
    created_at: string;
}

export const createFaceExam = async (patientId: number, imageUrl?: string, file?: File): Promise<FaceExam> => {
    const formData = new FormData();
    formData.append('patient_id', String(patientId));
    if (imageUrl) formData.append('image_url', imageUrl);
    if (file) formData.append('image_file', file);

    return request.post('/face-exams/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const getPatientExams = async (patientId: number): Promise<FaceExam[]> => {
    return request.get(`/face-exams/patient/${patientId}`);
};

export const confirmExam = async (examId: number, doctorNotes?: string): Promise<FaceExam> => {
    const formData = new FormData();
    if (doctorNotes) formData.append('doctor_notes', doctorNotes);

    return request.put(`/face-exams/${examId}/confirm`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const uploadImage = async (file: File): Promise<{
    file_path: string;
    file_url: string;
    hash: string;
    width: number;
    height: number;
    size_bytes: number;
    original_name: string;
    uploaded_at: string;
}> => {
    const formData = new FormData();
    formData.append('image_file', file);

    return request.post('/face-exams/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
