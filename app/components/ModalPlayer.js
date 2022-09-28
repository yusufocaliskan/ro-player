import React from "react";
import { StyleSheet, Modal, View, Text, Dimensions } from "react-native";
import color from "../misc/color";

const ModalPlayer = () => {
  return (
    <View style={styles.modalView}>
      <Text>Silav!!!!</Text>
    </View>
  );
};
const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  modalView: {
    backgroundColor: color.BLUE,
    height: 50,
    position: "absolute",
    bottom: 0,
    width: width - 20,
    marginLeft: 10,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
});

export default ModalPlayer;
