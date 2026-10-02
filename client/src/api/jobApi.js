import api from './axios';

export const getJobs = async (params) => {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null)
  );
  const response = await api.get('/jobs', { params: filteredParams });
  return response.data;
};

export const getJob = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await api.post('/jobs', jobData);
  return response.data;
};

export const updateJob = async (jobId, jobData) => {
  const response = await api.put(`/jobs/${jobId}`, jobData);
  return response.data;
};

export const deleteJob = async (jobId) => {
  const response = await api.delete(`/jobs/${jobId}`);
  return response.data;
};

export const publishJob = async (jobId) => {
  const response = await api.patch(`/jobs/${jobId}/publish`);
  return response.data;
};

export const closeJob = async (jobId) => {
  const response = await api.patch(`/jobs/${jobId}/close`);
  return response.data;
};
