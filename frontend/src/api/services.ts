import axiosInstance from './axiosInstance';

// Auth service
export const authService = {
  register: async (name: string, email: string, password: string) => {
    const response = await axiosInstance.post('/auth/register', {
      name,
      email,
      password
    });
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/login-json', {
      email,
      password
    });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
  
  refreshToken: async () => {
    const response = await axiosInstance.post('/auth/refresh-token');
    return response.data;
  }
};

// Helper function to convert camelCase to snake_case for backend
const convertToSnakeCase = (obj: Record<string, any>) => {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  });
  
  return result;
};

// Helper function to convert snake_case to camelCase for frontend
const convertToCamelCase = (obj: Record<string, any>) => {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  });
  
  return result;
};

// Health records service
export const healthRecordsService = {
  getAllForCurrentUser: async () => {
    const response = await axiosInstance.get('/health-records');
    return response.data.map((record: any) => ({
      id: record.id,
      userId: record.user_id,
      height: record.height,
      weight: record.weight,
      heartRate: record.heart_rate,
      bloodPressureSystolic: record.blood_pressure_systolic,
      bloodPressureDiastolic: record.blood_pressure_diastolic,
      symptoms: record.symptoms,
      date: record.created_at,
      createdAt: record.created_at
    }));
  },
  
  getById: async (id: string) => {
    const response = await axiosInstance.get(`/health-records/${id}`);
    const record = response.data;
    return {
      id: record.id,
      userId: record.user_id,
      height: record.height,
      weight: record.weight,
      heartRate: record.heart_rate,
      bloodPressureSystolic: record.blood_pressure_systolic,
      bloodPressureDiastolic: record.blood_pressure_diastolic,
      symptoms: record.symptoms,
      date: record.created_at,
      createdAt: record.created_at
    };
  },
  
  create: async (record: {
    height: number;
    weight: number;
    heartRate: number;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    symptoms?: string;
  }) => {
    const snakeCaseRecord = {
      height: record.height,
      weight: record.weight,
      heart_rate: record.heartRate,
      blood_pressure_systolic: record.bloodPressureSystolic,
      blood_pressure_diastolic: record.bloodPressureDiastolic,
      symptoms: record.symptoms
    };
    
    const response = await axiosInstance.post('/health-records', snakeCaseRecord);
    const createdRecord = response.data;
    return {
      id: createdRecord.id,
      userId: createdRecord.user_id,
      height: createdRecord.height,
      weight: createdRecord.weight,
      heartRate: createdRecord.heart_rate,
      bloodPressureSystolic: createdRecord.blood_pressure_systolic,
      bloodPressureDiastolic: createdRecord.blood_pressure_diastolic,
      symptoms: createdRecord.symptoms,
      date: createdRecord.created_at,
      createdAt: createdRecord.created_at
    };
  },
  
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/health-records/${id}`);
    return response.data;
  },
  
  exportData: async () => {
    const response = await axiosInstance.get('/health-records/export');
    return response.data.map((record: any) => ({
      id: record.id,
      userId: record.user_id,
      height: record.height,
      weight: record.weight,
      heartRate: record.heart_rate,
      bloodPressureSystolic: record.blood_pressure_systolic,
      bloodPressureDiastolic: record.blood_pressure_diastolic,
      symptoms: record.symptoms,
      date: record.created_at,
      createdAt: record.created_at
    }));
  },
  
  importData: async (data: any[]) => {
    const snakeCaseData = data.map(record => ({
      height: record.height,
      weight: record.weight,
      heart_rate: record.heartRate,
      blood_pressure_systolic: record.bloodPressureSystolic,
      blood_pressure_diastolic: record.bloodPressureDiastolic,
      symptoms: record.symptoms,
      created_at: record.date || record.createdAt
    }));
    
    const response = await axiosInstance.post('/health-records/import', snakeCaseData);
    return response.data;
  }
};

// Admin service
export const adminService = {
  getAllUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },
  
  getUserHealthRecords: async (userId: string) => {
    const response = await axiosInstance.get(`/admin/users/${userId}/health-records`);
    return response.data.map((record: any) => ({
      id: record.id,
      userId: record.user_id,
      height: record.height,
      weight: record.weight,
      heartRate: record.heart_rate,
      bloodPressureSystolic: record.blood_pressure_systolic,
      bloodPressureDiastolic: record.blood_pressure_diastolic,
      symptoms: record.symptoms,
      date: record.created_at,
      createdAt: record.created_at
    }));
  },
  
  deleteUser: async (userId: string) => {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  },
  
  deleteHealthRecord: async (recordId: string) => {
    const response = await axiosInstance.delete(`/health-records/${recordId}`);
    return response.data;
  }
};

// Analytics service
export const analyticsService = {
  getSummary: async () => {
    const response = await axiosInstance.get('/analytics/summary');
    return response.data;
  }
}; 