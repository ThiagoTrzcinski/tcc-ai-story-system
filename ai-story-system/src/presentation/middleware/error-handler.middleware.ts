/**
 * 🚨 **Middleware Global de Tratamento de Erros - ai-story-system**
 *
 * Este middleware captura todos os erros não tratados da aplicação e os
 * converte em respostas HTTP padronizadas, seguindo as melhores práticas
 * de Clean Architecture e error handling.
 *
 * ## Funcionalidades:
 *
 * - ✅ Captura erros customizados (DomainError) e os formata adequadamente
 * - ✅ Converte erros não tratados em respostas padronizadas
 * - ✅ Logging inteligente (não loga erros esperados como 400/404)
 * - ✅ Diferentes formatos para desenvolvimento vs produção
 * - ✅ Suporte a contexto de erro para debugging
 * - ✅ Integração com sistema de logging (Winston)
 *
 * ## Uso:
 *
 * ```typescript
 * import { errorHandler } from './middleware/error-handler.middleware';
 *
 * // Registrar como último middleware
 * app.use(errorHandler);
 * ```
 *
 * @author thiago trzcinski
 * @version 1.0.0
 */

import {
  DomainError,
  ErrorCode,
  ErrorUtils,
  InternalError,
  NotFoundError,
  ValidationError,
} from '../../domain/errors';
import { NextFunction, Request, Response } from '../../types/express-types';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

/**
 * Interface para configuração do error handler
 */
interface ErrorHandlerConfig {
  includeStackTrace: boolean;
  logErrors: boolean;
  includeDetails: boolean;
  environment: 'development' | 'production' | 'test';
}

/**
 * Interface para resposta de erro padronizada
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    stack?: string;
    requestId?: string;
  };
}

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

/**
 * Obtém configuração do error handler baseada no ambiente
 */
function getErrorHandlerConfig(): ErrorHandlerConfig {
  const environment = (process.env.NODE_ENV as any) || 'development';

  return {
    includeStackTrace: environment === 'development',
    logErrors: environment !== 'test' || process.env.DEBUG_TESTS === 'true',
    includeDetails: environment === 'development',
    environment,
  };
}

// ============================================================================
// LOGGING
// ============================================================================

/**
 * Logger para erros (usa console.error por enquanto, pode ser substituído por Winston)
 */
class ErrorLogger {
  static log(error: Error, req: Request, config: ErrorHandlerConfig): void {
    if (!config.logErrors) {
      return;
    }

    // Não logar erros esperados (400, 404) em produção
    if (!ErrorUtils.shouldLog(error) && config.environment === 'production') {
      return;
    }

    const logData = {
      message: error.message,
      name: error.name,
      code:
        error instanceof DomainError ? error.code : ErrorCode.INTERNAL_ERROR,
      statusCode: ErrorUtils.getHttpStatusCode(error),
      url: req.url,
      method: req.method,
      userAgent: req.header?.('user-agent'),
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
      ...(config.includeStackTrace && { stack: error.stack }),
      ...(error instanceof DomainError &&
        error.context && { context: error.context }),
    };

    // Em desenvolvimento, usar console.error para melhor visualização
    if (config.environment === 'development') {
      console.error('🚨 Application Error:', logData);
    } else {
      // Em produção, usar formato JSON para logs estruturados
      console.error(JSON.stringify(logData));
    }
  }
}

// ============================================================================
// FORMATADORES DE RESPOSTA
// ============================================================================

/**
 * Formata erro para resposta HTTP
 */
function formatErrorResponse(
  error: Error,
  req: Request,
  config: ErrorHandlerConfig,
): ErrorResponse {
  const context = ErrorUtils.createContext(req);

  // Se é um erro de domínio, usar sua formatação
  if (error instanceof DomainError) {
    const response = error.toHttpResponse() as ErrorResponse;

    // Adicionar informações extras em desenvolvimento
    if (config.includeStackTrace) {
      response.error.stack = error.stack;
    }

    if (context.requestId) {
      response.error.requestId = context.requestId;
    }

    return response;
  }

  // Para erros não tratados, criar resposta genérica
  const response: ErrorResponse = {
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message:
        config.environment === 'production'
          ? 'Internal server error'
          : error.message,
      timestamp: new Date().toISOString(),
    },
  };

  // Adicionar informações extras em desenvolvimento
  if (config.includeStackTrace) {
    response.error.stack = error.stack;
  }

  if (config.includeDetails && config.environment === 'development') {
    response.error.details = {
      originalError: error.name,
      context,
    };
  }

  if (context.requestId) {
    response.error.requestId = context.requestId;
  }

  return response;
}

