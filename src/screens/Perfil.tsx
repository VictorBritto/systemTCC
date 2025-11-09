import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../routes/supabase';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface UserProfile {
  email: string;
  name: string;
  phone: string;
  location: string;
  role: string;
  avatar_url?: string;
}

const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    email: '',
    name: '',
    phone: '+5519928343697',
    location: 'Interior',
    role: 'Administrador',
    avatar_url: undefined,
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        setUser(user);
        setProfile(prev => ({
          ...prev,
          email: user.email || '',
          name: user.user_metadata?.name || 'Usuário',
          phone: user.user_metadata?.phone || prev.phone,
          location: user.user_metadata?.location || prev.location,
          role: user.user_metadata?.role || prev.role,
          avatar_url: user.user_metadata?.avatar_url,
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do usuário.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Solicitar permissões
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar suas fotos.');
        return;
      }

      // Abrir seletor de imagens
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      console.log('=== INÍCIO DO UPLOAD ===');
      console.log('URI da imagem:', uri);

      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }
      console.log('✓ Usuário autenticado:', user.id);

      // Método alternativo: usar FormData e ArrayBuffer
      console.log('Lendo arquivo...');
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const fileSize = arrayBuffer.byteLength;
      console.log('✓ Arquivo lido:', fileSize, 'bytes');

      if (fileSize === 0) {
        throw new Error('Arquivo vazio');
      }

      if (fileSize > 5 * 1024 * 1024) { // 5MB
        throw new Error('Arquivo muito grande (máximo 5MB)');
      }

      // Gerar nome único para o arquivo
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      console.log('✓ Nome do arquivo:', fileName);

      // Upload para o Supabase Storage usando ArrayBuffer
      console.log('Enviando para Supabase...');
      const { data, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        console.error('✗ Erro no upload:', JSON.stringify(uploadError, null, 2));
        throw new Error(uploadError.message || 'Erro ao fazer upload');
      }

      console.log('✓ Upload concluído:', data?.path);

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      console.log('✓ URL pública:', publicUrl);

      // Atualizar perfil do usuário
      await updateProfile({ avatar_url: publicUrl });

      console.log('=== UPLOAD FINALIZADO COM SUCESSO ===');
      Alert.alert('Sucesso! 🎉', 'Foto de perfil atualizada!');
    } catch (error: any) {
      console.error('=== ERRO NO UPLOAD ===');
      console.error('Tipo:', error.name);
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
      
      let errorMessage = 'Não foi possível fazer upload da imagem.';
      
      if (error.message.includes('autenticado')) {
        errorMessage = 'Você precisa estar logado para alterar a foto.';
      } else if (error.message.includes('grande')) {
        errorMessage = 'A imagem é muito grande. Escolha uma menor que 5MB.';
      } else if (error.message.includes('vazio')) {
        errorMessage = 'Arquivo inválido. Tente outra imagem.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Erro no Upload ❌', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) throw error;

      setProfile(prev => ({ ...prev, ...updates }));
      if (editing) setEditing(false);
      
      if (!updates.avatar_url) {
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => editing ? updateProfile(profile) : setEditing(true)}
            >
              <Text style={styles.editButtonText}>
                {editing ? 'Salvar' : 'Editar'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoHeader}>
              {/* Avatar com botão de upload */}
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={pickImage}
                disabled={uploading}
              >
                {profile.avatar_url ? (
                  <Image 
                    source={{ uri: profile.avatar_url }} 
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <MaterialCommunityIcons 
                      name="account" 
                      size={60} 
                      color="#94A3B8" 
                    />
                  </View>
                )}
                
                {/* Ícone de câmera sobreposto */}
                <View style={styles.cameraIconContainer}>
                  {uploading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <MaterialCommunityIcons 
                      name="camera" 
                      size={20} 
                      color="#FFFFFF" 
                    />
                  )}
                </View>
              </TouchableOpacity>

              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.role}>{profile.role}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>
              
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="account" size={20} color="#666" />
                <Text style={styles.infoLabel}>Nome</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={profile.name}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
                    placeholder="Seu nome"
                  />
                ) : (
                  <Text style={styles.infoValue}>{profile.name}</Text>
                )}
              </View>
              
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="email" size={20} color="#666" />
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile.email}</Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="phone" size={20} color="#666" />
                <Text style={styles.infoLabel}>Telefone</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={profile.phone}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
                    placeholder="Seu telefone"
                  />
                ) : (
                  <Text style={styles.infoValue}>{profile.phone}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
                <Text style={styles.infoLabel}>Localização</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={profile.location}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, location: text }))}
                    placeholder="Sua localização"
                  />
                ) : (
                  <Text style={styles.infoValue}>{profile.location}</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  container: {
    flex: 1,
    padding: screenWidth * 0.05,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    maxWidth: 800,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: screenHeight * 0.03,
    marginTop: 30,
  },
  editButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: screenWidth * 0.05,
    paddingVertical: screenHeight * 0.015,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  editButtonText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: screenWidth < 360 ? 14 : 16,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: screenWidth * 0.06,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoHeader: {
    alignItems: 'center',
    marginBottom: screenHeight * 0.03,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#E2E8F0',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#CBD5E1',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  name: {
    fontSize: screenWidth < 360 ? 24 : 28,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
  },
  role: {
    fontSize: screenWidth < 360 ? 14 : 16,
    color: '#64748B',
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: screenHeight * 0.03,
  },
  sectionTitle: {
    fontSize: screenWidth < 360 ? 18 : 20,
    fontWeight: '600',
    color: '#334155',
    marginBottom: screenHeight * 0.02,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: screenHeight * 0.02,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  infoLabel: {
    fontSize: screenWidth < 360 ? 14 : 16,
    color: '#334155',
    opacity: 0.9,
    marginLeft: 12,
    width: screenWidth * 0.25,
  },
  infoValue: {
    flex: 1,
    fontSize: screenWidth < 360 ? 14 : 16,
    color: '#334155',
    marginLeft: 12,
  },
  input: {
    flex: 1,
    fontSize: screenWidth < 360 ? 14 : 16,
    color: '#334155',
    marginLeft: 12,
    padding: 8,
    backgroundColor: '#F0F4F8',
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
});

export default ProfileScreen;