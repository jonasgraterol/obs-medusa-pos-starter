import { DRAFT_ORDER_DEFAULT_CUSTOMER_EMAIL } from '@/api/hooks/draft-orders';
import { useOrder } from '@/api/hooks/orders';
import { useCaptureCash, useCreatePaymentLink } from '@/api/hooks/payment';
import { Loader } from '@/components/icons/loader';
import { InfoBanner } from '@/components/InfoBanner';
import { LoadingBanner } from '@/components/LoadingBanner';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { FulfillmentStatus, OrderStatus, PaymentStatus } from '@/components/ui/OrderStatus';
import { Text } from '@/components/ui/Text';
import { useSettings } from '@/contexts/settings';
import { AdminOrder, AdminOrderLineItem } from '@medusajs/types';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, Image, Share, TouchableOpacity, View } from 'react-native';

const CustomerInformation: React.FC<{
  order: AdminOrder;
}> = ({ order }) => {
  const customerEmail = order.customer?.email;
  const customerName = [order.customer?.first_name, order.customer?.last_name].filter(Boolean).join(' ');
  const customerPhone = order.customer?.phone;
  const customerAddress = order.shipping_address
    ? [
        order.shipping_address.address_1,
        order.shipping_address.address_2,
        [order.shipping_address.postal_code, order.shipping_address.city].filter(Boolean).join(' '),
        order.shipping_address.province,
        order.shipping_address.country?.display_name,
      ]
        .filter(Boolean)
        .join(', ')
    : undefined;
  const isPosDefaultCustomer = !customerEmail || customerEmail === DRAFT_ORDER_DEFAULT_CUSTOMER_EMAIL;

  if (isPosDefaultCustomer) {
    return (
      <View className="mb-4 gap-4">
        <Text className="text-xl">Cliente</Text>
        <View>
          <Text className="text-sm text-gray-300">
            No hay información del cliente disponible. Este pedido fue creado en el POS sin un cliente.
          </Text>
        </View>
      </View>
    );
  }

  const info = [
    { label: 'Nombre completo', value: customerName },
    { label: 'Correo', value: customerEmail },
    { label: 'Dirección', value: customerAddress },
    { label: 'Teléfono', value: customerPhone },
  ].filter((item) => item.value && item.value.trim().length > 0);

  return (
    <View className="mb-4 gap-4">
      <Text className="text-xl">Customer</Text>
      {info.map((item, index) => (
        <View key={item.label}>
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <Text className="max-w-32 text-sm text-gray-300">{item.label}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-right text-sm">{item.value}</Text>
            </View>
          </View>
          {index < info.length - 1 && <View className="mt-2 h-hairline w-full bg-gray-200" />}
        </View>
      ))}
    </View>
  );
};

