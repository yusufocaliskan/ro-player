import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import color from "../../misc/color";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";

const Input = ({ type, value, setValue, placeholder }) => {
  if (type == "text") {
    return (
      <View>
        <View style={styles.formField}>
          <AntDesign name="user" size={24} color="black" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={value}
            onChangeText={setValue}
          />
        </View>
      </View>
    );
  }

  if (type == "secure") {
    return (
      <View style={styles.formField}>
        <Feather name="key" size={24} color="black" style={styles.icon} />
        <TextInput
          secureTextEntry={true}
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={setValue}
        />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: color.WHITE,
    width: 300,
    borderRadius: 50,
    padding: 8,
    paddingHorizontal: 50,
    fontSize: 16,
    borderWidth: 4,
    borderColor: "#555",
  },

  formField: {
    position: "relative",
    marginBottom: 10,
  },

  icon: {
    color: color.BLACK,
    position: "absolute",
    left: 15,
    top: 12,
    zIndex: 100,
    opacity: 0.4,
  },

  LoginButton: {
    borderRadius: 25,
    color: "red",
    backgroundColor: color.RED,
    padding: 15,
    fontSize: 40,
    alignItems: "center",
  },

  ButtonText: {
    color: color.WHITE,
    fontWeight: "bold",
    fontSize: 15,
    textTransform: "uppercase",
  },
});

export default Input;
