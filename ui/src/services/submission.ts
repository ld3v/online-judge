import { TSubmissionSearchQuery } from '@/types/submission';
import request from '@/utils/request';

export const getSubmission = ({ assignmentId, accountId, page, limit }: TSubmissionSearchQuery) => {
  return request('/submission', {
    params: {
      assignmentId,
      accountId,
      page,
      limit,
    },
  });
};

export const getSubmissionStatusById = (id: string) => {
  return request(`/submission/${id}/status`);
};

export const getSubmissionCodeById = (id: string) => {
  return request(`/submission/${id}/code`);
};

export const submitCode = ({ assignmentId, problemId, languageExtension, code }: any) => {
  return request.post('/submission', {
    data: {
      assignmentId,
      problemId,
      languageExtension,
      code,
    },
  });
};
