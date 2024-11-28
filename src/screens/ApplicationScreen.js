import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const steps = [
  'Ваше ФИО',
  'В каком ВУЗе вы обучаетесь?',
  'На каком вы сейчас курсе обучения?',
  'Ваши контакты (номер телефона)',
  'Выберите свой город, чтобы с вами связался координатор',
  'Нужна ли вам дополнительная консультация перед регистрацией?',
  'На каком языке хотели бы получить консультацию?',
  'Выберите удобный способ для получения консультации',
];

const courses = [
  '1 курс',
  '2 курс',
  '3 курс',
  '4 курс',
  'Послевузовое обучение (магистратура, интернатура)',
  'Я не студент ВУЗа',
];

const cities = ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Другой город'];

const ApplicationScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    university: '',
    course: '',
    phoneNumber: '',
    city: '',
    additionalConsultation: '',
    preferredLanguage: '',
    consultationMethod: '',
  });
  const [errors, setErrors] = useState({});
  const [applicationStatus, setApplicationStatus] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchApplicationStatus = async () => {
      try {
        if (!user) {
          Alert.alert('Ошибка', 'Пользователь не авторизован.');
          return;
        }

        const docRef = doc(db, 'applicants', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setApplicationStatus(docSnap.data().status);
        }
      } catch (error) {
        console.error('Ошибка проверки заявки:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить статус заявки. Попробуйте позже.');
      }
    };

    fetchApplicationStatus();
  }, []);

  const validateStep = () => {
    const newErrors = {};
    switch (currentStep) {
      case 0:
        if (!formData.fullName) newErrors.fullName = 'Введите ваше ФИО';
        break;
      case 1:
        if (!formData.university) newErrors.university = 'Введите название университета';
        break;
      case 2:
        if (!formData.course) newErrors.course = 'Выберите текущий курс';
        break;
      case 3:
        if (!formData.phoneNumber) {
          newErrors.phoneNumber = 'Введите номер телефона';
        } else if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(formData.phoneNumber)) {
          newErrors.phoneNumber = 'Неверный формат номера (пример: +7 (700) 123-45-67)';
        }
        break;
      case 4:
        if (!formData.city) newErrors.city = 'Выберите город';
        break;
      case 5:
        if (!formData.additionalConsultation) newErrors.additionalConsultation = 'Выберите вариант';
        break;
      case 6:
        if (!formData.preferredLanguage) newErrors.preferredLanguage = 'Выберите язык';
        break;
      case 7:
        if (!formData.consultationMethod) newErrors.consultationMethod = 'Выберите способ консультации';
        break;
      default:
        break;
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      Alert.alert('Ошибка', 'Заполните все необходимые поля:\n' + Object.values(newErrors).join('\n'));
      return false;
    }
    return true;
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhoneNumberInput = (text) => {
    let cleaned = text.replace(/\D/g, '');
    let formattedText = '+7 ';
    if (cleaned.length > 1) formattedText += `(${cleaned.slice(1, 4)}) `;
    if (cleaned.length > 4) formattedText += `${cleaned.slice(4, 7)}-`;
    if (cleaned.length > 7) formattedText += `${cleaned.slice(7, 9)}-`;
    if (cleaned.length > 9) formattedText += cleaned.slice(9, 11);
    handleInputChange('phoneNumber', formattedText.slice(0, 18));
  };

  const handleNextStep = async () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        try {
          if (!user) {
            Alert.alert('Ошибка', 'Вы должны войти в систему для отправки заявки.');
            return;
          }

          const docRef = doc(db, 'applicants', user.uid);
          await setDoc(docRef, {
            ...formData,
            status: 'В ожидании',
            submittedAt: new Date().toISOString(),
          });

          setApplicationStatus('В ожидании');
          Alert.alert('Успех', 'Заявка успешно отправлена!');
        } catch (error) {
          console.error('Ошибка отправки данных:', error);
          Alert.alert('Ошибка', 'Не удалось отправить данные. Попробуйте позже.');
        }
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    if (applicationStatus) {
      // Отображение статуса заявки
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Статус вашей заявки: {applicationStatus}</Text>
          <Text style={styles.statusHint}>
            Для изменения заявки обратитесь в поддержку.
          </Text>
        </View>
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <TextInput
            style={[styles.input, errors.fullName && styles.errorInput]}
            placeholder="Введите ваше ФИО"
            value={formData.fullName}
            onChangeText={(text) => handleInputChange('fullName', text)}
          />
        );
      case 1:
        return (
          <TextInput
            style={[styles.input, errors.university && styles.errorInput]}
            placeholder="Введите название университета"
            value={formData.university}
            onChangeText={(text) => handleInputChange('university', text)}
          />
        );
        case 2: // Текущий курс
        return (
          <FlatList
            data={courses}
            keyExtractor={(item) => item}
            nestedScrollEnabled
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.option, formData.course === item && styles.selectedOption]}
                onPress={() => handleInputChange('course', item)}
              >
                <Text
                  style={[
                    styles.optionText,
                    formData.course === item && styles.selectedOptionText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        );
      case 3:
        return (
          <TextInput
            style={[styles.input, errors.phoneNumber && styles.errorInput]}
            placeholder="+7 (___) ___-__-__"
            value={formData.phoneNumber}
            onChangeText={handlePhoneNumberInput}
          />
        );
        case 4: // Выбор города
        return (
          <FlatList
            data={cities}
            keyExtractor={(item) => item}
            nestedScrollEnabled
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.option, formData.city === item && styles.selectedOption]}
                onPress={() => handleInputChange('city', item)}
              >
                <Text
                  style={[
                    styles.optionText,
                    formData.city === item && styles.selectedOptionText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        );

        case 5: // Дополнительная консультация
        return (
          <>
            <TouchableOpacity
              style={[
                styles.option,
                formData.additionalConsultation === 'Да' && styles.selectedOption,
              ]}
              onPress={() => handleInputChange('additionalConsultation', 'Да')}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.additionalConsultation === 'Да' &&
                    styles.selectedOptionText,
                ]}
              >
                Да, есть вопросы, хотел бы уточнить некоторые моменты
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.option,
                formData.additionalConsultation === 'Нет' && styles.selectedOption,
              ]}
              onPress={() => handleInputChange('additionalConsultation', 'Нет')}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.additionalConsultation === 'Нет' &&
                    styles.selectedOptionText,
                ]}
              >
                Нет, готов к регистрации
              </Text>
            </TouchableOpacity>
          </>
        );
  
      case 6: // Язык консультации
        return (
          <>
            <TouchableOpacity
              style={[
                styles.option,
                formData.preferredLanguage === 'Казахский' && styles.selectedOption,
              ]}
              onPress={() => handleInputChange('preferredLanguage', 'Казахский')}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.preferredLanguage === 'Казахский' &&
                    styles.selectedOptionText,
                ]}
              >
                Казахский
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.option,
                formData.preferredLanguage === 'Русский' && styles.selectedOption,
              ]}
              onPress={() => handleInputChange('preferredLanguage', 'Русский')}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.preferredLanguage === 'Русский' &&
                    styles.selectedOptionText,
                ]}
              >
                Русский
              </Text>
            </TouchableOpacity>
          </>
        );
  
      case 7: // Способ консультации
        return (
          <>
            <TouchableOpacity
              style={[
                styles.option,
                formData.consultationMethod === 'Текстовым сообщением' &&
                  styles.selectedOption,
              ]}
              onPress={() =>
                handleInputChange('consultationMethod', 'Текстовым сообщением')
              }
            >
              <Text
                style={[
                  styles.optionText,
                  formData.consultationMethod === 'Текстовым сообщением' &&
                    styles.selectedOptionText,
                ]}
              >
                Текстовым сообщением
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.option,
                formData.consultationMethod === 'Звонком' && styles.selectedOption,
              ]}
              onPress={() => handleInputChange('consultationMethod', 'Звонком')}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.consultationMethod === 'Звонком' &&
                    styles.selectedOptionText,
                ]}
              >
                Посредством звонка от координатора
              </Text>
            </TouchableOpacity>
          </>
        );
  
      default:
        return <Text>Шаг {currentStep + 1}</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {applicationStatus ? (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Статус вашей заявки: {applicationStatus}</Text>
          <Text style={styles.statusHint}>
            Для изменения заявки обратитесь в поддержку.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.header}>{steps[currentStep]}</Text>
          <View style={styles.stepContent}>{renderStepContent()}</View>
          <View style={styles.navigation}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.navButton} onPress={handlePreviousStep}>
                <Text style={styles.navButtonText}>Назад</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.navButton} onPress={handleNextStep}>
              <Text style={styles.navButtonText}>
                {currentStep === steps.length - 1 ? 'Отправить' : 'Далее'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );  
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  errorInput: { borderColor: 'red' },
  error: { color: 'red', fontSize: 12, marginBottom: 5 },
  option: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  selectedOption: { backgroundColor: '#3498db', borderColor: '#2980b9' },
  selectedOptionText: { color: '#fff' },
  optionText: { fontSize: 16, color: '#34495E' },
  navigation: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  navButton: {
    padding: 10,
    backgroundColor: '#3498db',
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  navButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  statusContainer: {
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  statusText: { fontSize: 18, textAlign: 'center', color: '#333', fontWeight: 'bold' },
  statusHint: { marginTop: 10, fontSize: 14, textAlign: 'center', color: '#666' },
});

export default ApplicationScreen;