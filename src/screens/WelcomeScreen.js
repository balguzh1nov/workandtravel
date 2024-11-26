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
  Animated,
} from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import ColumbusSection from './ColumbusSection';

const WelcomeScreen = () => {
  const [vacancies, setVacancies] = useState([]);
  const [news, setNews] = useState([]);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [appliedVacancies, setAppliedVacancies] = useState(new Set());
  const [modalVisible, setModalVisible] = useState(false);
  const modalAnimation = useState(new Animated.Value(0))[0];
  const auth = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Загрузка вакансий
        const vacanciesSnapshot = await getDocs(collection(db, 'vacancies'));
        const fetchedVacancies = vacanciesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: 'vacancy',
        }));
        setVacancies(fetchedVacancies);

        // Загрузка новостей
        const newsSnapshot = await getDocs(collection(db, 'news'));
        const fetchedNews = newsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: 'news',
        }));
        setNews(fetchedNews);

        // Проверка откликов
        const applicationsSnapshot = await getDocs(
          query(collection(db, 'applications'), where('userId', '==', user.uid))
        );
        const appliedVacancyIds = new Set(
          applicationsSnapshot.docs.map((doc) => doc.data().vacancyId)
        );
        setAppliedVacancies(appliedVacancyIds);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };

    fetchData();
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
    console.log('Opening modal for:', vacancy);
    setSelectedVacancy(vacancy);
    setModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseModal = () => {
    console.log('Closing modal');
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
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
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
    <View style={styles.newsCard}>
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={styles.cardImage}
      />
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
    </View>
  );

  return (
    <>
      <FlatList
        data={[...news, { id: 'vacancy-header', type: 'vacancyHeader' }, ...vacancies]}
        renderItem={({ item }) => {
          if (item.type === 'vacancyHeader') {
            return <Text style={styles.sectionTitle}>Вакансии</Text>;
          }
          return item.type === 'vacancy'
            ? renderVacancy({ item })
            : renderNews({ item });
        }}
        keyExtractor={(item, index) => `${item.type}-${item.id || index}`}
        ListHeaderComponent={() => (
          <View>
            <Text style={styles.header}>Добро пожаловать!</Text>
            <Text style={styles.sectionTitle}>Новости</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={() => (
          <View>
            <Text style={styles.sectionTitle}>COLUMBUS WORK TRAVEL ЭТО -</Text>
            <ColumbusSection />
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />

      {/* Модальное окно */}
      {modalVisible && (
        <Modal transparent>
          <Animated.View style={[styles.modal, { opacity: modalAnimation }]}>
            <View style={styles.modalContent}>
              {selectedVacancy && (
                <>
                  <Image
                    source={{ uri: selectedVacancy.image || 'https://via.placeholder.com/150' }}
                    style={styles.modalImage}
                  />
                  <Text style={styles.modalTitle}>{selectedVacancy.title}</Text>
                  <Text style={styles.modalDescription}>{selectedVacancy.description}</Text>
                </>
              )}
              <TouchableOpacity style={styles.button} onPress={handleCloseModal}>
                <Text style={styles.buttonText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    color: '#34495E',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 12,
    color: '#34495E',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 12,
  },
  newsCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 12,
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#34495E',
  },
  cardDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    width: '90%',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#34495E',
  },
  modalDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  separator: {
    height: 16,
  },
});

export default WelcomeScreen;
