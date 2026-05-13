import { Form } from '@/components/form/Form';
import { FormButton } from '@/components/form/FormButton';
import { TextField } from '@/components/form/TextField';
import { InfoBanner } from '@/components/InfoBanner';
import { LayoutWithKeyboardAvoidingScroll } from '@/components/ui/Layout';
import { Text } from '@/components/ui/Text';
import { useAuthCtx } from '@/contexts/auth';
import React, { useState } from 'react';
import { View } from 'react-native';
import * as z from 'zod/v4';

const normalizeUrl = (url: string): string => {
  if (!url) return url;
  // Remove http:// or https:// if present
  return url.replace(/^https?:\/\//, '');
};

const validateMedusaUrl = async (url: string): Promise<boolean> => {
  try {
    const normalizedUrl = normalizeUrl(url);
    if (!normalizedUrl) {
      console.error('Invalid URL: empty or undefined');
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`https://${normalizedUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
      credentials: 'omit',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Invalid response from Medusa URL: ${response.status}`);
      console.error('Response body:', await response.text());
      return false;
    }

    const text = await response.text();
    return text.trim().toLowerCase() === 'ok';
  } catch (error) {
    console.error('Error validating Medusa URL:', error);
    return false;
  }
};

const loginSchema = z.object({
  medusaUrl: z
    .string()
    .min(1, 'La URL de la tienda es obligatoria')
    .transform(normalizeUrl)
    .refine(
      async (url) => {
        if (!url) return false;

        try {
          new URL(`https://${url}`);
        } catch {
          console.error('Invalid URL format');
          return false;
        }

        return await validateMedusaUrl(url);
      },
      {
        message: 'Por favor ingrese una URL válida de la tienda Medusa',
      },
    ),
  email: z.email('Por favor ingrese un correo electrónico válido').min(3, 'El correo electrónico es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const auth = useAuthCtx();

  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: LoginFormData) => {
    setError(null);
    const fullUrl = `https://${data.medusaUrl}`;
    try {
      await auth.login(fullUrl, data.email, data.password);
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión. Por favor intente de nuevo.');
    }
  };

  const defaultValues: Partial<LoginFormData> = {
    medusaUrl: auth.state.status !== 'loading' ? (auth.state.medusaUrl ?? '') : '',
    email: '',
    password: '',
  };

  return (
    <LayoutWithKeyboardAvoidingScroll>
      <View className="items-center">
        <View className="w-full max-w-xl gap-6">
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
              name="medusaUrl"
              floatingPlaceholder
              placeholder="URL de la tienda"
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              readOnly={auth.state.status === 'loading'}
              textContentType="URL"
              autoComplete="url"
              testID="loginShopUrl"
            />

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
