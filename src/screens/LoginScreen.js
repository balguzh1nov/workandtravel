import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import "../firebaseConfig"; // Убедитесь, что путь верный

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Ошибка", "Пожалуйста, заполните все поля");
      return;
    }

    setLoading(true);
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      // Перенаправляем на экран WelcomeScreen
      navigation.replace("WelcomeScreen");
    } catch (error) {
      setLoading(false);
      console.error("Ошибка входа:", error); // Для отладки
      let errorMessage = "Что-то пошло не так. Повторите попытку.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "Пользователь не найден.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Неправильный пароль.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Неверный формат электронной почты.";
      }
      Alert.alert("Ошибка", errorMessage);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#354C90" />
        <Text style={styles.header}>Добро пожаловать!</Text>
        <Image
          style={styles.loginImage}
          source={{
            uri: "https://raw.githubusercontent.com/hirishu10/my-assets/main/login.png",
          }}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Введите почту"
            placeholderTextColor="#7A7A7A"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Введите пароль"
            placeholderTextColor="#7A7A7A"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#354C90" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Войти</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerLink}>Еще нет аккаунта? Зарегистрироваться</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#354C90",
    marginVertical: 20,
  },
  loginImage: {
    width: 350,
    height: 250,
    resizeMode: "contain",
    marginBottom: 20,
  },
  inputContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
  },
  button: {
    backgroundColor: "#354C90",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerLink: {
    color: "#354C90",
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
