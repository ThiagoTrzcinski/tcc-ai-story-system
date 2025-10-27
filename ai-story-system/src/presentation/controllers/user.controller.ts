import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { inject, injectable } from 'tsyringe';
import { IUserService } from '../../domain/interfaces/user.service.interface';
import {
  Request,
  Response,
  Router,
  createRouter,
} from '../../types/express-types';
import {
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
  UserQueryDto,
} from '../dtos/user.dto';
import { authMiddleware } from '../middleware/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the user
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         isActive:
 *           type: boolean
 *           description: Whether the user account is active
 *         isEmailVerified:
 *           type: boolean
 *           description: Whether the user's email is verified
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           description: Last login timestamp
 *           nullable: true
 */

@injectable()
export class UserController {
  public router: Router;

  constructor(@inject('IUserService') private userService: IUserService) {
    this.router = createRouter();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Public routes (no authentication required)
    this.router.post('/', this.createUser.bind(this));
    this.router.post('/login', this.loginUser.bind(this));

    // Protected routes (authentication required)
    this.router.use(authMiddleware);
    this.router.get('/', this.getAllUsers.bind(this));
    this.router.get('/:id', this.getUserById.bind(this));
    this.router.put('/:id', this.updateUser.bind(this));
    this.router.delete('/:id', this.deleteUser.bind(this));
  }

  /**
   * @swagger
   * /users:
   *   post:
   *     summary: Create a new user account
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 2
   *                 maxLength: 100
   *                 example: "John Doe"
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "john.doe@example.com"
   *               password:
   *                 type: string
   *                 minLength: 8
   *                 example: "SecurePass123!"
   *     responses:
   *       201:
   *         description: User created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "User created successfully"
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Validation error
   *       409:
   *         description: Email already exists
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(CreateUserDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors
            .map((error) => Object.values(error.constraints || {}))
            .flat(),
        });
        return;
      }

      const result = await this.userService.registerUser({
        name: dto.name,
        email: dto.email,
        password: dto.password,
      });

      if (!result.success) {
        res
          .status(
            result.errors?.includes('A user with this email already exists')
              ? 409
              : 400,
          )
          .json({
            success: false,
            message: result.message,
            errors: result.errors,
          });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: result.user?.toPublicProfile(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * @swagger
   * /users/login:
   *   post:
   *     summary: User login
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "john.doe@example.com"
   *               password:
   *                 type: string
   *                 example: "SecurePass123!"
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Login successful"
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       $ref: '#/components/schemas/User'
   *                     token:
   *                       type: string
   *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *       401:
   *         description: Invalid credentials
   */
  async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(LoginUserDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors
            .map((error) => Object.values(error.constraints || {}))
            .flat(),
        });
        return;
      }

      const result = await this.userService.loginUser({
        email: dto.email,
        password: dto.password,
      });

      if (!result.success) {
        res.status(401).json({
          success: false,
          message: result.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.user?.toPublicProfile(),
          token: result.token,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   get:
   *     summary: Get user by ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: User ID
   *     responses:
   *       200:
   *         description: User found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       404:
   *         description: User not found
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id, 10);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID',
        });
        return;
      }

      const user = await this.userService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user.toPublicProfile(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   put:
   *     summary: Update user information
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: User ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 2
   *                 maxLength: 100
   *                 example: "John Doe Updated"
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "john.updated@example.com"
   *     responses:
   *       200:
   *         description: User updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: User not found
   *       409:
   *         description: Email already exists
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id, 10);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID',
        });
        return;
      }

      const dto = plainToClass(UpdateUserDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors
            .map((error) => Object.values(error.constraints || {}))
            .flat(),
        });
        return;
      }

      const updatedUser = await this.userService.updateUser(userId, {
        name: dto.name,
        email: dto.email,
      });

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser.toPublicProfile(),
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Email already exists')) {
          res.status(409).json({
            success: false,
            message: error.message,
          });
          return;
        }
        if (
          error.message.includes('Invalid email') ||
          error.message.includes('Name must be')
        ) {
          res.status(400).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   delete:
   *     summary: Delete user account
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: User ID
   *     responses:
   *       200:
   *         description: User deleted successfully
   *       404:
   *         description: User not found
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id, 10);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID',
        });
        return;
      }

      const deleted = await this.userService.deleteUser(userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * @swagger
   * /users:
   *   get:
   *     summary: Get all users with pagination and filtering
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Number of users per page
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search term for name or email
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *         description: Filter by active status
   *       - in: query
   *         name: isEmailVerified
   *         schema:
   *           type: boolean
   *         description: Filter by email verification status
   *     responses:
   *       200:
   *         description: Users retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     users:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/User'
   *                     total:
   *                       type: integer
   *                       example: 100
   *                     page:
   *                       type: integer
   *                       example: 1
   *                     limit:
   *                       type: integer
   *                       example: 10
   *                     totalPages:
   *                       type: integer
   *                       example: 10
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(UserQueryDto, req.query);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors
            .map((error) => Object.values(error.constraints || {}))
            .flat(),
        });
        return;
      }

      const page = dto.page ? parseInt(dto.page, 10) : 1;
      const limit = dto.limit ? parseInt(dto.limit, 10) : 10;

      // Validate pagination parameters
      if (page < 1 || limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          message: 'Invalid pagination parameters',
        });
        return;
      }

      let result;

      if (dto.search) {
        // Search users by name or email
        result = await this.userService.searchUsers(dto.search, page, limit);
      } else {
        // Get all users with filters
        const filters: any = {};

        if (dto.name) filters.name = dto.name;
        if (dto.email) filters.email = dto.email;
        if (dto.isActive !== undefined)
          filters.isActive = dto.isActive === 'true';
        if (dto.isEmailVerified !== undefined)
          filters.isEmailVerified = dto.isEmailVerified === 'true';

        result = await this.userService.getAllUsers(page, limit, filters);
      }

      res.status(200).json({
        success: true,
        data: {
          users: result.users.map((user) => user.toPublicProfile()),
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
