import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import ApplicationScreen from './src/screens/ApplicationScreen'; // Новый экран
import ProfileScreen from './src/screens/ProfileScreen'; // Новый экран

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Главная') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Подача анкеты') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Профиль') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#354C90',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Главная" component={WelcomeScreen} />
      <Tab.Screen name="Подача анкеты" component={ApplicationScreen} />
      <Tab.Screen name="Профиль" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerTitle: '', gestureEnabled: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerTitle: '', gestureEnabled: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerTitle: '', gestureEnabled: false }} />
        <Stack.Screen name="WelcomeScreen" component={MainTabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
