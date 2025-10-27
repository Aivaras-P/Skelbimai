import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useAdContext } from '../context/AdContext';
import { useUserContext } from '../context/UserContext';
import { Ad, ContactInfo } from '../types/Ad';

const categoriesList = ['CPU', 'GPU', 'Motherboard', 'RAM', 'PSU', 'Case'];


export default function AddEditAdScreen() {
  const { currentUser } = useUserContext();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { ads, addAd, updateAd } = useAdContext();
  const router = useRouter();

  const editingAd = ads.find((ad) => ad.id === editId);
  const canEdit = editingAd?.username === currentUser?.username;


  const [title, setTitle] = useState(editingAd?.title || '');
  const [description, setDescription] = useState(editingAd?.description || '');
  const [price, setPrice] = useState(editingAd?.price?.toString() || '');
  const [categories, setCategories] = useState<string[]>(editingAd?.categories || []);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const [contacts, setContacts] = useState<ContactInfo>(
    editingAd?.contacts || { name: '', phone: '', email: '' }
  );
  const [images, setImages] = useState<string[]>(editingAd?.images || []);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Reikia leidimo', 'Suteikite prieigą prie galerijos.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uris = result.assets.map((asset) => asset.uri);
        setImages((prev) => [...prev, ...uris]);
      }
    } catch (err) {
      console.log('ImagePicker error:', err);
      Alert.alert('Klaida', 'Nepavyko įkelti nuotraukos.');
    }
  };

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = () => {
    if (!title.trim() || !description.trim() || !price.trim()) {
      Alert.alert('Klaida', 'Užpildykite visus privalomus laukus.');
      return;
    }

    const now = Date.now();
    const reorderedImages = [...images];
    if (mainImageIndex > 0) {
      const [mainImage] = reorderedImages.splice(mainImageIndex, 1);
      reorderedImages.unshift(mainImage);
    }

    const ad: Ad = {
      id: editId ?? uuidv4(),
      title,
      description,
      price: parseFloat(price),
      categories: categories as Ad['categories'],
      images: reorderedImages,
      contacts,
      createdAt: editingAd?.createdAt ?? now,
      updatedAt: now,
      username: currentUser?.username || 'guest',
    };

    if (editId) {
      updateAd(ad);
      Alert.alert('Atnaujinta', 'Skelbimas atnaujintas!');
    } else {
      addAd(ad);
      Alert.alert('Sukurta', 'Naujas skelbimas pridėtas!');
    }

    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Pavadinimas */}
      <Text style={styles.label}>Pavadinimas</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholder="Pvz. Ryzen 7 5800X"
      />

      {/* Aprašymas */}
      <Text style={styles.label}>Aprašymas</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { height: 80 }]}
        multiline
        placeholder="Būklė, specifikacijos..."
      />

      {/* Kaina */}
      <Text style={styles.label}>Kaina (€)</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        style={styles.input}
        keyboardType="numeric"
        placeholder="Pvz. 120"
      />

{/* Kategorijos */}
<Text style={styles.label}>Kategorijos</Text>
<TouchableOpacity
  style={styles.dropdownButton}
  onPress={() => setCategoryModalVisible(true)}
>
  <Text>
    {categories.length > 0
      ? categories.join(', ')
      : 'Pasirinkite kategorijas'}
  </Text>
</TouchableOpacity>

