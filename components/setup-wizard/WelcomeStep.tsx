import { Button } from '@/components/ui/Button';
import { Layout } from '@/components/ui/Layout';
import { Text } from '@/components/ui/Text';
import React from 'react';
import { View } from 'react-native';

interface WelcomeStepProps {
  onComplete: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onComplete }) => {
  return (
    <Layout className="pb-6">
      <Text className="mb-6 text-4xl">Bienvenido</Text>
      <Text className="mb-2 text-2xl">Todo listo para comenzar a vender</Text>
      <Text className="mb-6 text-gray-600">
        Tu sistema de Punto de Venta está configurado y listo para usar. Puedes comenzar a gestionar tus ventas, productos y
        clientes de inmediato.
      </Text>

      <Text className="mb-4 text-gray-600">Aquí hay algunas cosas que puedes hacer:</Text>
      <Text className="mb-2 text-gray-600">• Explorar productos y agregarlos al carrito</Text>
      <Text className="mb-2 text-gray-600">• Procesar pedidos de clientes</Text>
      <Text className="mb-2 text-gray-600">• Escanear códigos de barras para agregar rápidamente al carrito</Text>
      <Text className="mb-6 text-gray-600">• Seguir ventas e inventario</Text>

      <View className="flex-1" />

      <Button onPress={onComplete}>Comenzar</Button>
    </Layout>
  );
};
