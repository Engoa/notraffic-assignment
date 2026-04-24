import { ValidationError } from '@nestjs/common';

export interface ValidationIssue {
  field: string;
  errors: string[];
}

export function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): ValidationIssue[] {
  return errors.flatMap((error) => {
    const field = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const currentIssue = error.constraints
      ? [{ field, errors: Object.values(error.constraints) }]
      : [];
    const childIssues = error.children?.length
      ? flattenValidationErrors(error.children, field)
      : [];

    return [...currentIssue, ...childIssues];
  });
}
