import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const steps = [
  'Личные данные',
  'Паспортные данные',
  'Образование и студенческий статус',
  'Опыт работы и навыки',
  'Данные о поездке',
  'Контактные данные для экстренной связи',
  'Условия участия и согласие',
];

const cisCountries = [
  'Россия',
  'Казахстан',
  'Беларусь',
  'Узбекистан',
  'Таджикистан',
  'Кыргызстан',
  'Армения',
  'Азербайджан',
  'Молдова',
];

const ApplicationScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    citizenship: '',
    passportNumber: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    university: '',
    faculty: '',
    currentYear: '',
    gpa: '',
    workExperience: '',
    englishLevel: '',
    tripStartDate: '',
    tripEndDate: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    termsAccepted: false,
  });
  const [errors, setErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  const validateStep = () => {
    const newErrors = {};
    switch (currentStep) {
      case 0: // Личные данные
        if (!formData.firstName) newErrors.firstName = 'Введите имя';
        if (!formData.lastName) newErrors.lastName = 'Введите фамилию';
        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = 'Введите дату рождения (ДД.ММ.ГГГГ)';
        } else if (!/^\d{2}\.\d{2}\.\d{4}$/.test(formData.dateOfBirth)) {
          newErrors.dateOfBirth = 'Неверный формат даты (пример: 01.01.2000)';
        }
        if (!formData.gender) newErrors.gender = 'Выберите пол';
        if (!formData.citizenship) newErrors.citizenship = 'Выберите гражданство';
        break;
  
      case 1: // Паспортные данные
        if (!formData.passportNumber) newErrors.passportNumber = 'Введите номер паспорта';
        if (!formData.passportIssueDate) newErrors.passportIssueDate = 'Введите дату выдачи паспорта';
        if (!formData.passportExpiryDate) newErrors.passportExpiryDate = 'Введите дату окончания паспорта';
        break;
  
      case 2: // Образование
        if (!formData.university) newErrors.university = 'Введите название университета';
        if (!formData.faculty) newErrors.faculty = 'Введите факультет';
        if (!formData.currentYear) newErrors.currentYear = 'Укажите текущий курс';
        break;
  
      case 3: // Опыт работы
        if (!formData.workExperience) newErrors.workExperience = 'Укажите опыт работы (в месяцах)';
        if (!formData.englishLevel) newErrors.englishLevel = 'Укажите уровень английского';
        break;
  
      case 4: // Данные о поездке
        if (!formData.tripStartDate) newErrors.tripStartDate = 'Введите дату начала поездки';
        if (!formData.tripEndDate) newErrors.tripEndDate = 'Введите дату окончания поездки';
        break;
  
      case 5: // Контактные данные
        if (!formData.emergencyContactName) newErrors.emergencyContactName = 'Введите имя контактного лица';
        if (!formData.emergencyContactRelationship) newErrors.emergencyContactRelationship = 'Укажите отношение';
        if (!formData.emergencyContactPhone) newErrors.emergencyContactPhone = 'Введите телефон контактного лица';
        break;
  
      case 6: // Условия участия
        if (!formData.termsAccepted) newErrors.termsAccepted = 'Необходимо принять условия';
        break;
  
      default:
        break;
    }
    setErrors(newErrors);
  
    // Показываем ошибки
    if (Object.keys(newErrors).length > 0) {
      Alert.alert(
        'Ошибка',
        'Заполните все необходимые поля:\n' +
          Object.values(newErrors).join('\n')
      );
      return false;
    }
    return true;
  };
  
    // Проверяем статус заявки при загрузке экрана
    useEffect(() => {
      const fetchApplicationStatus = async () => {
        setLoading(true);
        try {
          if (!user) {
            Alert.alert('Ошибка', 'Пользователь не авторизован.');
            return;
          }
  
          const docRef = doc(db, 'applicants', user.uid);
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists()) {
            setApplicationStatus(docSnap.data().status); // Сохраняем статус заявки
          }
        } catch (error) {
          console.error('Ошибка проверки заявки:', error);
          Alert.alert('Ошибка', 'Не удалось загрузить статус заявки. Попробуйте позже.');
        }
        setLoading(false);
      };
  
      fetchApplicationStatus();
    }, []);

  const handleNextStep = async () => {
    if (!validateStep()) {
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Сохранение заявки в Firestore
      setLoading(true);
      try {
        const docRef = doc(db, 'applicants', user.uid);
        const existingDoc = await getDoc(docRef);

        if (existingDoc.exists()) {
          setApplicationStatus(existingDoc.data().status);
          Alert.alert('Ошибка', 'Вы уже отправили заявку.');
          return;
        }

        await setDoc(docRef, {
          ...formData,
          status: 'В ожидании',
          submittedAt: new Date().toISOString(),
          userId: user.uid,
        });

        setApplicationStatus('В ожидании');
        Alert.alert('Успех', 'Заявка успешно отправлена!');
      } catch (error) {
        console.error('Ошибка отправки заявки:', error);
        Alert.alert('Ошибка', 'Не удалось отправить заявку. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {

    if (applicationStatus) {
      return (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              Статус вашей заявки: {applicationStatus}
            </Text>
            <Text style={styles.statusHint}>
              Для изменения заявки обратитесь в поддержку.
            </Text>
          </View>
        </ScrollView>
      );
    }

    switch (currentStep) {
      case 0: // Личные данные
        return (
          <>
            <TextInput
              style={[styles.input, errors.firstName && styles.errorInput]}
              placeholder="Имя"
              value={formData.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
            />
            {errors.firstName && <Text style={styles.error}>{errors.firstName}</Text>}
  
            <TextInput
              style={[styles.input, errors.lastName && styles.errorInput]}
              placeholder="Фамилия"
              value={formData.lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
            />
            {errors.lastName && <Text style={styles.error}>{errors.lastName}</Text>}
  
            <TextInput
              style={[styles.input, errors.dateOfBirth && styles.errorInput]}
              placeholder="Дата рождения (ДД.ММ.ГГГГ)"
              keyboardType="number-pad"
              value={formData.dateOfBirth}
              onChangeText={(text) => {
                let formattedText = text.replace(/[^0-9]/g, '');
                if (formattedText.length > 2 && formattedText.length <= 4) {
                  formattedText = `${formattedText.slice(0, 2)}.${formattedText.slice(2)}`;
                } else if (formattedText.length > 4) {
                  formattedText = `${formattedText.slice(0, 2)}.${formattedText.slice(2, 4)}.${formattedText.slice(4)}`;
                }
                if (formattedText.length > 10) {
                  formattedText = formattedText.slice(0, 10);
                }
                handleInputChange('dateOfBirth', formattedText);
              }}
            />
            {errors.dateOfBirth && <Text style={styles.error}>{errors.dateOfBirth}</Text>}
  
            <Text style={styles.label}>Пол</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'Мужской' && styles.genderButtonSelected,
                ]}
                onPress={() => handleInputChange('gender', 'Мужской')}
              >
                <Text
                  style={[
                    styles.genderText,
                    formData.gender === 'Мужской' && styles.genderTextSelected,
                  ]}
                >
                  Мужской
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'Женский' && styles.genderButtonSelected,
                ]}
                onPress={() => handleInputChange('gender', 'Женский')}
              >
                <Text
                  style={[
                    styles.genderText,
                    formData.gender === 'Женский' && styles.genderTextSelected,
                  ]}
                >
                  Женский
                </Text>
              </TouchableOpacity>
            </View>
            {errors.gender && <Text style={styles.error}>{errors.gender}</Text>}
  
            <TouchableOpacity
              style={[styles.input, errors.citizenship && styles.errorInput]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={{ color: formData.citizenship ? '#000' : '#999' }}>
                {formData.citizenship || 'Выберите гражданство'}
              </Text>
            </TouchableOpacity>
            {errors.citizenship && <Text style={styles.error}>{errors.citizenship}</Text>}
  
            <Modal visible={modalVisible} transparent animationType="fade">
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalHeader}>Выберите гражданство</Text>
                  <FlatList
                    data={cisCountries}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => {
                          handleInputChange('citizenship', item);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.modalOptionText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalCloseButtonText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        );
  
      case 1: // Паспортные данные
        return (
          <>
            <TextInput
              style={[styles.input, errors.passportNumber && styles.errorInput]}
              placeholder="Номер паспорта"
              value={formData.passportNumber}
              onChangeText={(text) => handleInputChange('passportNumber', text)}
            />
            {errors.passportNumber && <Text style={styles.error}>{errors.passportNumber}</Text>}
  
            <TextInput
              style={[styles.input, errors.passportIssueDate && styles.errorInput]}
              placeholder="Дата выдачи паспорта (ДД.ММ.ГГГГ)"
              keyboardType="number-pad"
              value={formData.passportIssueDate}
              onChangeText={(text) => {
                let formattedText = text.replace(/[^0-9]/g, '');
                if (formattedText.length > 2 && formattedText.length <= 4) {
                  formattedText = `${formattedText.slice(0, 2)}.${formattedText.slice(2)}`;
                } else if (formattedText.length > 4) {
                  formattedText = `${formattedText.slice(0, 2)}.${formattedText.slice(2, 4)}.${formattedText.slice(4)}`;
                }
                if (formattedText.length > 10) {
                  formattedText = formattedText.slice(0, 10);
                }
                handleInputChange('passportIssueDate', formattedText);
              }}
            />
            {errors.passportIssueDate && <Text style={styles.error}>{errors.passportIssueDate}</Text>}
  
            <TextInput
              style={[styles.input, errors.passportExpiryDate && styles.errorInput]}
              placeholder="Дата окончания паспорта (ДД.ММ.ГГГГ)"
              keyboardType="number-pad"
              value={formData.passportExpiryDate}
              onChangeText={(text) => {
                let formattedText = text.replace(/[^0-9]/g, '');
                if (formattedText.length > 2 && formattedText.length <= 4) {
                  formattedText = `${formattedText.slice(0, 2)}.${formattedText.slice(2)}`;
                } else if (formattedText.length > 4) {
                  formattedText = `${formattedText.slice(0, 2)}.${formattedText.slice(2, 4)}.${formattedText.slice(4)}`;
                }
                if (formattedText.length > 10) {
                  formattedText = formattedText.slice(0, 10);
                }
                handleInputChange('passportExpiryDate', formattedText);
              }}
            />
            {errors.passportExpiryDate && <Text style={styles.error}>{errors.passportExpiryDate}</Text>}
          </>
        );
  
      case 2: // Образование и студенческий статус
        return (
          <>
            <TextInput
              style={[styles.input, errors.university && styles.errorInput]}
              placeholder="Университет"
              value={formData.university}
              onChangeText={(text) => handleInputChange('university', text)}
            />
            {errors.university && <Text style={styles.error}>{errors.university}</Text>}
  
            <TextInput
              style={[styles.input, errors.faculty && styles.errorInput]}
              placeholder="Факультет"
              value={formData.faculty}
              onChangeText={(text) => handleInputChange('faculty', text)}
            />
            {errors.faculty && <Text style={styles.error}>{errors.faculty}</Text>}
  
            <TextInput
              style={[styles.input, errors.currentYear && styles.errorInput]}
              placeholder="Текущий курс"
              keyboardType="number-pad"
              value={formData.currentYear}
              onChangeText={(text) => handleInputChange('currentYear', text)}
            />
            {errors.currentYear && <Text style={styles.error}>{errors.currentYear}</Text>}
  
            <TextInput
              style={[styles.input, errors.gpa && styles.errorInput]}
              placeholder="Средний балл (GPA)"
              keyboardType="decimal-pad"
              value={formData.gpa}
              onChangeText={(text) => handleInputChange('gpa', text)}
            />
            {errors.gpa && <Text style={styles.error}>{errors.gpa}</Text>}
          </>
        );
  
      case 3: // Опыт работы и навыки
        return (
          <>
            <TextInput
              style={[styles.input, errors.workExperience && styles.errorInput]}
              placeholder="Опыт работы (в месяцах)"
              keyboardType="number-pad"
              value={formData.workExperience}
              onChangeText={(text) => handleInputChange('workExperience', text)}
            />
            {errors.workExperience && <Text style={styles.error}>{errors.workExperience}</Text>}
  
            <TextInput
              style={[styles.input, errors.englishLevel && styles.errorInput]}
              placeholder="Уровень английского (например, B1, C1)"
              value={formData.englishLevel}
              onChangeText={(text) => handleInputChange('englishLevel', text)}
            />
            {errors.englishLevel && <Text style={styles.error}>{errors.englishLevel}</Text>}
          </>
        );
  
        case 4: // Данные о поездке
        return (
          <>
            <TextInput
              style={[styles.input, errors.tripStartDate && styles.errorInput]}
              placeholder="Дата начала поездки (ДД.ММ.ГГГГ)"
              keyboardType="number-pad"
              value={formData.tripStartDate}
              onChangeText={(text) => {
                let formattedText = text.replace(/[^0-9]/g, '');
                if (formattedText.length > 2 && formattedText.length <= 4) {
                  formattedText = `${formattedText.slice(0, 2)}.${formattedText.slice(2)}`;
                } else if (formattedText.length > 4) {
                  formattedText = `${formattedText.slice(0, 2)}.${formattedText.slice(2, 4)}.${formattedText.slice(4)}`;
                }
                if (formattedText.length > 10) {
                  formattedText = formattedText.slice(0, 10);
                }
                handleInputChange('tripStartDate', formattedText);
              }}
            />
            {errors.tripStartDate && <Text style={styles.error}>{errors.tripStartDate}</Text>}
      
            <TextInput
              style={[styles.input, errors.tripEndDate && styles.errorInput]}
              placeholder="Дата окончания поездки (ДД.ММ.ГГГГ)"
              keyboardType="number-pad"
              value={formData.tripEndDate}
              onChangeText={(text) => {
                let formattedText = text.replace(/[^0-9]/g, '');
                if (formattedText.length > 2 && formattedText.length <= 4) {
                  formattedText = `${formattedText.slice(0, 2)}.${formattedText.slice(2)}`;
                } else if (formattedText.length > 4) {
                  formattedText = `${formattedText.slice(0, 2)}.${formattedText.slice(2, 4)}.${formattedText.slice(4)}`;
                }
                if (formattedText.length > 10) {
                  formattedText = formattedText.slice(0, 10);
                }
                handleInputChange('tripEndDate', formattedText);
              }}
            />
            {errors.tripEndDate && <Text style={styles.error}>{errors.tripEndDate}</Text>}
          </>
        );
  
      case 5: // Контактные данные для экстренной связи
        return (
          <>
            <TextInput
              style={[styles.input, errors.emergencyContactName && styles.errorInput]}
              placeholder="Имя контактного лица"
              value={formData.emergencyContactName}
              onChangeText={(text) => handleInputChange('emergencyContactName', text)}
            />
            {errors.emergencyContactName && <Text style={styles.error}>{errors.emergencyContactName}</Text>}
  
            <TextInput
              style={[styles.input, errors.emergencyContactRelationship && styles.errorInput]}
              placeholder="Отношение к контактному лицу"
              value={formData.emergencyContactRelationship}
              onChangeText={(text) => handleInputChange('emergencyContactRelationship', text)}
            />
            {errors.emergencyContactRelationship && <Text style={styles.error}>{errors.emergencyContactRelationship}</Text>}
  
            <TextInput
              style={[styles.input, errors.emergencyContactPhone && styles.errorInput]}
              placeholder="Телефон контактного лица"
              keyboardType="phone-pad"
              value={formData.emergencyContactPhone}
              onChangeText={(text) => handleInputChange('emergencyContactPhone', text)}
            />
            {errors.emergencyContactPhone && <Text style={styles.error}>{errors.emergencyContactPhone}</Text>}
          </>
        );
  
        case 6: // Условия участия и согласие
        return (
          <>
            <Text style={styles.termsText}>Примите условия участия в программе:</Text>
            <TouchableOpacity
              style={[
                styles.checkboxContainer,
                formData.termsAccepted && styles.checkboxSelected,
              ]}
              onPress={() => handleInputChange('termsAccepted', !formData.termsAccepted)}
            >
              <Text style={[styles.checkboxText, formData.termsAccepted && styles.checkboxTextSelected]}>
                {formData.termsAccepted ? '✓' : ''}
              </Text>
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Я принимаю условия участия в программе.</Text>
            {errors.termsAccepted && <Text style={styles.error}>{errors.termsAccepted}</Text>}
          </>
        );
      default:
        return <Text>Шаг {currentStep + 1}: Заполните необходимые данные.</Text>;
    }
  };

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#354C90" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.header}>
          <Text style={styles.title}>
            {applicationStatus ? 'Статус заявки' : steps[currentStep]}
          </Text>
        </View>
        {applicationStatus ? (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              Статус вашей заявки: {applicationStatus}
            </Text>
            <Text style={styles.statusHint}>
              Для изменения заявки обратитесь в поддержку.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.stepContent}>{renderStepContent()}</View>
            <View style={styles.footer}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={styles.buttonSecondary}
                  onPress={() => setCurrentStep(currentStep - 1)}
                >
                  <Text style={styles.buttonText}>Назад</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.buttonPrimary, loading && { opacity: 0.7 }]}
                onPress={!loading ? handleNextStep : null}
              >
                <Text style={styles.buttonText}>
                  {currentStep === steps.length - 1 ? 'Отправить' : 'Далее'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#354C90',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  errorInput: {
    borderColor: 'red',
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
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: '#354C90',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonPrimary: {
    backgroundColor: '#354C90',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  buttonSecondary: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  statusContainer: {
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
  },
  statusHint: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  genderButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  genderButtonSelected: {
    backgroundColor: '#354C90',
  },
  genderText: {
    fontSize: 16,
    color: '#333',
  },
  genderTextSelected: {
    color: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  checkboxContainer: {
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  
  checkboxSelected: {
    borderColor: '#354C90',
    backgroundColor: '#354C90',
  },
  
  checkboxText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  
  checkboxTextSelected: {
    color: '#fff',
  },
  
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ApplicationScreen;
