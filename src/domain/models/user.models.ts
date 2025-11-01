export interface UserData {
  userId?: number;
  userName: string;
  name: string;
  lastName: string;
  locality: string;
  gender: string;
  age: number;
  email: string;
}

export interface UserPaginationResponse {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UsersResponse {
  users: UserData[];
  pagination: UserPaginationResponse;
}

export interface UserCountsResponse {
  users: number;
  records: number;
}
