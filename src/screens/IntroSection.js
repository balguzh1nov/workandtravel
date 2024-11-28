import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const IntroSection = () => {
    return (
      <View style={styles.container}>
        {/* Фоновое изображение с градиентом */}
        <Image
          source={require('../../assets/background.jpg')} // Ваш фон
          style={styles.backgroundImage}
        />
        <LinearGradient
          colors={['rgba(6, 147, 227, 0)', 'rgba(32, 98, 214, 0.8)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientOverlay}
        />
  
        {/* Контент */}
        <View style={styles.overlay}>
          {/* Логотип */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')} // Логотип
              style={styles.logo}
            />
          </View>
  
          {/* Заголовок */}
          <Text style={styles.title}>Открой Америку с нами!</Text>
  
          {/* Карточка */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Путешествовать по США все лето
            </Text>
            <Text style={styles.cardDescription}>
              и познакомиться с культурой этой страны
            </Text>
          </View>
        </View>
  
        {/* Статуя Свободы */}
        <Image
          source={require('../../assets/statue-of-liberty.png')} // Статуя Свободы
          style={styles.statueImage}
        />
      </View>
    );
  };
  

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: 400,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 2,
  },
  logoContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24, // Уменьшен заголовок
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  statueImage: {
    position: 'absolute',
    bottom: 0, // Перемещаем статую в правый нижний угол
    right: 0,
    width: 150,
    height: 200,
    resizeMode: 'contain',
    zIndex: 3,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '70%',
    alignItems: 'flex-start',
    marginTop: 25,
    zIndex: 1,
    transform: [{ translateX: -50 }], // Сдвигаем карточку на 20px влево
  },  
  cardTitle: {
    fontSize: 16, // Уменьшен размер текста
    fontWeight: '700',
    color: '#34495E',
    marginBottom: 8,
    width: '100%',
  },
  cardDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'left', // Выравнивание текста влево
  },
});

export default IntroSection;
