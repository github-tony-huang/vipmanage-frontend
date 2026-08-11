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

// 充值
export const recharge = (data: RechargeDTO) => {
  return request.post<ApiResponse<Transaction>>('/transactions/recharge', data);
};

// 获取交易记录列表
export const getTransactionList = (params: TransactionQuery) => {
  return request.get<ApiResponse<PageResponse<Transaction>>>('/transactions', { params });
};
