import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const WelcomeScreen = () => {
  const [vacancies, setVacancies] = useState([]);
  const [news, setNews] = useState([]);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [appliedVacancies, setAppliedVacancies] = useState(new Set());
  const [modalVisible, setModalVisible] = useState(false);
  const modalAnimation = useState(new Animated.Value(0))[0];
  const auth = getAuth();

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'vacancies'));
        const fetchedVacancies = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVacancies(fetchedVacancies);
      } catch (error) {
        console.error('Ошибка загрузки вакансий:', error);
      }
    };

    const fetchNews = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'news'));
        const fetchedNews = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNews(fetchedNews);
      } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
      }
    };

    fetchVacancies();
    fetchNews();
  }, []);

  const applyForVacancy = async (vacancyId) => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Ошибка', 'Вы должны войти в систему, чтобы откликнуться на вакансию.');
      return;
    }

    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(
        applicationsRef,
        where('userId', '==', user.uid),
        where('vacancyId', '==', vacancyId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Alert.alert('Ошибка', 'Вы уже откликнулись на эту вакансию.');
        return;
      }

      await addDoc(applicationsRef, {
        userId: user.uid,
        vacancyId,
        createdAt: new Date().toISOString(),
      });

      setAppliedVacancies((prev) => new Set(prev).add(vacancyId));
      Alert.alert('Успех', 'Отклик доставлен!');
    } catch (error) {
      console.error('Ошибка при отклике на вакансию:', error);
      Alert.alert('Ошибка', 'Не удалось подать заявку. Попробуйте еще раз.');
    }
  };

  const handleOpenModal = (vacancy) => {
    setSelectedVacancy(vacancy);
    setModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const renderVacancy = ({ item }) => {
    const isApplied = appliedVacancies.has(item.id);
    return (
      <TouchableOpacity style={styles.card} onPress={() => handleOpenModal(item)}>
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/150' }}
          style={styles.cardImage}
        />
        <ScrollView style={styles.cardContent} nestedScrollEnabled>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
        </ScrollView>
        <TouchableOpacity
          style={[styles.button, isApplied && styles.buttonDisabled]}
          onPress={() => !isApplied && applyForVacancy(item.id)}
          disabled={isApplied}
        >
          <Text style={styles.buttonText}>
            {isApplied ? 'Отклик доставлен' : 'Откликнуться'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderNews = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={styles.cardImage}
      />
      <ScrollView style={styles.cardContent} nestedScrollEnabled>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Добро пожаловать!</Text>
      <Text style={styles.sectionTitle}>Новости</Text>
      <FlatList
        data={news}
        renderItem={renderNews}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
      <Text style={styles.sectionTitle}>Вакансии</Text>
      <FlatList
        data={vacancies}
        renderItem={renderVacancy}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
      {modalVisible && (
        <Modal transparent>
          <Animated.View style={[styles.modal, { opacity: modalAnimation }]}>
            <View style={styles.modalContent}>
              {selectedVacancy && (
                <>
                  <Image
                    source={{ uri: selectedVacancy.image }}
                    style={styles.modalImage}
                  />
                  <Text style={styles.modalTitle}>{selectedVacancy.title}</Text>
                  <Text style={styles.modalDescription}>{selectedVacancy.details}</Text>
                </>
              )}
              <TouchableOpacity style={styles.button} onPress={handleCloseModal}>
                <Text style={styles.buttonText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 28, fontWeight: '700', marginBottom: 16, color: '#34495E', textAlign: 'center' },
  sectionTitle: { fontSize: 22, fontWeight: '600', marginBottom: 12, color: '#34495E' },
  listContainer: { gap: 24 }, // Increased gap between cards
  card: { width: 280, backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  cardImage: { width: '100%', height: 150, borderRadius: 8, marginBottom: 8 },
  cardContent: { maxHeight: 120, marginBottom: 8 }, // Scrollable content area
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#34495E' },
  cardDescription: { fontSize: 14, color: '#7f8c8d' },
  button: { backgroundColor: '#3498db', padding: 10, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#bdc3c7' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 8, alignItems: 'center', width: '90%' },
  modalImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#34495E' },
  modalDescription: { fontSize: 16, color: '#7f8c8d', marginBottom: 16 },
});

export default WelcomeScreen;
