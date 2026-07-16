import { Form } from '@/components/form/Form';
import { FormButton } from '@/components/form/FormButton';
import { TextField } from '@/components/form/TextField';
import { InfoBanner } from '@/components/InfoBanner';
import { LayoutWithKeyboardAvoidingScroll } from '@/components/ui/Layout';
import { Text } from '@/components/ui/Text';
import { useAuthCtx } from '@/contexts/auth';
import React, { useState } from 'react';
import { Image, View } from 'react-native';
import * as z from 'zod/v4';

const loginSchema = z.object({
  email: z.email('Por favor ingrese un correo electrónico válido').min(3, 'El correo electrónico es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const auth = useAuthCtx();

  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: LoginFormData) => {
    setError(null);
    try {
      await auth.login(data.email, data.password);
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión. Por favor intente de nuevo.');
    }
  };

  const defaultValues: Partial<LoginFormData> = {
    email: '',
    password: '',
  };

  return (
    <LayoutWithKeyboardAvoidingScroll>
      <View className="items-center">
        <View className="w-full max-w-xl gap-6">
          <View className="items-center mb-4">
            <Image
              source={require('@/assets/images/obs-logo.png')}
              style={{ width: 240, height: 54 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-4xl">Iniciar sesión</Text>
          {error && <InfoBanner colorScheme="error">{error}</InfoBanner>}
          <Form
            key={auth.state.status === 'loading' ? 'loading' : 'form'}
            schema={loginSchema}
            onSubmit={handleLogin}
            defaultValues={defaultValues}
            className="gap-6"
          >
            <TextField
              name="email"
              floatingPlaceholder
              placeholder="Correo electrónico"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              readOnly={auth.state.status === 'loading'}
              textContentType="emailAddress"
              autoComplete="email"
              testID="loginEmail"
            />

            <TextField
              name="password"
              floatingPlaceholder
              placeholder="Contraseña"
              secureTextEntry
              autoCapitalize="none"
              readOnly={auth.state.status === 'loading'}
              textContentType="password"
              autoComplete="password"
              testID="loginPassword"
            />

            <FormButton isPending={auth.state.status === 'loading'}>Iniciar sesión</FormButton>
          </Form>
        </View>
      </View>
    </LayoutWithKeyboardAvoidingScroll>
  );
}
