import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';

const ColumbusCards = [
  {
    id: '1',
    title: '12 ЛЕТ',
    subtitle: 'Мы занимаемся оформлением и отправкой студентов по программе Work and Travel USA',
    image: require('../../assets/img1.png'), // Ваш путь к файлу
  },
  {
    id: '2',
    title: 'КАЧЕСТВО',
    subtitle: 'Лучшие условия и поддержка студентов на каждом этапе программы.',
    image: require('../../assets/img1.png'),
  },
  {
    id: '3',
    title: 'ОПЫТ',
    subtitle: 'Тысячи успешных историй студентов по всему миру.',
    image: require('../../assets/img1.png'),
  },
  {
    id: '4',
    title: 'СЕРТИФИКАТЫ',
    subtitle: 'Официально аккредитованный партнер программы Work and Travel.',
    image: require('../../assets/img1.png'),
  },
  {
    id: '5',
    title: 'ПОДДЕРЖКА',
    subtitle: 'Мы на связи 24/7 для ваших вопросов и помощи.',
    image: require('../../assets/img1.png'),
  },
];

const renderCard = ({ item }) => (
  <View style={styles.card}>
    {/* Изображение растягивается по ширине карточки */}
    <Image source={item.image} style={styles.cardImage} />
    {/* Заголовок и текст выравнены по левому краю */}
    <Text style={styles.cardTitle}>{item.title}</Text>
    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
  </View>
);

const ColumbusSection = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={ColumbusCards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cardsContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 20,
  },
  cardsContainer: {
    gap: 16, // Отступ между карточками
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden', // Чтобы изображение повторяло границы карточки
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginVertical: 12,
  },
  cardImage: {
    width: '100%',
    height: 180, // Высота изображения
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495E',
    marginVertical: 8,
    marginHorizontal: 12, // Отступ от краев
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginHorizontal: 12,
    marginBottom: 12,
  },
});

export default ColumbusSection;
