import { StockLocationList } from '@/components/StockLocationList';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import React, { useState } from 'react';
import { View } from 'react-native';

interface StockLocationSelectionStepProps {
  onComplete: (stockLocationId: string) => void;
  onCreateNew: () => void;
  initialValue?: string;
}

export const StockLocationSelectionStep: React.FC<StockLocationSelectionStepProps> = ({
  onComplete,
  onCreateNew,
  initialValue = '',
}) => {
  const [selectedStockLocation, setSelectedStockLocation] = useState(initialValue);

  const handleStockLocationSelect = (stockLocationId: string) => {
    setSelectedStockLocation(stockLocationId);
  };

  return (
    <View className="flex-1 p-5">
      <Text className="mb-6 text-4xl">Configurando</Text>
      <Text className="mb-2 text-2xl">Seleccionar ubicación de inventario</Text>
      <Text className="mb-6 text-gray-300">
        Selecciona de dónde se surtirá el inventario, o agrega una nueva ubicación si es necesario.
      </Text>

      <StockLocationList
        selectedStockLocationId={selectedStockLocation}
        onStockLocationSelect={handleStockLocationSelect}
      />

      <Button variant="outline" className="mt-6" onPress={onCreateNew}>
        Crear una nueva ubicación
      </Button>

      <Button className="mt-4" onPress={() => onComplete(selectedStockLocation)} disabled={!selectedStockLocation}>
        Siguiente
      </Button>
    </View>
  );
};
