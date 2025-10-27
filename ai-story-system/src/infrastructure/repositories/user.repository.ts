import { injectable } from 'tsyringe';
import {
  Repository,
  DataSource,
  Between,
  MoreThan,
  LessThan,
  Like,
  In,
} from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { User } from '../../domain/entities/user.entity';
import {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
  UserSearchFilters,
  PaginatedUserResult,
} from '../../domain/interfaces/user.repository.interface';
import dataSource from '../../data-source';

@injectable()
export class UserRepository implements IUserRepository {
  private repository: Repository<UserEntity>;

  constructor() {
    this.repository = dataSource.getRepository(UserEntity);
  }

  async create(data: CreateUserData): Promise<User> {
    const userEntity = this.repository.create({
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
    });

    const savedEntity = await this.repository.save(userEntity);
    return this.mapEntityToDomain(savedEntity);
  }

  async findById(id: number): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.mapEntityToDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? this.mapEntityToDomain(entity) : null;
  }

  async update(id: number, data: UpdateUserData): Promise<User | null> {
    const updateData: Partial<UserEntity> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.passwordHash !== undefined)
      updateData.passwordHash = data.passwordHash;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.lastLoginAt !== undefined)
      updateData.lastLoginAt = data.lastLoginAt;
    if (data.emailVerifiedAt !== undefined)
      updateData.emailVerifiedAt = data.emailVerifiedAt;

    const result = await this.repository.update(id, updateData);

    if (result.affected === 0) {
      return null;
    }

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: UserSearchFilters,
  ): Promise<PaginatedUserResult> {
    const queryBuilder = this.repository.createQueryBuilder('user');

    // Apply filters
    if (filters) {
      if (filters.name) {
        queryBuilder.andWhere('user.name ILIKE :name', {
          name: `%${filters.name}%`,
        });
      }
      if (filters.email) {
        queryBuilder.andWhere('user.email ILIKE :email', {
          email: `%${filters.email}%`,
        });
      }
      if (filters.isActive !== undefined) {
        queryBuilder.andWhere('user.isActive = :isActive', {
          isActive: filters.isActive,
        });
      }
      if (filters.isEmailVerified !== undefined) {
        if (filters.isEmailVerified) {
          queryBuilder.andWhere('user.emailVerifiedAt IS NOT NULL');
        } else {
          queryBuilder.andWhere('user.emailVerifiedAt IS NULL');
        }
      }
      if (filters.createdAfter) {
        queryBuilder.andWhere('user.createdAt >= :createdAfter', {
          createdAfter: filters.createdAfter,
        });
      }
      if (filters.createdBefore) {
        queryBuilder.andWhere('user.createdAt <= :createdBefore', {
          createdBefore: filters.createdBefore,
        });
      }
      if (filters.lastLoginAfter) {
        queryBuilder.andWhere('user.lastLoginAt >= :lastLoginAfter', {
          lastLoginAfter: filters.lastLoginAfter,
        });
      }
      if (filters.lastLoginBefore) {
        queryBuilder.andWhere('user.lastLoginAt <= :lastLoginBefore', {
          lastLoginBefore: filters.lastLoginBefore,
        });
      }
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Order by creation date (newest first)
    queryBuilder.orderBy('user.createdAt', 'DESC');

    const [entities, total] = await queryBuilder.getManyAndCount();
    const users = entities.map((entity) => this.mapEntityToDomain(entity));

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async searchUsers(
    searchTerm: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedUserResult> {
    const queryBuilder = this.repository.createQueryBuilder('user');

    queryBuilder.where(
      '(user.name ILIKE :searchTerm OR user.email ILIKE :searchTerm)',
      { searchTerm: `%${searchTerm}%` },
    );

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    queryBuilder.orderBy('user.createdAt', 'DESC');

    const [entities, total] = await queryBuilder.getManyAndCount();
    const users = entities.map((entity) => this.mapEntityToDomain(entity));

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findActiveUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedUserResult> {
    return this.findAll(page, limit, { isActive: true });
  }

  async findInactiveUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedUserResult> {
    return this.findAll(page, limit, { isActive: false });
  }

  async findUnverifiedUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedUserResult> {
    return this.findAll(page, limit, { isEmailVerified: false });
  }

  async findRecentUsers(days: number): Promise<User[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const entities = await this.repository.find({
      where: { createdAt: MoreThan(cutoffDate) },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.mapEntityToDomain(entity));
  }

  async emailExists(email: string, excludeUserId?: number): Promise<boolean> {
    const queryBuilder = this.repository.createQueryBuilder('user');
    queryBuilder.where('user.email = :email', { email });

    if (excludeUserId) {
      queryBuilder.andWhere('user.id != :excludeUserId', { excludeUserId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  async markEmailAsVerified(id: number): Promise<User | null> {
    return this.update(id, { emailVerifiedAt: new Date() });
  }

  async updateLastLogin(id: number): Promise<User | null> {
    return this.update(id, { lastLoginAt: new Date() });
  }

  async deactivateUsers(userIds: number[]): Promise<number> {
    const result = await this.repository.update(
      { id: In(userIds) },
      { isActive: false },
    );
    return result.affected || 0;
  }

  async activateUsers(userIds: number[]): Promise<number> {
    const result = await this.repository.update(
      { id: In(userIds) },
      { isActive: true },
    );
    return result.affected || 0;
  }

  async deleteInactiveUsers(inactiveDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

    const result = await this.repository.delete({
      isActive: false,
      lastLoginAt: LessThan(cutoffDate),
    });

    return result.affected || 0;
  }

  async getUserCount(): Promise<number> {
    return this.repository.count();
  }

  async getActiveUserCount(): Promise<number> {
    return this.repository.count({ where: { isActive: true } });
  }

  async getVerifiedUserCount(): Promise<number> {
    return this.repository
      .createQueryBuilder('user')
      .where('user.emailVerifiedAt IS NOT NULL')
      .getCount();
  }

  async getUserRegistrationStats(
    days: number,
  ): Promise<{ date: string; count: number }[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.repository
      .createQueryBuilder('user')
      .select('DATE(user.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('user.created_at >= :cutoffDate', { cutoffDate })
      .groupBy('DATE(user.created_at)')
      .orderBy('DATE(user.created_at)', 'ASC')
      .getRawMany();

    return result.map((row) => ({
      date: row.date,
      count: parseInt(row.count, 10),
    }));
  }

  private mapEntityToDomain(entity: UserEntity): User {
    return new User(
      entity.id,
      entity.name,
      entity.email,
      entity.passwordHash,
      entity.createdAt,
      entity.updatedAt,
      entity.isActive,
      entity.lastLoginAt,
      entity.emailVerifiedAt,
    );
  }
}
