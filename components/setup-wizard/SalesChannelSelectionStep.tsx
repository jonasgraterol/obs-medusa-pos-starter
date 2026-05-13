import { SalesChannelList } from '@/components/SalesChannelList';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import React, { useState } from 'react';
import { View } from 'react-native';

interface SalesChannelSelectionStepProps {
  onComplete: (salesChannelId: string) => void;
  onCreateNew: () => void;
  initialValue?: string;
}

export const SalesChannelSelectionStep: React.FC<SalesChannelSelectionStepProps> = ({
  onComplete,
  onCreateNew,
  initialValue = '',
}) => {
  const [selectedSalesChannel, setSelectedSalesChannel] = useState(initialValue);

  const handleSalesChannelSelect = (salesChannelId: string) => {
    setSelectedSalesChannel(salesChannelId);
  };

  return (
    <View className="flex-1 p-5">
      <Text className="mb-6 text-4xl">Configurando</Text>
      <Text className="mb-2 text-2xl">Elegir un canal de ventas</Text>
      <Text className="mb-6 text-gray-300">
        Selecciona un canal de ventas existente de la lista o crea uno nuevo para continuar.
      </Text>

      <SalesChannelList selectedSalesChannelId={selectedSalesChannel} onSalesChannelSelect={handleSalesChannelSelect} />

      <Button variant="outline" onPress={onCreateNew} className="mt-6">
        Crear nuevo canal de ventas
      </Button>

      <Button onPress={() => onComplete(selectedSalesChannel)} disabled={!selectedSalesChannel} className="mt-4">
        Siguiente
      </Button>
    </View>
  );
};
