import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

//Screens
import MainApp from "../screens/MainApp";
import Login from "../screens/Login";
import Admin from "../screens/Admin";
const Stack = createNativeStackNavigator();

const NavigationStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Admin" component={Admin} />
      <Stack.Screen name="MainApp" component={MainApp} />
    </Stack.Navigator>
  );
};

export default NavigationStack;
