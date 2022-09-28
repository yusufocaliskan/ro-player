import AppNavigator from "../navigation/AppNavigator";
import { NavigationContainer } from "@react-navigation/native";
import AudioProvider from "../context/AudioProvider";
import User from "./User";
import Login from "./Login";
import { View, Text } from "react-native";
import AuthProvider from "../context/AuthProvider";

export default function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <AppNavigator />
      </AudioProvider>
    </AuthProvider>
  );
}
