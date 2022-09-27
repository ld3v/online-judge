import request from '@/utils/request';

export const getAllSettings = () => {
  return request('/settings');
};
export const checkRegisterAvailable = () => {
  return request('/settings/register-available');
};
export const syncSettings = () => {
  return request.post('/settings/sync');
};
export const updateSettings = (data: any) => {
  return request.patch('/settings', {
    data,
  })
}

// Sync all data
export const syncAllData = () => {
  return request.post('/settings/sync-data');
}
export const getSyncAllDataStatus = () => {
  return request('/settings/sync-data');
}

export const getJudgeURL = () => {
  return request.get('/settings/judge-url');
};