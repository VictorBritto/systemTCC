import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../routes/supabase';

const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };

    fetchUser();
  }, []);

  if (!user) return null;

  const { email, user_metadata } = user;
  const displayName = user_metadata?.name || 'Victor Gabriel';
  const photoURL = user_metadata?.avatar_url || 'https://via.placeholder.com/100';
  const phone = user_metadata?.phone || '+5519928343697';

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permissão negada", "Você precisa permitir o acesso às fotos.");
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
      uploadImageToSupabase(imageUri);
    }
  };

  const uploadImageToSupabase = async (uri: string) => {
    const fileName = `avatars/${user.id}-${new Date().toISOString()}.jpg`;

    const file = await fetch(uri);
    const blob = await file.blob();

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      Alert.alert("Erro", "Erro ao enviar imagem.");
      console.log(uploadError);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    const publicUrl = data?.publicUrl;

    if (!publicUrl) {
      Alert.alert("Erro", "Não foi possível obter a URL pública.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        avatar_url: publicUrl,
      },
    });

    if (updateError) {
      Alert.alert("Erro", "Erro ao atualizar avatar.");
    } else {
      setUser((prev: { user_metadata: any; }) => ({ ...prev, user_metadata: { ...prev.user_metadata, avatar_url: publicUrl } }));
      Alert.alert("Sucesso", "Foto atualizada!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Seu perfil</Text>

      <View style={styles.avatarContainer}>
        <Image source={{ uri: photoURL }} style={styles.avatar} />
        <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}>
          <Ionicons name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.name}>{displayName}</Text>
      <Text style={styles.activeSince}>Ativo desde - agosto de 2022</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Informações pessoais</Text>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>

        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={20} color="#888" />
          <Text style={styles.infoText}>{email}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={20} color="#888" />
          <Text style={styles.infoText}>{phone}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={20} color="#888" />
          <Text style={styles.infoText}>Interior</Text>
        </View>
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#f4f6f9', paddingTop: 140 },
  header: { fontSize: 18, fontWeight: '600', marginBottom: 20 },
  avatarContainer: { position: 'relative', marginBottom: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ccc' },
  cameraIcon: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#007AFF', padding: 6, borderRadius: 20
  },
  name: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  subtext: { fontSize: 14, color: '#888' },
  activeSince: { fontSize: 12, color: '#aaa', marginTop: 2 },

  infoCard: {
    marginTop: 25, width: '90%', backgroundColor: '#fff',
    padding: 20, borderRadius: 12, elevation: 2, position: 'relative'
  },
  infoTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  editBtn: { position: 'absolute', top: 20, right: 20 },
  editText: { color: '#007AFF', fontWeight: '500' },

  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 15
  },
  infoText: { marginLeft: 10, fontSize: 14, color: '#333' },
});
