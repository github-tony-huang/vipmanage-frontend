import request from './request';
import type {
  ApiResponse,
  CardType,
  MemberCard,
  MemberCardQuery,
  PageResponse,
} from '../types';

export interface CreateCardTypeDTO {
  name: string;
  card_type: number;
  valid_days?: number;
  valid_count?: number;
  price: number;
  description?: string;
}

export interface UpdateCardTypeDTO {
  name?: string;
  card_type?: number;
  valid_days?: number;
  valid_count?: number;
  price?: number;
  description?: string;
  status?: number;
}

export interface IssueCardDTO {
  member_id: number;
  card_type_id: number;
  buy_price?: number;
}

// 获取卡种列表
export const getCardTypeList = (params?: { status?: number }) => {
  return request.get<ApiResponse<CardType[]>>('/card-types', { params });
};

// 获取卡种详情
export const getCardTypeDetail = (id: number) => {
  return request.get<ApiResponse<CardType>>(`/card-types/${id}`);
};

// 创建卡种
export const createCardType = (data: CreateCardTypeDTO) => {
  return request.post<ApiResponse<CardType>>('/card-types', data);
};

// 更新卡种
export const updateCardType = (id: number, data: UpdateCardTypeDTO) => {
  return request.put<ApiResponse<CardType>>(`/card-types/${id}`, data);
};

// 删除卡种
export const deleteCardType = (id: number) => {
  return request.delete<ApiResponse<any>>(`/card-types/${id}`);
};

// 获取会员卡列表
export const getMemberCardList = (params: MemberCardQuery) => {
  return request.get<ApiResponse<PageResponse<MemberCard>>>('/member-cards', { params });
};

// 获取会员卡详情
export const getMemberCardDetail = (id: number) => {
  return request.get<ApiResponse<MemberCard>>(`/member-cards/${id}`);
};

// 发放会员卡
export const issueMemberCard = (data: IssueCardDTO) => {
  return request.post<ApiResponse<MemberCard>>('/member-cards/issue', data);
};

// 冻结会员卡
export const freezeMemberCard = (id: number) => {
  return request.post<ApiResponse<any>>(`/member-cards/${id}/freeze`);
};

// 解冻会员卡
export const unfreezeMemberCard = (id: number) => {
  return request.post<ApiResponse<any>>(`/member-cards/${id}/unfreeze`);
};

// 退卡
export const refundMemberCard = (id: number, reason?: string) => {
  return request.post<ApiResponse<any>>(`/member-cards/${id}/refund`, { reason });
};
