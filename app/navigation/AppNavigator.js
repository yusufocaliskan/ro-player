import React, { useState, useContext, useEffect, useLayoutEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { StyleSheet } from "react-native";
import AudioList from "../screens/AudioList";
//import Player from "../screens/Player";
import User from "../screens/User";
import color from "../misc/color";
import Anons from "../screens/Anons";

//Iconları import et.
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { AudioContext } from "../context/AudioProvider";
import { newAuthContext } from "../context/newAuthContext";
import { LangContext } from "../context/LangProvider";

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const context = useContext(AudioContext);
  const { loadingState } = useContext(newAuthContext);
  const [userData, setUserData] = useState(loadingState?.userData?.FSL);
  const { Lang } = useContext(LangContext);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: color.WHITE,
        tabBarInactiveTintColor: color.DARK_RED,
        headerStyle: { backgroundColor: color.RED },
        headerTintColor: color.WHITE,
        tabBarStyle: {
          backgroundColor: color.RED,
        },
      }}
    >
      <Tab.Screen
        name={Lang?.PLAYLIST || "Çalma Listesi"}
        component={AudioList}
        context={context}
        options={{
          orientation: "landscape",
          tabBarIcon: ({ color, size }) => {
            return <FontAwesome name="music" size={size} color={color} />;
          },
        }}
      />
      {/*      <Tab.Screen
        name={Lang?.PLAYER || "Müzik Player"}
        component={Player}
        context={context}
        options={{
          tabBarIcon: ({ color, size }) => {
            return (
              <Ionicons name="md-headset-sharp" size={size} color={color} />
            );
          },
        }}
      />

      <Tab.Screen
        name={Lang?.ANONS || "Anons"}
        component={Anons}
        context={context}
        options={{
          tabBarIcon: ({ color, size }) => {
            return (
              <Ionicons name="volume-high-outline" size={size} color={color} />
            );
          },
        }}
      />
      */}
      <Tab.Screen
        name={loadingState.userData?.FSL?.Ismi.split(" ")[0]}
        component={User}
        context={context}
        options={{
          tabBarIcon: ({ color, size }) => {
            return <Entypo name="user" size={size} color={color} />;
          },
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tab: {
    backgroundColor: "blue",
  },
});

export default AppNavigator;
