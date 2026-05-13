import { Tabs } from 'expo-router';

import { useCurrentDraftOrder } from '@/api/hooks/draft-orders';
import { HapticTab } from '@/components/HapticTab';
import { ClipboardList } from '@/components/icons/clipboard-list';
import { ScanBarcode } from '@/components/icons/scan-barcode';
import { Settings } from '@/components/icons/settings';
import { ShoppingCart } from '@/components/icons/shopping-cart';
import { Store } from '@/components/icons/store';

export const unstable_settings = {
  initialRouteName: 'products',
  detachInactiveScreens: false,
};

export default function TabLayout() {
  const draftOrder = useCurrentDraftOrder();

  return (
    <Tabs
      detachInactiveScreens={false}
      screenOptions={{
        tabBarActiveTintColor: '#1C1917',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarButton: HapticTab,
        animation: 'shift',
      }}
    >
      <Tabs.Screen
        name="products"
        options={{
          title: 'Productos',
          tabBarIcon: ({ color }) => <Store size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color }) => <ClipboardList size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: 'Escanear',
          tabBarIcon: ({ color }) => <ScanBarcode size={20} color={color} />,
          tabBarStyle: { display: 'none' },
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: 'Carrito',
          tabBarBadge:
            draftOrder.data && draftOrder.data.draft_order.items.length > 0
              ? draftOrder.data.draft_order.items.length
              : undefined,
          tabBarBadgeStyle: {
            maxWidth: 17.6,
            maxHeight: 17.6,
            fontSize: 9,
            aspectRatio: 1,
            backgroundColor: '#b80049',
            fontWeight: '700',
          },
          tabBarIcon: ({ color }) => <ShoppingCart size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => <Settings size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
