import api from './axios';

export const applyToJob = async (applicationData) => {
  const response = await api.post('/applications', applicationData);
  return response.data;
};

export const getMyApplications = async () => {
  const response = await api.get('/applications/my');
  return response.data;
};

export const getApplicationsForJob = async (jobId, params = {}) => {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null)
  );
  const response = await api.get(`/applications/job/${jobId}`, { params: filteredParams });
  return response.data;
};

export const getApplication = async (applicationId) => {
  const response = await api.get(`/applications/${applicationId}`);
  return response.data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await api.patch(`/applications/${applicationId}/status`, { status });
  return response.data;
};
