import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Переход на экран Login через 3 секунды
    setTimeout(() => {
      navigation.replace('Login');
    }, 3000);  // Время для показа splash
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: 'https://columb-us.kz/wp-content/uploads/2023/11/LogoColumbus.png',
        }}
        style={styles.logo}
        resizeMode="contain"  // Используем contain для пропорционального масштабирования изображения
      />
      <Text style={styles.text}>Добро Пожаловать!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  logo: {
    width: '80%',  // Устанавливаем ширину изображения в 80% от ширины экрана
    height: undefined,  // Высота будет определяться пропорциями изображения
    aspectRatio: 1,  // Сохраняем соотношение сторон изображения
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#354C90',
  },
});

export default SplashScreen;
