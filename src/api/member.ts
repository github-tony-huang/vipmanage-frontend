import request from './request';
import type {
  ApiResponse,
  LoginResponse,
  Member,
  MemberDetail,
  MemberQuery,
  PageResponse,
} from '../types';

export interface LoginDTO {
  username: string;
  password: string;
}

export interface CreateMemberDTO {
  name: string;
  phone: string;
  gender?: number;
  birthday?: string;
}

export interface UpdateMemberDTO {
  name?: string;
  phone?: string;
  gender?: number;
  birthday?: string;
}

// 管理员登录
export const login = (data: LoginDTO) => {
  return request.post<ApiResponse<LoginResponse>>('/admin/login', data);
};

// 获取管理员信息
export const getAdminInfo = () => {
  return request.get<ApiResponse<any>>('/admin/info');
};

// 获取会员列表
export const getMemberList = (params: MemberQuery) => {
  return request.get<ApiResponse<PageResponse<Member>>>('/members', { params });
};

// 获取会员详情
export const getMemberDetail = (id: number) => {
  return request.get<ApiResponse<MemberDetail>>(`/members/${id}`);
};

// 创建会员
export const createMember = (data: CreateMemberDTO) => {
  return request.post<ApiResponse<Member>>('/members', data);
};

// 更新会员
export const updateMember = (id: number, data: UpdateMemberDTO) => {
  return request.put<ApiResponse<Member>>(`/members/${id}`, data);
};

// 删除会员
export const deleteMember = (id: number) => {
  return request.delete<ApiResponse<any>>(`/members/${id}`);
};

// 冻结会员
export const freezeMember = (id: number) => {
  return request.post<ApiResponse<any>>(`/members/${id}/freeze`);
};

// 解冻会员
export const unfreezeMember = (id: number) => {
  return request.post<ApiResponse<any>>(`/members/${id}/unfreeze`);
};
