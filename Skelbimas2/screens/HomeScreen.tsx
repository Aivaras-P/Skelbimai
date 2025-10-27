import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AdItem from '../components/AdItem';
import { useAdContext } from '../context/AdContext';
import { useUserContext } from '../context/UserContext';

const categoriesList = ['CPU', 'GPU', 'Motherboard', 'RAM', 'PSU', 'Case'];

export default function HomeScreen() {
  const router = useRouter();
  const { ads, isLoading } = useAdContext();
  const { currentUser, logout } = useUserContext();

  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const toggleCategory = (cat: string) => {
    if (cat === 'Visi') {
      setSelectedCategories([]);
      return;
    }
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearch('');
    setShowOnlyMine(false);
  };

const filteredAds = useMemo(() => {
  const q = search.trim().toLowerCase();

  return ads.filter((ad) => {
    // Užtikrinam, kad visada turim masyvą kategorijų
    const adCategories: string[] = Array.isArray(ad.categories)
      ? ad.categories
      : ad.categories
      ? [ad.categories]
      : [];

    // Filtravimas pagal kategorijas
    const matchCategory =
      selectedCategories.length === 0 ||
      adCategories.some((c) => selectedCategories.includes(c));

    // Filtravimas pagal vartotoją
    const matchUser = !showOnlyMine || (currentUser && ad.username === currentUser.username);

    // Filtravimas pagal paiešką: pavadinimas arba kaina
    const matchSearch =
      q.length === 0 ||
      ad.title.toLowerCase().includes(q) ||     // pagal pavadinimą
      ad.price.toString().includes(q);          // pagal kainą

    return matchCategory && matchUser && matchSearch;
  });
}, [ads, selectedCategories, search, showOnlyMine, currentUser]);



  const renderCategoryButtons = () => {
    const allButtons = ['Visi', ...categoriesList];
    return (
      <FlatList
        data={allButtons}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const isVisi = item === 'Visi';
          const isActive =
            (isVisi && selectedCategories.length === 0) ||
            (!isVisi && selectedCategories.includes(item));

          return (
            <TouchableOpacity
              style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
              onPress={() => toggleCategory(item)}
            >
              <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#555" />
        <Text>Kraunama...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Viršuje dešinėje Prisijungti / Profilis */}
      <View style={styles.header}>
        {currentUser ? (
          <TouchableOpacity onPress={logout} style={styles.profileButton}>
            <Text style={{ color: '#fff' }}>Atsijungti ({currentUser.username})</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.profileButton}>
            <Text style={{ color: '#fff' }}>Prisijungti</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Paieška */}
      <TextInput
        placeholder="Paieška pagal pavadinimą ar aprašymą..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {/* Tik prisijungus rodomas filteris "Mano skelbimai / Visi" */}
      {currentUser && (
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, !showOnlyMine && styles.filterButtonActive]}
            onPress={() => setShowOnlyMine(false)}
          >
            <Text style={!showOnlyMine ? styles.filterTextActive : styles.filterText}>Visi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, showOnlyMine && styles.filterButtonActive]}
            onPress={() => setShowOnlyMine(true)}
          >
            <Text style={showOnlyMine ? styles.filterTextActive : styles.filterText}>Mano skelbimai</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Kategorijų filtrai */}
      <View style={styles.categoryContainer}>{renderCategoryButtons()}</View>

      {/* Clear filters */}
      <View style={styles.clearFiltersContainer}>
        <TouchableOpacity onPress={clearFilters}>
          <Text style={{ color: '#007AFF' }}>Išvalyti filtrus</Text>
        </TouchableOpacity>
      </View>

      {/* Skelbimai */}
      {filteredAds.length === 0 ? (
        <View style={styles.center}>
          <Text>Skelbimų nėra</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAds}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AdItem ad={item} onPress={(ad) => router.push(`/ad/${ad.id}`)} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add')}>
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa', paddingTop: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, marginBottom: 8 },
  profileButton: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  searchInput: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' },
  filterRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 6, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
  filterButtonActive: { backgroundColor: '#007AFF22', borderColor: '#007AFF' },
  filterText: { color: '#333' },
  filterTextActive: { color: '#007AFF', fontWeight: '600' },
  categoryContainer: { height: 50, marginBottom: 4 },
  categoryButton: { paddingHorizontal: 14, paddingVertical: 8, marginHorizontal: 6, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
  categoryButtonActive: { backgroundColor: '#007AFF22', borderColor: '#007AFF' },
  categoryText: { color: '#333', fontSize: 14 },
  categoryTextActive: { color: '#007AFF', fontWeight: '600' },
  clearFiltersContainer: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, marginBottom: 8 },
  addButton: { position: 'absolute', right: 20, bottom: 30, backgroundColor: '#007AFF', borderRadius: 40, width: 60, height: 60, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  addButtonText: { color: '#fff', fontSize: 32, marginTop: -3 },
});
