import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Dimensions,
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
  avatar_url: string;
  role: string;
}

const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    email: '',
    name: 'Victor Gabriel',
    phone: '+5519928343697',
    location: 'Interior',
    avatar_url: 'https://via.placeholder.com/100',
    role: 'Administrador',
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
          name: user.user_metadata?.name || prev.name,
          phone: user.user_metadata?.phone || prev.phone,
          location: user.user_metadata?.location || prev.location,
          avatar_url: user.user_metadata?.avatar_url || prev.avatar_url,
          role: user.user_metadata?.role || prev.role,
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
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permissão negada', 'Você precisa permitir o acesso às fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        await uploadImageToSupabase(imageUri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const uploadImageToSupabase = async (uri: string) => {
    try {
      setLoading(true);
      
      // Generate a unique file name
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Fetch the image and convert to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!publicUrl) throw new Error('Failed to get public URL');

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      Alert.alert('Sucesso', 'Foto atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a foto: ' + error.message);
    } finally {
      setLoading(false);
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
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
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

          <View style={styles.avatarContainer}>
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
              <MaterialCommunityIcons name="camera" size={20} color="#1E1E1E" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoHeader}>
              <Text style={styles.name}>{profile.name}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>
              
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

            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Estatísticas</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>152</Text>
                  <Text style={styles.statLabel}>Alertas</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>98%</Text>
                  <Text style={styles.statLabel}>Uptime</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>45</Text>
                  <Text style={styles.statLabel}>Dias</Text>
                </View>
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
    backgroundColor: '#D6D4CE',
  },
  container: {
    flex: 1,
    padding: screenWidth * 0.05,
    backgroundColor: '#D6D4CE',
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
    backgroundColor: '#D9D9D9',
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
    color: '#1E1E1E',
    fontWeight: '600',
    fontSize: screenWidth < 360 ? 14 : 16,
  },
  avatarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: screenHeight * 0.04,
  },
  avatar: {
    width: screenWidth * 0.3,
    height: screenWidth * 0.3,
    borderRadius: screenWidth * 0.15,
    backgroundColor: '#1E1E1E',
    borderWidth: 3,
    borderColor: '#1E1E1E',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#D9D9D9',
    padding: 12,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#1E1E1E',
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
  name: {
    fontSize: screenWidth < 360 ? 24 : 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  role: {
    fontSize: screenWidth < 360 ? 14 : 16,
    color: '#4ECDC4',
    opacity: 0.9,
  },
  infoSection: {
    marginBottom: screenHeight * 0.03,
  },
  sectionTitle: {
    fontSize: screenWidth < 360 ? 18 : 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: screenHeight * 0.02,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: screenHeight * 0.02,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
  },
  infoLabel: {
    fontSize: screenWidth < 360 ? 14 : 16,
    color: '#E0E0E0',
    opacity: 0.9,
    marginLeft: 12,
    width: screenWidth * 0.25,
  },
  infoValue: {
    flex: 1,
    fontSize: screenWidth < 360 ? 14 : 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  input: {
    flex: 1,
    fontSize: screenWidth < 360 ? 14 : 16,
    color: '#FFFFFF',
    marginLeft: 12,
    padding: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
  statsSection: {
    marginTop: screenHeight * 0.03,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: screenHeight * 0.02,
  },
  statCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: screenWidth * 0.04,
    alignItems: 'center',
    width: '31%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statValue: {
    fontSize: screenWidth < 360 ? 20 : 24,
    fontWeight: 'bold',
    color: '#D9D9D9',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: screenWidth < 360 ? 12 : 14,
    color: '#E0E0E0',
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D6D4CE',
  },
});

export default ProfileScreen;