{/* Modal su pasirinkimu */}
<Modal visible={categoryModalVisible} transparent animationType="fade">
  <View style={styles.overlay}>
    <View style={styles.modalBox}>
      <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 10 }}>
        Pasirinkite kategorijas:
      </Text>

      <ScrollView style={{ maxHeight: 250 }}>
        {categoriesList.map((cat) => {
          const isSelected = categories.includes(cat);
          return (
            <TouchableOpacity
              key={cat}
              onPress={() =>
                setCategories((prev) =>
                  isSelected
                    ? prev.filter((c) => c !== cat)
                    : [...prev, cat]
                )
              }
              style={[
                styles.categoryItem,
                isSelected && styles.categoryItemSelected,
              ]}
            >
              <Text
                style={{
                  color: isSelected ? '#fff' : '#000',
                  fontWeight: isSelected ? '600' : '400',
                }}
              >
                {isSelected ? '✓ ' : ''}
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => setCategoryModalVisible(false)}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>Baigti</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


      {/* Kontaktai */}
      <Text style={styles.label}>Kontaktai</Text>
      <TextInput
        value={contacts.name}
        onChangeText={(v) => setContacts({ ...contacts, name: v })}
        style={styles.input}
        placeholder="Vardas ir pavardė"
        placeholderTextColor="#999"
      />
      <TextInput
        value={contacts.phone}
        onChangeText={(v) => setContacts({ ...contacts, phone: v })}
        style={styles.input}
        keyboardType="phone-pad"
        placeholder="Tel. nr."
        placeholderTextColor="#999"
      />
      <TextInput
        value={contacts.email}
        onChangeText={(v) => setContacts({ ...contacts, email: v })}
        style={styles.input}
        keyboardType="email-address"
        placeholder="El. paštas"
        placeholderTextColor="#999"
      />

      {/* Nuotraukų picker */}
      <TouchableOpacity
        style={[styles.saveButton, { marginBottom: 12 }]}
        onPress={handlePickImage}
      >
        <Text style={styles.saveButtonText}>Įkelti nuotrauką</Text>
      </TouchableOpacity>

      {/* Pagrindinė nuotrauka */}
      {images.length > 0 && (
        <Image
          source={{ uri: images[mainImageIndex] }}
          style={{
            width: '100%',
            height: 250,
            borderRadius: 10,
            marginBottom: 12,
          }}
          resizeMode="cover"
        />
      )}

      {/* Horizontalus ScrollView */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 12 }}
      >
        {images.map((uri, index) => (
          <View key={index} style={{ marginRight: 8 }}>
            <TouchableOpacity onPress={() => setMainImageIndex(index)}>
              <Image
                source={{ uri }}
                style={{
                  width: mainImageIndex === index ? 130 : 120,
                  height: mainImageIndex === index ? 130 : 120,
                  borderRadius: 10,
                  borderWidth: mainImageIndex === index ? 2 : 0,
                  borderColor: '#007AFF',
                }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                Alert.alert('Ištrinti nuotrauką', 'Ar tikrai norite ištrinti šią nuotrauką?', [
                  { text: 'Atšaukti', style: 'cancel' },
                  {
                    text: 'Ištrinti',
                    style: 'destructive',
                    onPress: () => {
                      setImages((prev) => prev.filter((_, i) => i !== index));
                      if (mainImageIndex === index) setMainImageIndex(0);
                      else if (mainImageIndex > index) setMainImageIndex((prev) => prev - 1);
                    },
                  },
                ])
              }
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                backgroundColor: '#ff3b30',
                width: 24,
                height: 24,
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Preview */}
      <Text style={styles.previewTitle}>Peržiūra:</Text>
      <View style={styles.previewCard}>
        {images[mainImageIndex] && (
          <Image source={{ uri: images[mainImageIndex] }} style={styles.previewImage} />
        )}
        <Text style={styles.previewTitleText}>{title || 'Pavadinimas'}</Text>
        <Text>{description || 'Aprašymas...'}</Text>
        <Text style={{ color: '#007AFF' }}>{price ? `${price} €` : ''}</Text>
        <Text>
          Kategorijos: {categories.length > 0 ? categories.join(', ') : '—'}
        </Text>
        <Text>
          Kontaktai: {contacts.name} {contacts.phone} {contacts.email}
        </Text>
      </View>

      {/* Išsaugoti */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{editId ? 'Atnaujinti' : 'Sukurti'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fafafa', paddingBottom: 40 },
  label: { fontSize: 15, marginBottom: 4, color: '#333', fontWeight: '500' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  dropdownButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '60%',
  },
  categoryItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },
  categoryItemSelected: {
    backgroundColor: '#007AFF',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  previewTitle: { fontSize: 16, fontWeight: '600', marginVertical: 8 },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  previewImage: { width: '100%', height: 120, borderRadius: 8, marginBottom: 8 },
  previewTitleText: { fontWeight: '600', fontSize: 16, marginBottom: 4 },
});
