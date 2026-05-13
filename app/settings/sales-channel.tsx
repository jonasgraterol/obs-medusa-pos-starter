import { SalesChannelList } from '@/components/SalesChannelList';
import { Button } from '@/components/ui/Button';
import { Layout } from '@/components/ui/Layout';
import { Text } from '@/components/ui/Text';
import { useSettings, useUpdateSettings } from '@/contexts/settings';
import { router } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

export default function SalesChannelScreen() {
  const settings = useSettings();
  const updateSettings = useUpdateSettings();
  const [selectedSalesChannel, setSelectedSalesChannel] = React.useState(settings.data?.sales_channel?.id || '');

  return (
    <Layout className="pb-6">
      <Text className="mb-6 text-4xl">Configurando</Text>
      <Text className="mb-2 text-2xl">Elegir un canal de ventas</Text>
      <Text className="mb-6 text-gray-300">
        Selecciona un canal de ventas existente de la lista o crea uno nuevo para continuar.
      </Text>

      <SalesChannelList selectedSalesChannelId={selectedSalesChannel} onSalesChannelSelect={setSelectedSalesChannel} />

      <View className="mt-6 gap-4">
        <Button variant="outline" onPress={() => router.push('/settings/create-sales-channel')}>
          Crear nuevo canal de ventas
        </Button>

        <Button
          disabled={!selectedSalesChannel}
          isPending={updateSettings.isPending}
          onPress={() => {
            if (!selectedSalesChannel) {
              return;
            }

            updateSettings.mutate(
              {
                sales_channel_id: selectedSalesChannel,
              },
              {
                onSuccess: () => {
                  router.back();
                },
              },
            );
          }}
        >
          Enviar
        </Button>

        <Button variant="outline" onPress={() => router.back()}>
          Cancelar
        </Button>
      </View>
    </Layout>
  );
}
