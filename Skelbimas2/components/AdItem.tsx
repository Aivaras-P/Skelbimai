import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUserContext } from '../context/UserContext';
import { Ad } from '../types/Ad';

type Props = { ad: Ad; onPress: (ad: Ad) => void };

export default function AdItem({ ad, onPress }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const { currentUser, toggleFavorite, isFavorite } = useUserContext();

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] });
  const opacity = anim;
  const favorite = isFavorite?.(ad.id);

  const isOwner = currentUser?.username === ad.username;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }], opacity }]}>
      <TouchableOpacity onPress={() => onPress(ad)}>
        {ad.images?.[0] ? (
          <Image source={{ uri: ad.images[0] }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text>No Photo</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.title}>{ad.title}</Text>
          <Text style={styles.price}>{ad.price} €</Text>
          {Array.isArray(ad.categories) ? (
            <Text style={styles.category}>{ad.categories.join(', ')}</Text>
          ) : (
            <Text style={styles.category}>{ad.categories}</Text>
          )}
          <Text style={styles.username}>Vartotojas: {ad.username}</Text>
        </View>
      </TouchableOpacity>

      {/* Tik kitų skelbimams galima įsiminti */}
      {currentUser && !isOwner && (
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite?.(ad.id)}
        >
          <Text style={{ fontSize: 22 }}>{favorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { margin: 8, borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff', elevation: 2 },
  image: { width: '100%', height: 180 },
  placeholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f2f2' },
  info: { padding: 10 },
  title: { fontSize: 16, fontWeight: '600' },
  price: { marginTop: 6, fontWeight: '700' },
  category: { marginTop: 4, color: '#666' },
  username: { marginTop: 2, color: '#999', fontSize: 12 },
  favoriteButton: { position: 'absolute', right: 10, top: 10 },
});
