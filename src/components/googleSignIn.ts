import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../routes/supabase';
import { useEffect } from 'react';

WebBrowser.maybeCompleteAuthSession();

const redirectUri = AuthSession.makeRedirectUri({
  useProxy: true,
});

const authUrl = `https://ejhzykrpxqdtkngmuxqv.supabase.co/auth/v1/callback=${encodeURIComponent(redirectUri)}`;

export function useGoogleAuth(navigation: any) {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      redirectUri,
      responseType: 'token',
      clientId: 'ignore-this-for-supabase',
    },
    { authorizationEndpoint: authUrl }
  );

  useEffect(() => {
    const loginWithSupabase = async () => {
      if (response?.type === 'success' && response.params?.access_token) {
        const { access_token } = response.params;

        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token: '',
        });

        if (error) {
          console.log('Erro ao logar no Supabase:', error);
        } else {
          navigation.navigate('Home');
        }
      }
    };

    loginWithSupabase();
  }, [response]);

  return { promptAsync };
}
