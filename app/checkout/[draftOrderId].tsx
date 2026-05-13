import {
  DRAFT_ORDER_DEFAULT_CUSTOMER_EMAIL,
  useCompleteDraftOrder,
  useCurrentDraftOrder,
  useDraftOrderOrOrder,
} from '@/api/hooks/draft-orders';
import { ShoppingCart } from '@/components/icons/shopping-cart';
import { InfoBanner } from '@/components/InfoBanner';
import { CheckoutSkeleton } from '@/components/skeletons/CheckoutSkeleton';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Layout } from '@/components/ui/Layout';
import { Text } from '@/components/ui/Text';
import { useSettings } from '@/contexts/settings';
import { formatDate } from '@/utils/date';
import { AdminOrderLineItem } from '@medusajs/types';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { router, useLocalSearchParams, usePathname } from 'expo-router';
import React from 'react';
import { Image, View } from 'react-native';

const DraftOrderItem: React.FC<{ item: AdminOrderLineItem }> = ({ item }) => {
  const settings = useSettings();
  const draftOrder = useCurrentDraftOrder();
  const thumbnail = item.thumbnail || item.product?.thumbnail || item.product?.images?.[0]?.url;

  return (
    <View className="flex-row gap-4 bg-white py-6">
      <View className="h-[5.25rem] w-[5.25rem] overflow-hidden rounded-xl bg-gray-200">
        {thumbnail && <Image source={{ uri: thumbnail }} className="h-full w-full object-cover" />}
      </View>
      <View className="flex-1 flex-col gap-2">
        <Text>{item.product_title}</Text>
        {item.variant && item.variant.options && item.variant.options.length > 0 && (
          <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
            {item.variant.options.map((option) => (
              <View className="flex-row gap-1" key={option.id}>
                <Text className="text-sm text-gray-400">{option.option?.title || option.option_id}:</Text>
                <Text className="text-sm">{option.value}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <Text className="ml-auto">
        {item.unit_price.toLocaleString('en-US', {
          style: 'currency',
          currency: draftOrder.data?.draft_order.region?.currency_code || settings.data?.region?.currency_code,
          currencyDisplay: 'narrowSymbol',
        })}
      </Text>
    </View>
  );
};

export default function CheckoutScreen() {
  const pathName = usePathname();
  const { draftOrderId } = useLocalSearchParams<{ draftOrderId: string }>();
  const settings = useSettings();
  const draftOrder = useDraftOrderOrOrder(draftOrderId);
  const completeOrder = useCompleteDraftOrder(draftOrderId);

  const renderItem = React.useCallback<ListRenderItem<AdminOrderLineItem>>(
    ({ item }) => <DraftOrderItem item={item} />,
    [],
  );

  const items = draftOrder.data?.items || [];

  if (draftOrder.isLoading || settings.isLoading) {
    return <CheckoutSkeleton />;
  }

  if (draftOrder.isError || settings.isError) {
    return (
      <Layout>
        <Text className="text-4xl">Pagar</Text>
        <View className="flex-1 items-center justify-center gap-2">
          <InfoBanner variant="ghost" colorScheme="error" className="w-40">
            Error al cargar el carrito
          </InfoBanner>
          <Button
            onPress={() => {
              draftOrder.refetch();
              settings.refetch();
            }}
            isPending={draftOrder.isRefetching || settings.isRefetching}
            variant="outline"
          >
            Intentar de nuevo
          </Button>
        </View>
      </Layout>
    );
  }

  if (!draftOrder.data?.items.length) {
    return (
      <Layout>
        <Text className="text-4xl">Pagar</Text>
        <View className="flex-1 items-center justify-center gap-1">
          <ShoppingCart size={24} />
          <Text className="text-xl">Tu carrito está vacío</Text>
          <Text className="text-center text-gray-300">
            Parece que no tienes artículos en tu carrito.{'\n'}Por favor agrega artículos antes de{'\n'}proceder al
            pago.
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Button variant="outline" className="flex-1" onPress={() => router.back()}>
            Volver al carrito
          </Button>
          <Button className="flex-1" disabled>
            Completar pedido
          </Button>
        </View>
      </Layout>
    );
  }

  const isDraftOrder = draftOrder.data.status === 'draft';
  const customerEmail = draftOrder.data.customer?.email;
  const customerName = [draftOrder.data.customer?.first_name, draftOrder.data.customer?.last_name]
    .filter(Boolean)
    .join(' ');
  const customerPhone = draftOrder.data.customer?.phone;
  const isPosDefaultCustomer = !customerEmail || customerEmail === DRAFT_ORDER_DEFAULT_CUSTOMER_EMAIL;

  return (
    <>
      <Layout>
        <Text className="mb-6 text-4xl">Pagar</Text>

        <FlashList
          data={items}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View className="h-hairline bg-gray-200" />}
          ListHeaderComponent={() => <Text className="text-2xl">Artículos del carrito</Text>}
          ListFooterComponent={() =>
            !isPosDefaultCustomer ? (
              <View className="mb-10 mt-4">
                <Text className="mb-6 text-2xl">Información</Text>

                {customerName && (
                  <View className="mb-4 flex-row">
                    <Text className="w-24 text-gray-300">Nombre completo</Text>
                    <View className="flex-1">
                      <Text>{customerName}</Text>
                    </View>
                  </View>
                )}
                <View className="mb-4 flex-row">
                  <Text className="w-24 text-gray-300">Correo electrónico</Text>
                  <View className="flex-1">
                    <Text>{customerEmail}</Text>
                  </View>
                </View>
                {customerPhone && (
                  <View className="flex-row">
                    <Text className="w-24 text-gray-300">Teléfono</Text>
                    <View className="flex-1">
                      <Text>{customerPhone}</Text>
                    </View>
                  </View>
                )}
              </View>
            ) : null
          }
          keyboardDismissMode="on-drag"
        />

        <View className="mb-6 gap-y-2 border-y border-gray-200 py-4">
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-400">Impuestos</Text>
            <Text className="text-sm text-gray-400">
              {draftOrder.data.tax_total?.toLocaleString('en-US', {
                style: 'currency',
                currency: draftOrder.data.region?.currency_code || settings.data?.region?.currency_code,
                currencyDisplay: 'narrowSymbol',
              })}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-400">Subtotal</Text>
            <Text className="text-sm text-gray-400">
              {draftOrder.data.subtotal?.toLocaleString('en-US', {
                style: 'currency',
                currency: draftOrder.data.region?.currency_code || settings.data?.region?.currency_code,
                currencyDisplay: 'narrowSymbol',
              })}
            </Text>
          </View>
          {typeof draftOrder.data.discount_total === 'number' && draftOrder.data.discount_total > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-400">Descuento</Text>
              <Text className="text-sm text-gray-400">
                {(draftOrder.data.discount_total * -1)?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: draftOrder.data.region?.currency_code || settings.data?.region?.currency_code,
                  currencyDisplay: 'narrowSymbol',
                })}
              </Text>
            </View>
          )}
        </View>

        <View className="mb-6 flex-row justify-between">
          <Text className="text-lg">Total</Text>
          <Text className="text-lg">
            {draftOrder.data.total?.toLocaleString('en-US', {
              style: 'currency',
              currency: draftOrder.data.region?.currency_code || settings.data?.region?.currency_code,
              currencyDisplay: 'narrowSymbol',
            })}
          </Text>
        </View>

        <View className="pb-safe flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onPress={() => router.back()}
            disabled={!isDraftOrder || completeOrder.isPending}
          >
            Volver al carrito
          </Button>
          <Button
            className="flex-1"
            onPress={() => completeOrder.mutate()}
            disabled={!isDraftOrder}
            isPending={completeOrder.isPending}
          >
            Completar pedido
          </Button>
        </View>
      </Layout>

      <Dialog
        visible={!isDraftOrder && pathName === `/checkout/${draftOrderId}`}
        showCloseButton={false}
        dismissOnOverlayPress={false}
        onRequestClose={(event) => {
          event.preventDefault();
        }}
        onOverlayPress={(event) => {
          event.preventDefault();
        }}
        onCloseIconPress={(event) => {
          event.preventDefault();
        }}
        title="¡Pedido confirmado!"
        contentClassName="flex-shrink"
      >
        <InfoBanner colorScheme="success" className="mb-4">
          El pedido se ha realizado con éxito. Puedes seguir el estado del pedido en la pantalla de Pedidos.
        </InfoBanner>

        <Button
          className="mb-2"
          onPress={() => {
            router.replace('/orders');
            router.push({
              pathname: '/orders/[orderId]',
              params: {
                orderId: draftOrderId,
                orderNumber: draftOrder.data.display_id,
                orderDate: formatDate(draftOrder.data.created_at),
              },
            });
          }}
        >
          Ver pedido
        </Button>
        <Button
          variant="outline"
          onPress={() => {
            router.replace('/products');
          }}
        >
          Volver a la tienda
        </Button>
      </Dialog>
    </>
  );
}
