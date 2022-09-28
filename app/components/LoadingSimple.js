import React, { useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";

import color from "../misc/color";
import { LangContext } from "../context/LangProvider";

const LoadingSimple = () => {
  const height = useWindowDimensions();
  const { Lang } = useContext(LangContext);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignContent: "center",
        textAlign: "center",
        backgroundColor: color.APP_BG,
      }}
    >
      <ActivityIndicator color={color.WHITE} size="large" />

      <Text
        style={{
          textAlign: "center",
          marginTop: 15,
          fontSize: 16,
          color: color.WHITE,
        }}
      >
        {Lang?.COULD_TAKE_TIME}
      </Text>
    </View>
  );
};

export default LoadingSimple;
