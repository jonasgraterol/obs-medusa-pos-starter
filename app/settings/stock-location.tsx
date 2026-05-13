import { StockLocationList } from '@/components/StockLocationList';
import { Button } from '@/components/ui/Button';
import { Layout } from '@/components/ui/Layout';
import { Text } from '@/components/ui/Text';
import { useSettings, useUpdateSettings } from '@/contexts/settings';
import { router } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

export default function StockLocationScreen() {
  const settings = useSettings();
  const updateSettings = useUpdateSettings();
  const [selectedStockLocation, setSelectedStockLocation] = React.useState(settings.data?.stock_location?.id || '');

  return (
    <Layout className="pb-6">
      <Text className="mb-6 text-4xl">Configurando</Text>
      <Text className="mb-2 text-2xl">Seleccionar ubicación de inventario</Text>
      <Text className="mb-6 text-gray-300">
        Selecciona de dónde se surtirá el inventario, o agrega una nueva ubicación si es necesario.
      </Text>

      <StockLocationList
        selectedStockLocationId={selectedStockLocation}
        onStockLocationSelect={setSelectedStockLocation}
      />

      <View className="mt-6 gap-4">
        <Button variant="outline" onPress={() => router.push('/settings/create-stock-location')}>
          Crear nueva ubicación de inventario
        </Button>

        <Button
          disabled={!selectedStockLocation}
          isPending={updateSettings.isPending}
          onPress={() => {
            if (!selectedStockLocation) {
              return;
            }

            updateSettings.mutate(
              {
                stock_location_id: selectedStockLocation,
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
