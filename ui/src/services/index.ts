import request from '@/utils/request';

export const getConfigurations = () => {
  return request('/configs');
};
