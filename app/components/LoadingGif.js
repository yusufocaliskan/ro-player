import React, { useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import Logo from "./Logo";
import color from "../misc/color";

const LoadingGif = () => {
  const height = useWindowDimensions();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignContent: "center",
        textAlign: "center",
      }}
    >
      <Logo
        styles={{
          height: 200,
          alignContent: "center",
          textAlign: "center",
          alignSelf: "center",
          marginBottom: 20,
        }}
        color="black"
      />

      <ActivityIndicator color={color.RED} size="large" />

      <Text
        style={{
          textAlign: "center",
          marginTop: 15,
          fontSize: 16,
          color: color.DARK_RED,
        }}
      ></Text>
    </View>
  );
};

export default LoadingGif;
