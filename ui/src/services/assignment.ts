import { TAssignment, TAssignmentCoefficientRule, TAssignmentSearchQuery } from '@/types/assignment';
import request from '@/utils/request';
import moment from 'moment';

export const getCoefficient = ({ rule, start, finish, extra }: TAssignmentCoefficientRule) => {
  return request('/assignment/coefficient', {
    params: {
      rule,
      start: moment(start).format('YYYY-MM-DD HH:mm:ss'),
      finish: !!finish && moment(finish).format('YYYY-MM-DD HH:mm:ss'),
      extra: extra || 0
    }
  })
}

export const getAllAssignments = ({ keyword, except, page, limit, sorter_field, sorter_type }: TAssignmentSearchQuery): Promise<{ data: TAssignment[], total: number }> => {
  return request('/assignment', {
    params: {
      keyword: keyword || '',
      except: except?.join(',') || '',
      page,
      limit,
      sorter_field,
      sorter_type,
    },
  });
};

export const createAssignment = (data: any): Promise<TAssignment> => {
  return request.post('/assignment', {
    data,
  });
};

export const updateAssignment = (id: string, data: any): Promise<TAssignment> => {
  return request.patch(`/assignment/${id}`, {
    data,
  });
};

export const deleteAssignment = (id: string): Promise<boolean> => {
  return request.delete(`/assignment/${id}`);
};

export const getAssignmentProblems = (id: string): Promise<{ assignment: TAssignment, problems: any[] }> => {
  return request.get(`/assignment/${id}/problems`);
};

export const getAssignmentById = (id: string): Promise<TAssignment> => {
  return request.get(`/assignment/${id}`);
};

export const setAssignmentIdSelected = (id: string): Promise<boolean> => {
  return request.patch(`/assignment/${id}/set-selected`);
};
