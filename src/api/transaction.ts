import request from './request';
import type {
  ApiResponse,
  Transaction,
  TransactionQuery,
  PageResponse,
} from '../types';

export interface RechargeDTO {
  member_id: number;
  member_card_id?: number;
  amount: number;
  remark?: string;
}

export interface ConsumeDTO {
  member_id: number;
  member_card_id?: number;
  amount: number;
  remark?: string;
}

export interface RefundDTO {
  member_id: number;
  member_card_id?: number;
  amount: number;
  remark?: string;
}

// 充值
export const recharge = (data: RechargeDTO) => {
  return request.post<ApiResponse<Transaction>>('/transactions/recharge', data);
};

// 消费扣款
export const consume = (data: ConsumeDTO) => {
  return request.post<ApiResponse<Transaction>>('/transactions/consume', data);
};

// 退款
export const refund = (data: RefundDTO) => {
  return request.post<ApiResponse<Transaction>>('/transactions/refund', data);
};

// 获取交易记录列表
export const getTransactionList = (params: TransactionQuery) => {
  return request.get<ApiResponse<PageResponse<Transaction>>>('/transactions', { params });
};
