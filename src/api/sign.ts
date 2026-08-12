import request from './request';
import type {
  ApiResponse,
  SignRecord,
  SignResponse,
  SignQuery,
  PageResponse,
  DashboardData,
  MemberCard,
} from '../types';

export interface SignDTO {
  card_no?: string;
  member_id?: number;
}

// 签到
export const sign = (data: SignDTO) => {
  return request.post<ApiResponse<SignResponse>>('/signs', data);
};

// 获取签到记录列表
export const getSignList = (params: SignQuery) => {
  return request.get<ApiResponse<PageResponse<SignRecord>>>('/signs', { params });
};

// 获取仪表盘数据
export const getDashboard = () => {
  return request.get<ApiResponse<DashboardData>>('/statistics/dashboard');
};

// 获取即将到期会员卡列表
export const getExpiringSoon = (params?: { days?: number; page?: number; page_size?: number }) => {
  return request.get<ApiResponse<PageResponse<MemberCard>>>('/statistics/expiring-soon', { params });
};
