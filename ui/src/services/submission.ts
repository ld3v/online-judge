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
