import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import color from "../../misc/color";
const Button = ({ onPress, logging, text, style, textStyle }) => {
  return (
    <View style={styles.formField}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.Button, style]}
        disabled={logging}
      >
        <Text style={[styles.ButtonText, textStyle]}>{text}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formField: {
    position: "relative",
    marginBottom: 30,
  },

  Button: {
    borderRadius: 25,
    color: "red",
    backgroundColor: color.RED,
    padding: 15,
    fontSize: 40,
    alignItems: "center",
    width: 200,
  },
  ButtonText: {
    color: color.WHITE,
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: 15,
  },
});

export default Button;
