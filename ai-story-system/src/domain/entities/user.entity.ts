export class User {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly isActive: boolean = true,
    public readonly lastLoginAt?: Date,
    public readonly emailVerifiedAt?: Date,
    public readonly deletedAt?: Date,
  ) {}

  static create(name: string, email: string, passwordHash: string): User {
    const now = new Date();

    return new User(
      0, // Will be set by database auto-increment
      name,
      email,
      passwordHash,
      now,
      now,
      true,
    );
  }

  updateProfile(name?: string, email?: string): User {
    return new User(
      this.id,
      name ?? this.name,
      email ?? this.email,
      this.passwordHash,
      this.createdAt,
      new Date(), // Update timestamp
      this.isActive,
      this.lastLoginAt,
      this.emailVerifiedAt,
      this.deletedAt,
    );
  }

  updatePassword(newPasswordHash: string): User {
    return new User(
      this.id,
      this.name,
      this.email,
      newPasswordHash,
      this.createdAt,
      new Date(), // Update timestamp
      this.isActive,
      this.lastLoginAt,
      this.emailVerifiedAt,
      this.deletedAt,
    );
  }

  markAsLoggedIn(): User {
    return new User(
      this.id,
      this.name,
      this.email,
      this.passwordHash,
      this.createdAt,
      new Date(), // Update timestamp
      this.isActive,
      new Date(), // Set last login
      this.emailVerifiedAt,
      this.deletedAt,
    );
  }

  verifyEmail(): User {
    return new User(
      this.id,
      this.name,
      this.email,
      this.passwordHash,
      this.createdAt,
      new Date(), // Update timestamp
      this.isActive,
      this.lastLoginAt,
      new Date(), // Set email verified
      this.deletedAt,
    );
  }

  deactivate(): User {
    return new User(
      this.id,
      this.name,
      this.email,
      this.passwordHash,
      this.createdAt,
      new Date(), // Update timestamp
      false, // Deactivate
      this.lastLoginAt,
      this.emailVerifiedAt,
      this.deletedAt,
    );
  }

  activate(): User {
    return new User(
      this.id,
      this.name,
      this.email,
      this.passwordHash,
      this.createdAt,
      new Date(), // Update timestamp
      true, // Activate
      this.lastLoginAt,
      this.emailVerifiedAt,
      this.deletedAt,
    );
  }

  softDelete(): User {
    return new User(
      this.id,
      this.name,
      this.email,
      this.passwordHash,
      this.createdAt,
      new Date(), // Update timestamp
      false, // Deactivate when soft deleted
      this.lastLoginAt,
      this.emailVerifiedAt,
      new Date(), // Set deleted timestamp
    );
  }

  restore(): User {
    return new User(
      this.id,
      this.name,
      this.email,
      this.passwordHash,
      this.createdAt,
      new Date(), // Update timestamp
      true, // Reactivate when restored
      this.lastLoginAt,
      this.emailVerifiedAt,
      undefined, // Clear deleted timestamp
    );
  }

  get isDeleted(): boolean {
    return this.deletedAt !== undefined;
  }

  // Validation methods
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 100;
  }

  // Utility methods
  get isEmailVerified(): boolean {
    return !!this.emailVerifiedAt;
  }

  get daysSinceCreation(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get daysSinceLastLogin(): number | null {
    if (!this.lastLoginAt) return null;

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.lastLoginAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Security methods
  canLogin(): boolean {
    return this.isActive && this.isEmailVerified;
  }

  toPublicProfile(): {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
    isActive: boolean;
    isEmailVerified: boolean;
    lastLoginAt?: Date;
  } {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt,
      isActive: this.isActive,
      isEmailVerified: this.isEmailVerified,
      lastLoginAt: this.lastLoginAt,
    };
  }
}
