import React from 'react';
import { View, Text, Image, StyleSheet, FlatList } from 'react-native';

const CertificatesSection = () => {
  // Список фотографий из assets
  const certificates = [
    require('../../assets/certificate1.png'),
    require('../../assets/certificate2.png'),
    require('../../assets/certificate3.png'),
    require('../../assets/certificate4.png'),
    require('../../assets/certificate5.png'),
  ];

  // Рендеринг одной фотографии
  const renderItem = ({ item }) => {
    console.log('Rendering certificate item:', item);
    if (typeof item !== 'number') return null;
    return (
      <View style={styles.imageContainer}>
        <Image source={item} style={styles.image} />
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <Text style={styles.title}>Сертификаты участников</Text>

      {/* Список фотографий */}
      <FlatList
        data={certificates}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}`} // Убедимся, что ключ — строка
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0056b3', // Синий фон
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  listContainer: {
    alignItems: 'center', // Центрируем изображения
    gap: 12, // Расстояние между карточками
  },
  imageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4, // Уменьшены внутренние отступы контейнера
    marginBottom: 12,
    alignSelf: 'center', // Центрируем контейнер
    width: 360, // Чуть шире, чтобы изображение стало больше
  },
  image: {
    width: '100%', // Заполнение ширины контейнера
    height: 220, // Увеличена высота изображения
    resizeMode: 'cover', // Изображение заполняет контейнер
    borderRadius: 8, // Уменьшен радиус закругления
  },
});

export default CertificatesSection;
