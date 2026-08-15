import request from './request';
import type { ApiResponse } from '../types';

export const getSettings = () => {
  return request.get<ApiResponse<Record<string, string>>>('/settings');
};

export const updateSettings = (data: Record<string, string>) => {
  return request.put<ApiResponse<any>>('/settings', data);
};