// ============================================================================
// MIDDLEWARE PRINCIPAL
// ============================================================================

/**
 * 🔥 **Middleware global de tratamento de erros**
 *
 * Este middleware deve ser registrado como o último middleware da aplicação
 * para capturar todos os erros não tratados.
 *
 * @param error - Erro capturado
 * @param req - Request do Express
 * @param res - Response do Express
 * @param next - Função next do Express (não utilizada)
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const config = getErrorHandlerConfig();

  try {
    // Logar o erro
    ErrorLogger.log(error, req, config);

    // Formatar resposta
    const errorResponse = formatErrorResponse(error, req, config);

    // Determinar status code
    const statusCode = ErrorUtils.getHttpStatusCode(error);

    // Enviar resposta
    res.status(statusCode).json(errorResponse);
  } catch (handlerError) {
    // Se o próprio error handler falhar, enviar resposta mínima
    console.error('🔥 Error handler failed:', handlerError);

    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

// ============================================================================
// MIDDLEWARE DE CAPTURA DE ERROS ASSÍNCRONOS
// ============================================================================

/**
 * 🔄 **Wrapper para capturar erros assíncronos**
 *
 * Envolve funções async para garantir que erros sejam capturados
 * e passados para o error handler.
 *
 * @param fn - Função async a ser envolvida
 * @returns Função envolvida que captura erros
 *
 * @example
 * ```typescript
 * router.get('/stories', asyncErrorHandler(async (req, res) => {
 *   const stories = await storyService.getStories();
 *   res.json(stories);
 * }));
 * ```
 */
export const asyncErrorHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============================================================================
// MIDDLEWARE DE ERRO 404
// ============================================================================

/**
 * 🔍 **Middleware para rotas não encontradas**
 *
 * Deve ser registrado antes do error handler para capturar
 * requisições para rotas que não existem.
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const context = ErrorUtils.createContext(req);

  const error = new InternalError(
    `Route not found: ${req.method} ${req.path}`,
    {
      method: req.method,
      path: req.path,
      availableRoutes: 'Check API documentation for available routes',
    },
    context,
  );

  // Alterar status code para 404
  (error as any).statusCode = 404;
  (error as any).code = ErrorCode.RESOURCE_NOT_FOUND;

  next(error);
};

// ============================================================================
// UTILITÁRIOS PARA CONTROLLERS
// ============================================================================

/**
 * 🛠️ **Utilitários para uso em controllers**
 */
export class ControllerErrorUtils {
  /**
   * Envia resposta de erro padronizada
   */
  static sendError(res: Response, error: Error): void {
    const config = getErrorHandlerConfig();
    // Criar um request mock se não existir
    const mockReq: Request = res.req || { method: 'UNKNOWN', url: 'unknown' };
    const errorResponse = formatErrorResponse(error, mockReq, config);
    const statusCode = ErrorUtils.getHttpStatusCode(error);

    res.status(statusCode).json(errorResponse);
  }

  /**
   * Cria e envia erro de validação
   */
  static sendValidationError(
    res: Response,
    message: string,
    details?: any,
  ): void {
    const mockReq: Request = res.req || { method: 'UNKNOWN', url: 'unknown' };
    const context = ErrorUtils.createContext(mockReq);
    const error = new ValidationError(message, details, context);

    ControllerErrorUtils.sendError(res, error);
  }

  /**
   * Cria e envia erro de não encontrado
   */
  static sendNotFoundError(res: Response, resource: string, id?: string): void {
    const mockReq: Request = res.req || { method: 'UNKNOWN', url: 'unknown' };
    const context = ErrorUtils.createContext(mockReq);
    const error = new NotFoundError(
      `${resource} not found${id ? `: ${id}` : ''}`,
      { resource, id },
      context,
    );

    ControllerErrorUtils.sendError(res, error);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { ErrorHandlerConfig, ErrorLogger, ErrorResponse };
