import type { TAccount, TAccountSearchQuery } from '@/types/account';
import request from '@/utils/request';

export const currentAccount: () => Promise<TAccount | undefined> = () => {
  return request.get('/accounts/me');
};
export const get = ({ keyword, except, page, limit, role }: TAccountSearchQuery) => {
  return request.get('/accounts', {
    params: {
      keyword: keyword || '',
      except: except?.join(',') || '',
      page,
      limit,
      role,
    }
  });
};

export const getAccountById = (id: string) => {
  return request.get(`/accounts/${id}`);
};

export const updateAccountById = (id: string, data: any) => {
  return request.patch(`/accounts/${id}`, {
    data
  });
};

export const updateAccountState = (id: string, state: 'lock' | 'unlock', reason?: string) => {
  return request.patch(`/accounts/${id}/_/${state}`, {
    data: {
      reason
    }
  });
};