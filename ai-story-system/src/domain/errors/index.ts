/**
 * 🚨 **Sistema de Erros Customizados - ai-story-system**
 *
 * Este arquivo define a hierarquia de erros customizados para o projeto,
 * seguindo os princípios de Clean Architecture e TypeScript.
 *
 * ## Hierarquia de Erros:
 *
 * ```
 * DomainError (base)
 * ├── ValidationError (dados inválidos)
 * ├── NotFoundError (recursos não encontrados)
 * ├── UnauthorizedError (autenticação necessária)
 * ├── ForbiddenError (acesso negado)
 * ├── ConflictError (conflitos de dados)
 * ├── BusinessRuleError (violações de regras de negócio)
 * └── ExternalServiceError (erros de APIs externas)
 * ```
 *
 * ## Códigos de Erro Padronizados:
 *
 * - **VALIDATION_ERROR**: Dados de entrada inválidos
 * - **RESOURCE_NOT_FOUND**: Recurso solicitado não existe
 * - **UNAUTHORIZED**: Token de autenticação necessário
 * - **FORBIDDEN**: Acesso negado ao recurso
 * - **CONFLICT**: Conflito com estado atual (ex: email já existe)
 * - **BUSINESS_RULE_VIOLATION**: Violação de regra de negócio
 * - **EXTERNAL_SERVICE_ERROR**: Falha em serviço externo
 * - **INTERNAL_ERROR**: Erro interno do servidor
 *
 * @author thiago trzcinski
 * @version 1.0.0
 */

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

/**
 * Códigos de erro padronizados para toda a aplicação
 */
export enum ErrorCode {
  // Validação e entrada de dados
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Recursos e acesso
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  STORY_NOT_FOUND = 'STORY_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  CHOICE_NOT_FOUND = 'CHOICE_NOT_FOUND',
  CONTENT_NOT_FOUND = 'CONTENT_NOT_FOUND',

  // Autenticação e autorização
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  FORBIDDEN = 'FORBIDDEN',
  ACCESS_DENIED = 'ACCESS_DENIED',

  // Conflitos e estado
  CONFLICT = 'CONFLICT',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  CHOICE_ALREADY_SELECTED = 'CHOICE_ALREADY_SELECTED',
  STORY_ALREADY_COMPLETED = 'STORY_ALREADY_COMPLETED',

  // Regras de negócio
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INVALID_STORY_STATUS = 'INVALID_STORY_STATUS',
  INVALID_CHOICE_SELECTION = 'INVALID_CHOICE_SELECTION',
  STORY_GENERATION_FAILED = 'STORY_GENERATION_FAILED',

  // Serviços externos
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  AI_PROVIDER_ERROR = 'AI_PROVIDER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',

  // Erros internos
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}

/**
 * Interface para detalhes adicionais do erro
 */
export interface ErrorDetails {
  [key: string]: any;
}

/**
 * Interface para contexto do erro (informações de debug)
 */
export interface ErrorContext {
  userId?: number;
  storyId?: string;
  choiceId?: string;
  contentId?: string;
  provider?: string;
  operation?: string;
  timestamp?: Date;
  requestId?: string;
}

// ============================================================================
// CLASSE BASE DE ERRO
// ============================================================================

/**
 * 🔥 **Classe base para todos os erros de domínio**
 *
 * Esta classe serve como base para todos os erros customizados do sistema,
 * fornecendo estrutura consistente e informações padronizadas.
 */
export abstract class DomainError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: ErrorDetails;
  public readonly context?: ErrorContext;
  public readonly timestamp: Date;
  public readonly isOperational: boolean = true;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number,
    details?: ErrorDetails,
    context?: ErrorContext,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.context = context;
    this.timestamp = new Date();

    // Mantém o stack trace correto
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Converte o erro para formato JSON padronizado
   */
  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp.toISOString(),
      },
    };
  }

  /**
   * Converte o erro para formato de resposta HTTP
   */
  toHttpResponse() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
        timestamp: this.timestamp.toISOString(),
      },
    };
  }
}

// ============================================================================
// ERROS ESPECÍFICOS
// ============================================================================

/**
 * 📝 **Erro de validação de dados**
 *
 * Usado quando dados de entrada são inválidos ou não atendem aos critérios.
 */
export class ValidationError extends DomainError {
  constructor(message: string, details?: ErrorDetails, context?: ErrorContext) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, details, context);
  }

  static invalidInput(
    field: string,
    value?: any,
    context?: ErrorContext,
  ): ValidationError {
    return new ValidationError(
      `Invalid input for field: ${field}`,
      { field, value },
      context,
    );
  }

  static missingField(field: string, context?: ErrorContext): ValidationError {
    return new ValidationError(
      `Missing required field: ${field}`,
      { field },
      context,
    );
  }

  static invalidEnum(
    field: string,
    value: any,
    validValues: string[],
    context?: ErrorContext,
  ): ValidationError {
    return new ValidationError(
      `Invalid value for ${field}. Expected one of: ${validValues.join(', ')}`,
      { field, value, validValues },
      context,
    );
  }
}

