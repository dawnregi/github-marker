import type { PydanticValidationError } from '@/api/user/user.type';

// Helper function to format Pydantic validation errors globally
export function formatPydanticErrors(detail: string | PydanticValidationError[] | undefined): string {
  if (!detail) return 'An error occurred';
  
  if (typeof detail === 'string') return detail;
  
  if (Array.isArray(detail)) {
    return detail
      .map((err) => {
        const field = err.loc[err.loc.length - 1];
        return `${field}: ${err.msg}`;
      })
      .join(', ');
  }
  
  return 'An error occurred';
}

// Extract error message from Axios error response
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { detail?: string | PydanticValidationError[] } }; message?: string };
    return formatPydanticErrors(axiosError?.response?.data?.detail) || axiosError?.message || 'An unexpected error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
