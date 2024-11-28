import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';

const ColumbusCards = [
  {
    id: '1',
    title: '12 ЛЕТ',
    subtitle: 'Мы занимаемся оформлением и отправкой студентов по программе Work and Travel USA',
    image: require('../../assets/img2.png'), // Ваш путь к файлу
  },
  {
    id: '2',
    title: '80',
    subtitle: 'Работодателей из 50 штатов США, из которых можно выбрать, где хочешь работать или жить',
    image: require('../../assets/img1.png'),
  },
  {
    id: '3',
    title: '5',
    subtitle: 'Собственных офисов в Казахстане для того, чтобы каждый студент мог получить возможность участия в программе Work and Travel USA',
    image: require('../../assets/img3.png'),
  },
  {
    id: '4',
    title: '15',
    subtitle: 'Сотрудников, которые сами ежегодно пользуются этой программой и могут рассказать о своем опыте путешествий и международной стажировки',
    image: require('../../assets/img4.png'),
  },
  {
    id: '5',
    title: '4.9',
    subtitle: 'Средний рейтинг оценок на 2ГИС',
    image: require('../../assets/img5.png'),
  },{
    id: '6',
    title: '24 / 7',
    subtitle: 'Поддержка на территории США и Казахстана нашими координаторами',
    image: require('../../assets/img6.png'),
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