/**
 * 🔍 **Erro de recurso não encontrado**
 *
 * Usado quando um recurso solicitado não existe no sistema.
 */
export class NotFoundError extends DomainError {
  constructor(message: string, details?: ErrorDetails, context?: ErrorContext) {
    super(message, ErrorCode.RESOURCE_NOT_FOUND, 404, details, context);
  }

  static story(storyId: string, context?: ErrorContext): NotFoundError {
    return new NotFoundError(
      `Story not found: ${storyId}`,
      { storyId },
      { ...context, storyId },
    );
  }

  static user(userId: number, context?: ErrorContext): NotFoundError {
    return new NotFoundError(
      `User not found: ${userId}`,
      { userId },
      { ...context, userId },
    );
  }

  static choice(choiceId: string, context?: ErrorContext): NotFoundError {
    return new NotFoundError(
      `Choice not found: ${choiceId}`,
      { choiceId },
      { ...context, choiceId },
    );
  }

  static content(contentId: string, context?: ErrorContext): NotFoundError {
    return new NotFoundError(
      `Content not found: ${contentId}`,
      { contentId },
      { ...context, contentId },
    );
  }
}

/**
 * 🔐 **Erro de autenticação**
 *
 * Usado quando autenticação é necessária mas não foi fornecida ou é inválida.
 */
export class UnauthorizedError extends DomainError {
  constructor(message: string, details?: ErrorDetails, context?: ErrorContext) {
    super(message, ErrorCode.UNAUTHORIZED, 401, details, context);
  }

  static missingToken(context?: ErrorContext): UnauthorizedError {
    return new UnauthorizedError(
      'Authentication token is required',
      { reason: 'missing_token' },
      context,
    );
  }

  static invalidToken(context?: ErrorContext): UnauthorizedError {
    return new UnauthorizedError(
      'Invalid authentication token',
      { reason: 'invalid_token' },
      context,
    );
  }

  static expiredToken(context?: ErrorContext): UnauthorizedError {
    return new UnauthorizedError(
      'Authentication token has expired',
      { reason: 'expired_token' },
      context,
    );
  }
}

/**
 * 🚫 **Erro de autorização/acesso negado**
 *
 * Usado quando o usuário está autenticado mas não tem permissão para a ação.
 */
export class ForbiddenError extends DomainError {
  constructor(message: string, details?: ErrorDetails, context?: ErrorContext) {
    super(message, ErrorCode.FORBIDDEN, 403, details, context);
  }

  static accessDenied(
    resource: string,
    context?: ErrorContext,
  ): ForbiddenError {
    return new ForbiddenError(
      `Access denied to resource: ${resource}`,
      { resource },
      context,
    );
  }

  static storyAccess(
    storyId: string,
    userId: number,
    context?: ErrorContext,
  ): ForbiddenError {
    return new ForbiddenError(
      'You do not have permission to access this story',
      { storyId, userId },
      { ...context, storyId, userId },
    );
  }
}

/**
 * ⚔️ **Erro de conflito**
 *
 * Usado quando há conflito com o estado atual dos dados.
 */
export class ConflictError extends DomainError {
  constructor(message: string, details?: ErrorDetails, context?: ErrorContext) {
    super(message, ErrorCode.CONFLICT, 409, details, context);
  }

  static emailExists(email: string, context?: ErrorContext): ConflictError {
    return new ConflictError(
      'A user with this email already exists',
      { email },
      context,
    );
  }

  static choiceAlreadySelected(
    choiceId: string,
    context?: ErrorContext,
  ): ConflictError {
    return new ConflictError(
      'This choice has already been selected',
      { choiceId },
      { ...context, choiceId },
    );
  }
}

/**
 * ⚖️ **Erro de regra de negócio**
 *
 * Usado quando uma operação viola regras específicas do domínio.
 */
export class BusinessRuleError extends DomainError {
  constructor(message: string, details?: ErrorDetails, context?: ErrorContext) {
    super(message, ErrorCode.BUSINESS_RULE_VIOLATION, 422, details, context);
  }

  static invalidStoryStatus(
    currentStatus: string,
    requiredStatus: string,
    context?: ErrorContext,
  ): BusinessRuleError {
    return new BusinessRuleError(
      `Story must be in ${requiredStatus} status to perform this action. Current status: ${currentStatus}`,
      { currentStatus, requiredStatus },
      context,
    );
  }

