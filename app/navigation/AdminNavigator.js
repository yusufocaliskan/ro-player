import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

//Screens
import Admin from "../screens/Admin";
const Stack = createNativeStackNavigator();

const NavigationStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Admin" component={Admin} />
    </Stack.Navigator>
  );
};

export default NavigationStack;
