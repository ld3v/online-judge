import request from '@/utils/request';

export const getAllLangs = () => {
  return request('/language');
};
