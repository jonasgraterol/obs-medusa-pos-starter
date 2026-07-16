import { useMedusaSdk } from '@/contexts/auth';
import { showErrorToast } from '@/utils/errors';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

type PaymentLinkResponse = {
  url: string;
  session_id: string;
  expires_at: number;
};

type VerifyPaymentResponse = {
  status: string;
  already_paid?: boolean;
  session_url?: string;
};

type CaptureCashResponse = {
  success: boolean;
  already_paid?: boolean;
};

export const useCreatePaymentLink = (
  options?: Omit<UseMutationOptions<PaymentLinkResponse, Error, string, unknown>, 'mutationKey' | 'mutationFn'>,
) => {
  const sdk = useMedusaSdk();

  return useMutation({
    mutationKey: ['pos', 'payment-link'],
    mutationFn: async (orderId: string) => {
      const response = await sdk.client.fetch<PaymentLinkResponse>('/admin/pos/payment-link', {
        method: 'POST',
        body: { order_id: orderId },
      });
      return response;
    },
    ...options,
    onError(error, variables, context) {
      showErrorToast(error);
      return options?.onError?.(error, variables, context);
    },
  });
};

export const useCaptureCash = (
  options?: Omit<UseMutationOptions<CaptureCashResponse, Error, string, unknown>, 'mutationKey' | 'mutationFn'>,
) => {
  const sdk = useMedusaSdk();

  return useMutation({
    mutationKey: ['pos', 'capture-cash'],
    mutationFn: async (orderId: string) => {
      const response = await sdk.client.fetch<CaptureCashResponse>('/admin/pos/capture-cash', {
        method: 'POST',
        body: { order_id: orderId },
      });
      return response;
    },
    ...options,
    onError(error, variables, context) {
      showErrorToast(error);
      return options?.onError?.(error, variables, context);
    },
  });
};

export const useVerifyPayment = (
  options?: Omit<UseMutationOptions<VerifyPaymentResponse, Error, string, unknown>, 'mutationKey' | 'mutationFn'>,
) => {
  const sdk = useMedusaSdk();

  return useMutation({
    mutationKey: ['pos', 'verify-payment'],
    mutationFn: async (orderId: string) => {
      const response = await sdk.client.fetch<VerifyPaymentResponse>('/admin/pos/verify-payment', {
        method: 'POST',
        body: { order_id: orderId },
      });
      return response;
    },
    ...options,
    onError(error, variables, context) {
      showErrorToast(error);
      return options?.onError?.(error, variables, context);
    },
  });
};