const OrderInformation: React.FC<{
  order: AdminOrder;
  currency: string;
}> = ({ order, currency }) => {
  const automaticTaxesOn = !!order.region?.automatic_taxes;
  const shippingTotal = automaticTaxesOn ? order.shipping_total : order.shipping_subtotal;

  return (
    <>
      <Text className="mb-4 text-xl">Detalles del pedido</Text>
      <View className="mb-6 gap-2">
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm text-gray-300">Estado del pedido</Text>
          </View>
          <OrderStatus order={order} />
        </View>
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm text-gray-300">Estado del pago</Text>
          </View>
          <PaymentStatus order={order} />
        </View>
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm text-gray-300">Estado de envío</Text>
          </View>
          <FulfillmentStatus order={order} />
        </View>
      </View>
      <CustomerInformation order={order} />
      <Text className="mb-4 text-xl">Resumen</Text>
      <View className="gap-2">
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm text-gray-300">{automaticTaxesOn ? 'Subtotal (incl. impuestos)' : 'Subtotal'}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-right text-sm">
              {order.item_total.toLocaleString('en-US', {
                style: 'currency',
                currency,
                currencyDisplay: 'narrowSymbol',
              })}
            </Text>
          </View>
        </View>
        {shippingTotal > 0 && (
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <Text className="text-sm text-gray-300">{automaticTaxesOn ? 'Envío (incl. impuestos)' : 'Envío'}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-right text-sm">
                {shippingTotal.toLocaleString('en-US', {
                  style: 'currency',
                  currency,
                  currencyDisplay: 'narrowSymbol',
                })}
              </Text>
            </View>
          </View>
        )}
        {order.discount_total > 0 && (
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <Text className="text-sm text-gray-300">Descuento</Text>
            </View>
            <View className="flex-1">
              <Text className="text-right text-sm">
                {(order.discount_total * -1).toLocaleString('en-US', {
                  style: 'currency',
                  currency,
                  currencyDisplay: 'narrowSymbol',
                })}
              </Text>
            </View>
          </View>
        )}
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm text-gray-300">Total de impuestos{automaticTaxesOn ? ' (incluido)' : ''}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-right text-sm">
              {order.tax_total.toLocaleString('en-US', {
                style: 'currency',
                currency,
                currencyDisplay: 'narrowSymbol',
              })}
            </Text>
          </View>
        </View>
        <View className="h-hairline w-full bg-gray-200" />
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm text-gray-300">Total pagado</Text>
          </View>
          <View className="flex-1">
            <Text className="text-right text-sm">
              {order.payment_collections
                .reduce(
                  (acc, collection) => acc + (collection.captured_amount ?? 0) - (collection.refunded_amount ?? 0),
                  0,
                )
                .toLocaleString('en-US', {
                  style: 'currency',
                  currency,
                  currencyDisplay: 'narrowSymbol',
                })}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm text-gray-300">Total de líneas de crédito</Text>
          </View>
          <View className="flex-1">
            <Text className="text-right text-sm">
              {(order.credit_lines ?? [])
                .reduce((acc, collection) => acc + ((collection.amount as unknown as number) ?? 0), 0)
                .toLocaleString('en-US', {
                  style: 'currency',
                  currency,
                  currencyDisplay: 'narrowSymbol',
                })}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm text-gray-300">Monto pendiente</Text>
          </View>
          <View className="flex-1">
            <Text className="text-right text-sm">
              {(order.summary.pending_difference ?? 0).toLocaleString('en-US', {
                style: 'currency',
                currency,
                currencyDisplay: 'narrowSymbol',
              })}
            </Text>
          </View>
        </View>
      </View>
      <View className="my-4 h-hairline w-full bg-gray-200" />
      <View className="flex-row items-center justify-between gap-4">
        <View className="flex-1">
          <Text className="text-lg">Total</Text>
        </View>
        <View className="flex-1">
          <Text className="text-right text-lg">
            {order.total.toLocaleString('en-US', {
              style: 'currency',
              currency,
              currencyDisplay: 'narrowSymbol',
            })}
          </Text>
        </View>
      </View>
    </>
  );
};

