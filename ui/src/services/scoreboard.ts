import request from '@/utils/request';

export const getScoreboard = () => {
  return request('/scoreboard');
};
