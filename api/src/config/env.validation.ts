import { z } from 'zod';

import { DEFAULT_CORS_ORIGIN } from '../common/constants/api.constants';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5001),
  CORS_ORIGIN: z.string().min(1).default(DEFAULT_CORS_ORIGIN),
});

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'env';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
}

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    throw new Error(
      `Environment validation failed: ${formatIssues(result.error)}`,
    );
  }

  return result.data;
}