const PaymentActions: React.FC<{ order: AdminOrder }> = ({ order }) => {
  const createPaymentLink = useCreatePaymentLink();
  const captureCash = useCaptureCash({
    onSuccess: () => {
      // Refetch order to update payment status
    },
  });

  const hasPendingPayment =
    order.payment_status === 'not_paid' ||
    order.payment_status === 'awaiting' ||
    order.payment_status === 'requires_action';

  const isNotCancelled = order.status !== 'canceled';

  if (!hasPendingPayment || !isNotCancelled) return null;

  const isAnyPending = createPaymentLink.isPending || captureCash.isPending;

  const handlePaymentLink = () => {
    createPaymentLink.mutate(order.id, {
      onSuccess: (data) => {
        if (data.url) {
          Share.share({
            message: `Paga tu pedido #${order.display_id} aquí: ${data.url}`,
            url: data.url,
          });
        }
      },
    });
  };

  const handleCash = () => {
    captureCash.mutate(order.id);
  };

  return (
    <View className="mt-6 gap-3">
      <Text className="text-sm text-gray-400">Cobrar pedido</Text>
      <View className="flex-row gap-2">
        <TouchableOpacity
          className={`flex-1 rounded-xl border p-3 ${isAnyPending ? 'border-gray-100 bg-gray-50' : 'border-gray-200 bg-white'}`}
          onPress={handleCash}
          disabled={isAnyPending}
          accessibilityRole="button"
        >
          <View className="flex-row items-center justify-between">
            <Text className={`text-base font-medium ${isAnyPending ? 'text-gray-300' : 'text-black'}`}>Efectivo</Text>
            {captureCash.isPending && <Loader size={14} color="#B5B5B5" className="animate-spin" />}
          </View>
          <Text className="text-xs text-gray-400 mt-1">Marcar como pagado</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 rounded-xl border p-3 ${isAnyPending ? 'border-gray-100 bg-gray-50' : 'border-gray-200 bg-white'}`}
          onPress={handlePaymentLink}
          disabled={isAnyPending}
          accessibilityRole="button"
        >
          <View className="flex-row items-center justify-between">
            <Text className={`text-base font-medium ${isAnyPending ? 'text-gray-300' : 'text-black'}`}>Link de pago</Text>
            {createPaymentLink.isPending && <Loader size={14} color="#B5B5B5" className="animate-spin" />}
          </View>
          <Text className="text-xs text-gray-400 mt-1">Enviar al cliente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const OrderDetails: React.FC<{ animateOut: (callback?: () => void) => void }> = ({ animateOut }) => {
  const { orderId, orderNumber, orderDate } = useLocalSearchParams<{
    orderId: string;
    orderNumber: string;
    orderDate: string;
  }>();

  const settings = useSettings();
  const orderQuery = useOrder(orderId);

  const currency =
    orderQuery.data?.order.currency_code ||
    orderQuery.data?.order.region?.currency_code ||
    settings.data?.region?.currency_code ||
    'EUR';

  const handleProductPress = React.useCallback(
    (product: AdminOrderLineItem) => {
      animateOut(() => {
        router.push({
          pathname: '/product-details',
          params: {
            productId: product.product_id,
            productName: product.product_title,
          },
        });
      });
    },
    [animateOut],
  );

  const renderItem = React.useCallback(
    ({ item }: { item: AdminOrderLineItem }) => {
      const thumbnail = item.thumbnail || item.product?.thumbnail || item.product?.images?.[0]?.url;
      return (
        <TouchableOpacity className="flex-row gap-4" onPress={() => handleProductPress(item)}>
          <View className="aspect-square h-16 overflow-hidden rounded-lg bg-gray-300">
            {thumbnail && <Image source={{ uri: thumbnail }} className="h-full w-full object-cover" />}
          </View>
          <View>
            <Text>{item.title}</Text>
            <Text className="mt-auto text-sm text-gray-300">
              {item.variant?.options?.map((o) => o.value).join(', ')}
            </Text>
          </View>
          <View className="ml-auto">
            <Text>
              {item.total.toLocaleString('en-US', {
                style: 'currency',
                currency,
                currencyDisplay: 'narrowSymbol',
              })}
            </Text>
            <Text className="mt-auto text-right text-sm text-gray-300">
              Cant: {item.quantity.toLocaleString('en-US')}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [currency, handleProductPress],
  );

  return (
    <>
      <View className="mb-4 flex-row items-center justify-between gap-4">
        <Text className="text-2xl">Pedido #{orderNumber}</Text>
        <Text className="text-gray-300">{orderDate}</Text>
      </View>
      {orderQuery.isLoading || settings.isLoading ? (
        <LoadingBanner variant="ghost" className="my-11">
          Cargando detalles del pedido...
        </LoadingBanner>
      ) : orderQuery.isError ? (
        <View className="py-11">
          <InfoBanner colorScheme="error">
            {orderQuery.error.message || 'Ocurrió un error desconocido al cargar los detalles del pedido.'}
          </InfoBanner>
        </View>
      ) : settings.isError ? (
        <View className="py-11">
          <InfoBanner colorScheme="error">
            {settings.error.message || 'Ocurrió un error desconocido al cargar la configuración.'}
          </InfoBanner>
        </View>
      ) : orderQuery.isSuccess && orderQuery.data ? (
        <FlatList
          data={orderQuery.data.order.items}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View className="my-6 h-hairline w-full bg-gray-200" />}
          className="shrink grow-0"
          contentContainerClassName="pt-4 grow-0 pb-safe-offset-6"
          ListFooterComponentClassName="mt-14"
          ListFooterComponent={
            <>
              <OrderInformation order={orderQuery.data.order} currency={currency} />
              <PaymentActions order={orderQuery.data.order} />
            </>
          }
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        />
      ) : (
        <View className="py-11">
          <InfoBanner colorScheme="error">Ocurrió un error desconocido al cargar los detalles del pedido.</InfoBanner>
        </View>
      )}
    </>
  );
};

export default function OrderDetailsScreen() {
  const [visible, setVisible] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setVisible(false);

      const timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      }, 100);

      return () => {
        clearTimeout(timeoutId);
      };
    }, []),
  );

  const renderContent = React.useCallback(({ animateOut }: { animateOut: (callback?: () => void) => void }) => {
    return <OrderDetails animateOut={animateOut} />;
  }, []);

  return (
    <BottomSheet visible={visible} onClose={() => router.back()} showCloseButton={false} dismissOnOverlayPress>
      {renderContent}
    </BottomSheet>
  );
}
