import { TProblemSearchQuery } from '@/types/problem';
import { JSON2FormData } from '@/utils/funcs';
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
  const formData = new FormData();
  JSON2FormData(data, undefined, formData);
  return request.post(`/problem`, {
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

export const updateProblem = (id: string, data: any) => {
  const formData = new FormData();
  JSON2FormData(data, undefined, formData);
  return request.patch(`/problem/${id}`, {
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

export const getProblemById = (id: string) => {
  return request(`/problem/${id}`);
}

export const deleteProblemById = (id: string) => {
  return request.delete(`/problem/${id}`);
}
