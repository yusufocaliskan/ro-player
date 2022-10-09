import React, { useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import color from "../misc/color";

const PlayerButton = (props) => {
  const {
    iconType,
    size = 40,
    iconColor = color.RED,
    otherProps,
    onPress,
    disabled,
  } = props;

  const [bgColor, setBgColor] = useState();

  /**
   * Icon seçimi yap
   */
  const getIconName = (type) => {
    switch (type) {
      case "PLAY":
        return (
          <Ionicons
            name="play-sharp"
            onPress={onPress}
            onPressIn={setColor}
            size={size}
            color={iconColor}
            {...props}
          />
        );

      case "PAUSE":
        return (
          <Ionicons
            name="ios-pause-outline"
            onPress={onPress}
            onPressIn={setColor}
            size={size}
            color={iconColor}
            {...props}
          />
        );

      case "NEXT":
        return (
          <AntDesign
            name="stepforward"
            onPress={onPress}
            onPressIn={setColor}
            size={size}
            color={iconColor}
            {...props}
          />
        );

      case "PREV":
        return (
          <AntDesign
            name="stepbackward"
            onPress={onPress}
            onPressIn={setColor}
            size={size}
            color={iconColor}
            {...props}
          />
        );
    }
  };

  /**
   * Button arkplan ata.
   */
  const setColor = () => {
    setBgColor(color.GRAY);
    setTimeout(() => {
      setBgColor(null);
    }, 200);
  };

  return (
    <TouchableOpacity
      onPressIn={setColor}
      disabled={disabled}
      style={[styles.buttonStyle, { backgroundColor: bgColor }]}
    >
      {getIconName(iconType)}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {},
  buttonStyle: {
    borderRadius: 200,
    width: 80,
    height: 80,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PlayerButton;
