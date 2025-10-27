import { User } from '../entities/user.entity';
import {
  PaginatedUserResult,
  UserSearchFilters,
} from './user.repository.interface';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserLoginResult {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface UserRegistrationResult {
  success: boolean;
  user?: User;
  message?: string;
  errors?: string[];
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface IUserService {
  // User registration and authentication
  registerUser(request: CreateUserRequest): Promise<UserRegistrationResult>;
  loginUser(request: UserLoginRequest): Promise<UserLoginResult>;

  // Basic CRUD operations
  createUser(request: CreateUserRequest): Promise<User>;
  getUserById(id: number): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: number, request: UpdateUserRequest): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;

  // Password management
  changePassword(
    userId: number,
    request: ChangePasswordRequest,
  ): Promise<boolean>;
  validatePassword(password: string): PasswordValidationResult;

  // User management
  activateUser(id: number): Promise<User | null>;
  deactivateUser(id: number): Promise<User | null>;
  markEmailAsVerified(id: number): Promise<User | null>;

  // Search and pagination
  getAllUsers(
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
  getActiveUsers(page?: number, limit?: number): Promise<PaginatedUserResult>;
  getInactiveUsers(page?: number, limit?: number): Promise<PaginatedUserResult>;
  getUnverifiedUsers(
    page?: number,
    limit?: number,
  ): Promise<PaginatedUserResult>;
  getRecentUsers(days: number): Promise<User[]>;

  // Validation
  validateEmail(email: string): boolean;
  emailExists(email: string, excludeUserId?: number): Promise<boolean>;
  validateUserData(request: CreateUserRequest | UpdateUserRequest): Promise<{
    isValid: boolean;
    errors: string[];
  }>;

  // Bulk operations
  bulkActivateUsers(userIds: number[]): Promise<number>;
  bulkDeactivateUsers(userIds: number[]): Promise<number>;
  cleanupInactiveUsers(inactiveDays: number): Promise<number>;

  // Statistics and reporting
  getUserStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    recentRegistrations: number;
  }>;

  getUserRegistrationTrend(days: number): Promise<
    {
      date: string;
      count: number;
    }[]
  >;

  // Security
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
}
