// API 响应类型定义

// 统一响应格式
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 分页响应
export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// 管理员类型
export interface Admin {
  id: number;
  username: string;
  nickname: string;
  role: number;
  role_text: string;
}

// 登录响应（双 token）
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expire_at: number;
  admin: Admin;
}

// 会员类型
export interface Member {
  id: number;
  name: string;
  phone: string;
  gender: number;
  birthday?: string;
  status: number;
  status_text?: string;
  created_at: string;
  updated_at?: string;
}

// 会员详情
export interface MemberDetail extends Member {
  cards: MemberCardSimple[];
}

// 会员卡简单信息
export interface MemberCardSimple {
  id: number;
  card_no: string;
  card_type_name: string;
  card_type: number;
  remain_days?: number;
  remain_count?: number;
  expire_date?: string;
  status: number;
  status_text: string;
}

// 卡种类型
export interface CardType {
  id: number;
  name: string;
  card_type: number;
  card_type_text?: string;
  valid_days?: number;
  valid_count?: number;
  price: number;
  description?: string;
  status: number;
  status_text?: string;
  created_at: string;
  updated_at?: string;
}

// 会员卡类型
export interface MemberCard {
  id: number;
  member_id: number;
  card_type_id: number;
  card_no: string;
  card_type: number;
  card_type_text?: string;
  valid_days?: number;
  valid_count?: number;
  remain_days?: number;
  remain_count?: number;
  buy_price?: number;
  start_date?: string;
  expire_date?: string;
  status: number;
  status_text?: string;
  created_at: string;
  member?: Member;
  card_type_info?: CardType;
}

// 签到记录类型
export interface SignRecord {
  id: number;
  member_id: number;
  member_card_id: number;
  sign_time: string;
  operator_id?: number;
  created_at: string;
  member?: Member;
  member_card?: MemberCard;
}

// 签到响应
export interface SignResponse {
  member_name: string;
  card_no: string;
  card_type: number;
  card_type_name: string;
  remain_days?: number;
  remain_count?: number;
  expire_date?: string;
  sign_time: string;
}

// 交易记录类型
export interface Transaction {
  id: number;
  member_id: number;
  member_card_id?: number;
  tx_type: number;
  tx_type_text?: string;
  amount: number;
  balance?: number;
  remark?: string;
  operator_id?: number;
  created_at: string;
  member?: Member;
  member_card?: MemberCard;
}

// 仪表盘数据
export interface DashboardData {
  today_sign_count: number;
  today_new_members: number;
  expiring_soon: number;
  month_revenue: number;
  total_members: number;
  active_members: number;
  online_count: number;
  week_sign_trend: number[];
}

// 在线会话
export interface OnlineSession {
  jti: string;
  device: string;
  device_text: string;
  login_time: string;
  expire_at: string;
  remain_sec: number;
  ip: string;
  is_current: boolean;
}

// 在线用户
export interface OnlineUser {
  admin_id: number;
  username: string;
  nickname: string;
  role: number;
  role_text: string;
  sessions: OnlineSession[];
}

// 在线列表响应
export interface OnlineListResponse {
  total_users: number;
  total_sessions: number;
  list: OnlineUser[];
}

// 角色
export interface Role {
  id: number;
  name: string;
  code: string;
  remark?: string;
  created_at: string;
  updated_at?: string;
  permission_ids: number[];
}

// 员工
export interface Staff {
  id: number;
  username: string;
  nickname: string;
  role: number;
  role_text: string;
  status: number;
  status_text: string;
  created_at: string;
}

// 操作日志
export interface OperationLog {
  id: number;
  admin_id: number;
  admin_name: string;
  module: string;
  action: string;
  resource_id: number;
  detail: string;
  ip: string;
  created_at: string;
}

// 权限
export interface Permission {
  id: number;
  code: string;
  name: string;
  module: string;
  created_at: string;
}

// 查询参数类型
export interface MemberQuery {
  page?: number;
  page_size?: number;
  name?: string;
  phone?: string;
  status?: number;
}

export interface CardTypeQuery {
  status?: number;
}

export interface MemberCardQuery {
  page?: number;
  page_size?: number;
  member_id?: number;
  status?: number;
}

export interface SignQuery {
  page?: number;
  page_size?: number;
  member_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface TransactionQuery {
  page?: number;
  page_size?: number;
  member_id?: number;
  tx_type?: number;
  start_date?: string;
  end_date?: string;
}
