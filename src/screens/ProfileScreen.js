import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

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

const ProfileScreen = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setPhoneNumber(data.phoneNumber || '');
          setCity(data.city || '');
        } else {
          Alert.alert('Ошибка', 'Данные пользователя не найдены.');
        }
      } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить данные профиля.');
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleSaveChanges = async () => {
    if (!phoneNumber || !city) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля.');
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        phoneNumber,
        city,
      });

      setUserData((prev) => ({
        ...prev,
        phoneNumber,
        city,
      }));
      setIsEditing(false);

      Alert.alert('Успех', 'Данные профиля обновлены.');
    } catch (error) {
      console.error('Ошибка обновления данных:', error);
      Alert.alert('Ошибка', 'Не удалось обновить данные профиля.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Подтверждение выхода',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth.signOut();
              navigation.replace('Login'); // Перенаправление на экран логина
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось выйти из профиля.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  const filteredCities = kazakhstanCities.filter((c) =>
    c.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#354C90" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Мой профиль</Text>

      {userData && (
        <>
          <View style={styles.infoSection}>
            <Text style={styles.label}>Имя:</Text>
            <Text style={styles.value}>{userData.firstName}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Фамилия:</Text>
            <Text style={styles.value}>{userData.lastName}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Электронная почта:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Номер телефона:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder="Введите номер телефона"
              />
            ) : (
              <Text style={styles.value}>{userData.phoneNumber || 'Не указан'}</Text>
            )}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Город:</Text>
            {isEditing ? (
              <TouchableOpacity
                style={styles.cityInput}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.cityText}>
                  {city || 'Выберите город'}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.value}>{userData.city || 'Не указан'}</Text>
            )}
          </View>

          {isEditing ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveChanges}
              >
                <Icon name="check" size={20} color="#fff" />
                <Text style={styles.buttonText}>Сохранить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setIsEditing(false);
                  setPhoneNumber(userData.phoneNumber || '');
                  setCity(userData.city || '');
                }}
              >
                <Icon name="times" size={20} color="#fff" />
                <Text style={styles.buttonText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Icon name="pencil" size={16} color="#fff" />
              <Text style={styles.editButtonText}>Редактировать</Text>
            </TouchableOpacity>
          )}
            {/* Кнопка "Выйти" */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Icon name="sign-out" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Выйти</Text>
          </TouchableOpacity>
        </>
      )}

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#354C90',
  },
  infoSection: {
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#7d7d7d',
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginTop: 5,
  },
  cityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  cityText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
    width: '50%',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },  
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff', // Белый цвет текста
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5, // Если используется иконка
  },  
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  editButton: {
    alignSelf: 'center',
    backgroundColor: '#354C90',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default ProfileScreen;
