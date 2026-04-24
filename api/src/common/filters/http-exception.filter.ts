import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

function defaultErrorCode(status: number): string {
  const statusLabel = HttpStatus[status];

  return typeof statusLabel === 'string'
    ? statusLabel
    : HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR];
}

function normalizeExceptionResponse(
  responseBody: unknown,
  status: number,
): { code: string; message: string; details?: unknown } {
  if (typeof responseBody === 'string') {
    return {
      code: defaultErrorCode(status),
      message: responseBody,
    };
  }

  if (responseBody && typeof responseBody === 'object') {
    const errorResponse = responseBody as {
      code?: string;
      details?: unknown;
      message?: string | string[];
    };

    return {
      code: errorResponse.code ?? defaultErrorCode(status),
      message: Array.isArray(errorResponse.message)
        ? errorResponse.message.join(', ')
        : (errorResponse.message ?? 'Request failed'),
      details: errorResponse.details,
    };
  }

  return {
    code: defaultErrorCode(status),
    message: status === 500 ? 'Unexpected server error' : 'Request failed',
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorPayload = normalizeExceptionResponse(
      exception instanceof HttpException ? exception.getResponse() : undefined,
      status,
    );

    response.status(status).json({
      ...errorPayload,
    });
  }
}
