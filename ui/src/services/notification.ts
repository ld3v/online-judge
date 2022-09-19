import request from '@/utils/request';

export const getAll = () => {
  return request('/notification');
};

export const create = (data: any): Promise<any> => {
  return request.post('/notification', {
    data,
  });
};
