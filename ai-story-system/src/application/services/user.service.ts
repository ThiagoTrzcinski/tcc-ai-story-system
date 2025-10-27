import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { inject, injectable } from 'tsyringe';
import { User } from '../../domain/entities/user.entity';
import {
  IUserRepository,
  PaginatedUserResult,
  UserSearchFilters,
} from '../../domain/interfaces/user.repository.interface';
import {
  ChangePasswordRequest,
  CreateUserRequest,
  IUserService,
  PasswordValidationResult,
  UpdateUserRequest,
  UserLoginRequest,
  UserLoginResult,
  UserRegistrationResult,
} from '../../domain/interfaces/user.service.interface';

@injectable()
export class UserService implements IUserService {
  private readonly saltRounds = 12;
  private readonly jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  private readonly jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';

  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
  ) {}

  async registerUser(
    request: CreateUserRequest,
  ): Promise<UserRegistrationResult> {
    try {
      // Validate input data
      const validation = await this.validateUserData(request);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        };
      }

      // Check if email already exists
      const emailExists = await this.userRepository.emailExists(request.email);
      if (emailExists) {
        return {
          success: false,
          message: 'Email already exists',
          errors: ['A user with this email already exists'],
        };
      }

      // Hash password
      const passwordHash = await this.hashPassword(request.password);

      // Create user
      const user = await this.userRepository.create({
        name: request.name,
        email: request.email,
        passwordHash,
      });

      return {
        success: true,
        user,
        message: 'User registered successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Registration failed',
        errors: ['An unexpected error occurred during registration'],
      };
    }
  }

  async loginUser(request: UserLoginRequest): Promise<UserLoginResult> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(request.email);
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Check if user can login
      if (!user.canLogin()) {
        return {
          success: false,
          message: 'Account is inactive or email not verified',
        };
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(
        request.password,
        user.passwordHash,
      );
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Update last login
      const updatedUser = await this.userRepository.updateLastLogin(user.id);

      // Generate JWT token
      const token = jwt.sign({ id: user.id }, this.jwtSecret, {
        expiresIn: this.jwtExpiresIn,
      } as jwt.SignOptions);

      return {
        success: true,
        user: updatedUser || user,
        token,
        message: 'Login successful',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Login failed',
      };
    }
  }

  async createUser(request: CreateUserRequest): Promise<User> {
    const passwordHash = await this.hashPassword(request.password);

    return this.userRepository.create({
      name: request.name,
      email: request.email,
      passwordHash,
    });
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async updateUser(
    id: number,
    request: UpdateUserRequest,
  ): Promise<User | null> {
    // Validate email if provided
    if (request.email && !User.validateEmail(request.email)) {
      throw new Error('Invalid email format');
    }

    // Check if email already exists (excluding current user)
    if (request.email) {
      const emailExists = await this.userRepository.emailExists(
        request.email,
        id,
      );
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    // Validate name if provided
    if (request.name && !User.validateName(request.name)) {
      throw new Error('Name must be between 2 and 100 characters');
    }

    return this.userRepository.update(id, {
      name: request.name,
      email: request.email,
    });
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.userRepository.delete(id);
  }

  async changePassword(
    userId: number,
    request: ChangePasswordRequest,
  ): Promise<boolean> {
    try {
      // Get current user
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return false;
      }

      // Verify current password
      const isCurrentPasswordValid = await this.verifyPassword(
        request.currentPassword,
        user.passwordHash,
      );
      if (!isCurrentPasswordValid) {
        return false;
      }

      // Validate new password
      const passwordValidation = this.validatePassword(request.newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(request.newPassword);

      // Update password
      const updatedUser = await this.userRepository.update(userId, {
        passwordHash: newPasswordHash,
      });

      return !!updatedUser;
    } catch (error) {
      return false;
    }
  }

  validatePassword(password: string): PasswordValidationResult {
    return User.validatePassword(password);
  }

  async activateUser(id: number): Promise<User | null> {
    return this.userRepository.update(id, { isActive: true });
  }

  async deactivateUser(id: number): Promise<User | null> {
    return this.userRepository.update(id, { isActive: false });
  }

  async markEmailAsVerified(id: number): Promise<User | null> {
    return this.userRepository.markEmailAsVerified(id);
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    filters?: UserSearchFilters,
  ): Promise<PaginatedUserResult> {
    return this.userRepository.findAll(page, limit, filters);
  }

  async searchUsers(
    searchTerm: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedUserResult> {
    return this.userRepository.searchUsers(searchTerm, page, limit);
  }

  async getActiveUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedUserResult> {
    return this.userRepository.findActiveUsers(page, limit);
  }

  async getInactiveUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedUserResult> {
    return this.userRepository.findInactiveUsers(page, limit);
  }

  async getUnverifiedUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedUserResult> {
    return this.userRepository.findUnverifiedUsers(page, limit);
  }

  async getRecentUsers(days: number): Promise<User[]> {
    return this.userRepository.findRecentUsers(days);
  }

  validateEmail(email: string): boolean {
    return User.validateEmail(email);
  }

  async emailExists(email: string, excludeUserId?: number): Promise<boolean> {
    return this.userRepository.emailExists(email, excludeUserId);
  }

  async validateUserData(
    request: CreateUserRequest | UpdateUserRequest,
  ): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Validate name
    if ('name' in request && request.name) {
      if (!User.validateName(request.name)) {
        errors.push('Name must be between 2 and 100 characters');
      }
    }

    // Validate email
    if ('email' in request && request.email) {
      if (!User.validateEmail(request.email)) {
        errors.push('Invalid email format');
      }
    }

    // Validate password (only for CreateUserRequest)
    if ('password' in request && request.password) {
      const passwordValidation = User.validatePassword(request.password);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async bulkActivateUsers(userIds: number[]): Promise<number> {
    return this.userRepository.activateUsers(userIds);
  }

  async bulkDeactivateUsers(userIds: number[]): Promise<number> {
    return this.userRepository.deactivateUsers(userIds);
  }

  async cleanupInactiveUsers(inactiveDays: number): Promise<number> {
    return this.userRepository.deleteInactiveUsers(inactiveDays);
  }

  async getUserStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    recentRegistrations: number;
  }> {
    const [totalUsers, activeUsers, verifiedUsers, recentUsers] =
      await Promise.all([
        this.userRepository.getUserCount(),
        this.userRepository.getActiveUserCount(),
        this.userRepository.getVerifiedUserCount(),
        this.userRepository.findRecentUsers(7), // Last 7 days
      ]);

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      recentRegistrations: recentUsers.length,
    };
  }

  async getUserRegistrationTrend(days: number): Promise<
    {
      date: string;
      count: number;
    }[]
  > {
    return this.userRepository.getUserRegistrationStats(days);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
