import request from '../utils/request';

export interface DashboardStats {
    total_patients: number;
    today_appointments: number;
    new_patients_this_month: number;
    conversion_rate: number;
}

export interface PendingItem {
    id: number;
    patient_id: number;
    patient_name: string;
    type: 'follow_up' | 'survey' | 'confirm_ai';
    title: string;
    due_date: string | null;
    priority: 'high' | 'medium' | 'low';
}

export interface JieqiReminder {
    current_jieqi: string;
    jieqi_date_range: string;
    risk_tips: string[];
    care_suggestions: string[];
    patients_to_adjust: Array<{
        id: number;
        name: string;
        reason: string;
    }>;
}

export interface RiskAlert {
    patient_id: number;
    patient_name: string;
    risk_type: 'inflammation_up' | 'satisfaction_down';
    change_value: number;
    period: '7d' | '30d';
}

export interface DashboardData {
    stats: DashboardStats;
    pending_items: PendingItem[];
    jieqi_reminder: JieqiReminder;
    risk_alerts: RiskAlert[];
}

export const getDashboard = async (): Promise<DashboardData> => {
    return request.get('/dashboard/');
};
