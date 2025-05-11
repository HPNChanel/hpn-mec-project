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
    const response = await axiosInstance.post('/auth/login', {
      email,
      password
    });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  }
};

// Health records service
export const healthRecordsService = {
  getAllForCurrentUser: async () => {
    const response = await axiosInstance.get('/health-records');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await axiosInstance.get(`/health-records/${id}`);
    return response.data;
  },
  
  create: async (record: {
    height: number;
    weight: number;
    heartRate: number;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    symptoms?: string;
  }) => {
    const response = await axiosInstance.post('/health-records', record);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/health-records/${id}`);
    return response.data;
  },
  
  exportData: async () => {
    const response = await axiosInstance.get('/health-records/export');
    return response.data;
  },
  
  importData: async (data: any) => {
    const response = await axiosInstance.post('/health-records/import', data);
    return response.data;
  }
};

// Admin service
export const adminService = {
  getAllUsers: async () => {
    const response = await axiosInstance.get('/users');
    return response.data;
  },
  
  getUserHealthRecords: async (userId: string) => {
    const response = await axiosInstance.get(`/users/${userId}/health-records`);
    return response.data;
  },
  
  deleteUser: async (userId: string) => {
    const response = await axiosInstance.delete(`/users/${userId}`);
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