  static storyAlreadyCompleted(
    storyId: string,
    context?: ErrorContext,
  ): BusinessRuleError {
    return new BusinessRuleError(
      'Cannot modify a completed story',
      { storyId },
      { ...context, storyId },
    );
  }

  static invalidChoiceSelection(
    reason: string,
    context?: ErrorContext,
  ): BusinessRuleError {
    return new BusinessRuleError(
      `Invalid choice selection: ${reason}`,
      { reason },
      context,
    );
  }

  static storyGenerationFailed(
    reason: string,
    provider?: string,
    context?: ErrorContext,
  ): BusinessRuleError {
    return new BusinessRuleError(
      `Story generation failed: ${reason}`,
      { reason, provider },
      { ...context, provider },
    );
  }
}

/**
 * 🌐 **Erro de serviço externo**
 *
 * Usado quando há falhas em APIs ou serviços externos.
 */
export class ExternalServiceError extends DomainError {
  constructor(message: string, details?: ErrorDetails, context?: ErrorContext) {
    super(message, ErrorCode.EXTERNAL_SERVICE_ERROR, 502, details, context);
  }

  static aiProvider(
    provider: string,
    reason: string,
    context?: ErrorContext,
  ): ExternalServiceError {
    return new ExternalServiceError(
      `AI provider error (${provider}): ${reason}`,
      { provider, reason },
      { ...context, provider },
    );
  }

  static database(
    operation: string,
    reason: string,
    context?: ErrorContext,
  ): ExternalServiceError {
    return new ExternalServiceError(
      `Database error during ${operation}: ${reason}`,
      { operation, reason },
      { ...context, operation },
    );
  }

  static timeout(
    service: string,
    timeoutMs: number,
    context?: ErrorContext,
  ): ExternalServiceError {
    return new ExternalServiceError(
      `Service timeout: ${service} (${timeoutMs}ms)`,
      { service, timeoutMs },
      context,
    );
  }
}

/**
 * ⚙️ **Erro interno do sistema**
 *
 * Usado para erros internos não categorizados ou de configuração.
 */
export class InternalError extends DomainError {
  constructor(message: string, details?: ErrorDetails, context?: ErrorContext) {
    super(message, ErrorCode.INTERNAL_ERROR, 500, details, context);
  }

  static configuration(setting: string, context?: ErrorContext): InternalError {
    return new InternalError(
      `Configuration error: ${setting} is not properly configured`,
      { setting },
      context,
    );
  }

  static unexpected(
    operation: string,
    originalError?: Error,
    context?: ErrorContext,
  ): InternalError {
    return new InternalError(
      `Unexpected error during ${operation}`,
      {
        operation,
        originalError: originalError?.message,
        stack: originalError?.stack,
      },
      { ...context, operation },
    );
  }
}

// ============================================================================
// UTILITÁRIOS E HELPERS
// ============================================================================

/**
 * 🔧 **Utilitários para tratamento de erros**
 */
export class ErrorUtils {
  /**
   * Verifica se um erro é operacional (esperado) ou de programação
   */
  static isOperationalError(error: Error): boolean {
    if (error instanceof DomainError) {
      return error.isOperational;
    }
    return false;
  }

  /**
   * Converte qualquer erro para DomainError
   */
  static toDomainError(error: unknown, context?: ErrorContext): DomainError {
    if (error instanceof DomainError) {
      return error;
    }

    if (error instanceof Error) {
      return InternalError.unexpected('unknown_operation', error, context);
    }

    return InternalError.unexpected(
      'unknown_operation',
      new Error(String(error)),
      context,
    );
  }

  /**
   * Extrai código de status HTTP de um erro
   */
  static getHttpStatusCode(error: Error): number {
    if (error instanceof DomainError) {
      return error.statusCode;
    }
    return 500;
  }

  /**
   * Formata erro para resposta HTTP
   */
  static toHttpResponse(error: Error): object {
    if (error instanceof DomainError) {
      return error.toHttpResponse();
    }

    return {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Verifica se um erro deve ser logado
   */
  static shouldLog(error: Error): boolean {
    if (error instanceof DomainError) {
      // Não logar erros de validação e não encontrado (são esperados)
      return ![400, 404].includes(error.statusCode);
    }
    return true;
  }

  /**
   * Cria contexto de erro a partir de request
   */
  static createContext(req: any): ErrorContext {
    return {
      userId: req.user?.id,
      storyId: req.params?.storyId,
      choiceId: req.params?.choiceId,
      contentId: req.params?.contentId,
      operation: `${req.method} ${req.path}`,
      timestamp: new Date(),
      requestId: req.id || req.headers?.['x-request-id'],
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Classes já exportadas individualmente acima
