import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../routes/supabase';
import { useEffect } from 'react';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth(navigation: any) {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: '127f9377-fec7-4380-99a2-475089957b84.apps.googleusercontent.com',
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri(),
      responseType: 'id_token',
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/oauth/authorize',
    }
  );

  useEffect(() => {
    if (response?.type === 'success' && response.params?.id_token) {
      const handleGoogleSignIn = async () => {
        try {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: response.params.id_token,
          });

          if (error) {
            console.error('Erro ao fazer login com Google:', error);
          } else {
            navigation.navigate('Main' as never);
          }
        } catch (error) {
          console.error('Erro na autenticação:', error);
        }
      };

      handleGoogleSignIn();
    }
  }, [response, navigation]);

  return { promptAsync };
}
