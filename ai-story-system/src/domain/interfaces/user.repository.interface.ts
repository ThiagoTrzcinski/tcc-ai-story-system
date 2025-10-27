import { User } from '../entities/user.entity';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  passwordHash?: string;
  isActive?: boolean;
  lastLoginAt?: Date;
  emailVerifiedAt?: Date;
}

export interface UserSearchFilters {
  name?: string;
  email?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  lastLoginAfter?: Date;
  lastLoginBefore?: Date;
}

export interface PaginatedUserResult {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IUserRepository {
  // Basic CRUD operations
  create(data: CreateUserData): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: number, data: UpdateUserData): Promise<User | null>;
  delete(id: number): Promise<boolean>;

  // Search and pagination
  findAll(
    page?: number,
    limit?: number,
    filters?: UserSearchFilters,
  ): Promise<PaginatedUserResult>;

  searchUsers(
    searchTerm: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedUserResult>;

  // Specialized queries
  findActiveUsers(page?: number, limit?: number): Promise<PaginatedUserResult>;
  findInactiveUsers(page?: number, limit?: number): Promise<PaginatedUserResult>;
  findUnverifiedUsers(page?: number, limit?: number): Promise<PaginatedUserResult>;
  findRecentUsers(days: number): Promise<User[]>;

  // Email and authentication related
  emailExists(email: string, excludeUserId?: number): Promise<boolean>;
  markEmailAsVerified(id: number): Promise<User | null>;
  updateLastLogin(id: number): Promise<User | null>;

  // Bulk operations
  deactivateUsers(userIds: number[]): Promise<number>; // Returns count of affected users
  activateUsers(userIds: number[]): Promise<number>; // Returns count of affected users
  deleteInactiveUsers(inactiveDays: number): Promise<number>; // Returns count of deleted users

  // Statistics
  getUserCount(): Promise<number>;
  getActiveUserCount(): Promise<number>;
  getVerifiedUserCount(): Promise<number>;
  getUserRegistrationStats(days: number): Promise<{
    date: string;
    count: number;
  }[]>;
}
