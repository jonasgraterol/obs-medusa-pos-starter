import { Text } from '@/components/ui/Text';
import { clx } from '@/utils/clx';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface OptionPickerProps {
  values: { id: string; value: string; className?: string; stock?: number }[];
  selectedValue?: string;
  onValueChange: (value: { id: string; value: string }) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export function OptionPicker({
  values,
  selectedValue,
  onValueChange,
  label,
  disabled = false,
  className = '',
}: OptionPickerProps) {
  return (
    <View className={className}>
      <Text className="mb-2 text-gray-900">{label}</Text>

      <View className="flex-row flex-wrap gap-2">
        {values.map((valueItem) => {
          const isSelected = selectedValue === valueItem.value;
          const isDisabled = disabled;

          return (
            <TouchableOpacity
              key={valueItem.id}
              onPress={() => !isDisabled && onValueChange(valueItem)}
              disabled={isDisabled}
              className={clx(
                'h-10 flex-row items-center justify-center gap-2 rounded-full border px-2 disabled:opacity-50',
                {
                  'border-black bg-black': isSelected,
                  'border-gray-200 bg-white': !isSelected,
                },
                valueItem.className,
              )}
            >
              <Text
                className={clx({
                  'text-white': isSelected,
                })}
              >
                {valueItem.value}
              </Text>
              {typeof valueItem.stock === 'number' && (
                <Text
                  className={clx('text-xs', {
                    'text-gray-300': isSelected,
                    'text-gray-400': !isSelected && valueItem.stock > 5,
                    'text-amber-500': !isSelected && valueItem.stock > 0 && valueItem.stock <= 5,
                    'text-red-400': !isSelected && valueItem.stock === 0,
                  })}
                >
                  ({valueItem.stock})
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default OptionPicker;
