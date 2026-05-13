import { FetchError } from '@medusajs/js-sdk';
import Toast from 'react-native-toast-message';

/**
 * Network error that occurs during fetch operations
 */
export interface NetworkError extends Error {
  code?: string;
  errno?: number;
  syscall?: string;
  hostname?: string;
}

/**
 * Type guard to check if error is a Medusa FetchError
 */
export const isFetchError = (error: unknown): error is FetchError => {
  return error instanceof FetchError;
};

/**
 * Type guard to check if error is a network error
 */
export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof Error && ('code' in error || 'errno' in error || 'syscall' in error);
};

/**
 * Check if error is an unauthorized error (401)
 */
export const isUnauthorizedError = (error: unknown): boolean => {
  return isFetchError(error) && error.status === 401;
};

/**
 * Check if error is a forbidden error (403)
 */
export const isForbiddenError = (error: unknown): boolean => {
  return isFetchError(error) && error.status === 403;
};

/**
 * Check if error is a not found error (404)
 */
export const isNotFoundError = (error: unknown): boolean => {
  return isFetchError(error) && error.status === 404;
};

/**
 * Check if error is a server error (500)
 */
export const isServerError = (error: unknown): boolean => {
  return isFetchError(error) && error.status === 500;
};

/**
 * Get error message from any error type
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Ocurrió un error desconocido';
};

export const showErrorToast = (error: unknown) => {
  if (isUnauthorizedError(error)) {
    Toast.show({
      type: 'error',
      text1: 'No autorizado',
      text2: 'Necesitas iniciar sesión para acceder a este recurso.',
    });
    return;
  }

  if (isForbiddenError(error)) {
    Toast.show({
      type: 'error',
      text1: 'Prohibido',
      text2: 'No tienes permiso para acceder a este recurso.',
    });
    return;
  }

  if (isNotFoundError(error)) {
    Toast.show({
      type: 'error',
      text1: 'No encontrado',
      text2: 'No se pudo encontrar el recurso solicitado.',
    });
    return;
  }

  if (isServerError(error)) {
    Toast.show({
      type: 'error',
      text1: 'Error del servidor',
      text2: 'Ocurrió un error inesperado en el servidor.',
    });
    return;
  }

  if (isNetworkError(error)) {
    Toast.show({
      type: 'error',
      text1: 'Error de red',
      text2: 'Por favor verifica tu conexión a internet e intenta de nuevo.',
    });
    return;
  }

  Toast.show({
    type: 'error',
    text1: 'Algo salió mal',
    text2: getErrorMessage(error),
  });
};
