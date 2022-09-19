import { TProblemSearchQuery } from '@/types/problem';
import request from '@/utils/request';

export const getAllProblems = ({ keyword, assignmentIds, langIds, except, page, limit }: TProblemSearchQuery) => {
  const otherQueryParams = {};
  if (assignmentIds) otherQueryParams['assignmentIds'] = assignmentIds;
  if (langIds) otherQueryParams['langIds'] = langIds;
  return request('/problem', {
    params: {
      keyword: keyword || '',
      except: except?.join(',') || '',
      page,
      limit,
      ...otherQueryParams
    },
  });
};

export const createProblem = (data: any) => {
  return request.post('/problem', {
    data,
  });
};

export const updateProblem = (id: string, data: any) => {
  return request.patch(`/problem/${id}`, {
    data,
  });
};

export const getProblemById = (id: string) => {
  return request(`/problem/${id}`);
}

export const deleteProblemById = (id: string) => {
  return request.delete(`/problem/${id}`);
}
