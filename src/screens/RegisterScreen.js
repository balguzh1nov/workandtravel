import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const kazakhstanCities = [
  'Алматы',
  'Нур-Султан',
  'Шымкент',
  'Караганда',
  'Актобе',
  'Тараз',
  'Павлодар',
  'Усть-Каменогорск',
  'Семей',
  'Костанай',
  'Атырау',
  'Кызылорда',
  'Уральск',
  'Петропавловск',
  'Актау',
  'Темиртау',
  'Туркестан',
];

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+7');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Валидация данных пользователя
  const validate = () => {
    const newErrors = {};
    if (!firstName) newErrors.firstName = 'Введите имя';
    if (!lastName) newErrors.lastName = 'Введите фамилию';
    if (!phoneNumber || !/^\+7[0-9]{10}$/.test(phoneNumber))
      newErrors.phoneNumber = 'Введите корректный номер телефона (начинается с +7)';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Введите корректный адрес электронной почты';
    if (!city) newErrors.city = 'Выберите город';
    if (!password) newErrors.password = 'Введите пароль';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Пароли не совпадают';
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Логика регистрации пользователя
  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    const auth = getAuth();

    try {
      // Регистрируем пользователя в Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Добавляем информацию о пользователе в коллекцию Firestore
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        phoneNumber,
        email,
        city,
        createdAt: new Date().toISOString(),
      });

      setLoading(false);
      Alert.alert('Успех', 'Регистрация прошла успешно!');

      // Сбрасываем стек навигации и переходим на WelcomeScreen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'WelcomeScreen' }],
        })
      );
    } catch (error) {
      setLoading(false);
      console.error('Ошибка регистрации:', error);
      let errorMessage = 'Что-то пошло не так. Попробуйте ещё раз.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Этот email уже зарегистрирован.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Пароль слишком слабый.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Проблема с сетью. Проверьте подключение.';
      }
      Alert.alert('Ошибка', errorMessage);
    }
  };

  const filteredCities = kazakhstanCities.filter((c) =>
    c.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar barStyle="light-content" backgroundColor="#354C90" />
        <View style={styles.innerContainer}>
          <Image
            style={styles.myLogo}
            source={{
              uri: 'https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-83.jpg',
            }}
          />
          <Text style={styles.title}>Регистрация</Text>
          <TextInput
            style={styles.input}
            placeholder="Введите имя"
            value={firstName}
            onChangeText={setFirstName}
          />
          {errors.firstName && <Text style={styles.error}>{errors.firstName}</Text>}
          <TextInput
            style={styles.input}
            placeholder="Введите фамилию"
            value={lastName}
            onChangeText={setLastName}
          />
          {errors.lastName && <Text style={styles.error}>{errors.lastName}</Text>}
          <View style={styles.phoneContainer}>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              placeholder="Введите номер телефона"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={(text) => {
                if (text.startsWith('+7') && text.length <= 12) {
                  setPhoneNumber(text);
                } else if (!text.startsWith('+7')) {
                  setPhoneNumber('+7');
                }
              }}              
            />
          </View>
          {errors.phoneNumber && <Text style={styles.error}>{errors.phoneNumber}</Text>}
          <TextInput
            style={styles.input}
            placeholder="Введите почту"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}
          <TouchableOpacity
            style={[styles.input, styles.citySelector]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={{ color: city ? '#000' : '#999' }}>
              {city || 'Выберите город'}
            </Text>
          </TouchableOpacity>
          {errors.city && <Text style={styles.error}>{errors.city}</Text>}
          <TextInput
            style={styles.input}
            placeholder="Введите пароль"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {errors.password && <Text style={styles.error}>{errors.password}</Text>}
          <TextInput
            style={styles.input}
            placeholder="Подтвердите пароль"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}

          {loading ? (
            <ActivityIndicator size="large" color="#354C90" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Зарегистрироваться</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.replace('Login')}
          >
            <Text style={styles.linkText}>Уже есть аккаунт? Войти</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal for selecting city */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Выберите город</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Поиск города"
              value={searchText}
              onChangeText={setSearchText}
            />
            <FlatList
              data={filteredCities}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityOption}
                  onPress={() => {
                    setCity(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.cityOptionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40, // Пространство для жестов iOS
    backgroundColor: '#FFF',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  myLogo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#354C90',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 10,
    backgroundColor: '#F9F9F9',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  phoneInput: {
    flex: 1, // Занимает оставшееся пространство
  },
  citySelector: {
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#354C90',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
  link: {
    marginTop: 15,
  },
  linkText: {
    color: '#354C90',
    fontSize: 14,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    height: '70%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  cityOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cityOptionText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: '#354C90',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RegisterScreen;
