import api from './axios';

export const getRecruiterDashboard = async () => {
  const response = await api.get('/dashboard/recruiter');
  return response.data;
};

export const getAdminDashboard = async () => {
  const response = await api.get('/dashboard/admin');
  return response.data;
};
