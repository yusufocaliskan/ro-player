import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import color from "../misc/color";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

const OptionModal = ({
  visible,
  onClose,
  currentItem,
  onPlayPress,
  onPlayListPress,
}) => {
  const { filename } = currentItem;
  return (
    <>
      <Modal animationType="slide" transparent visible={visible}>
        <View style={styles.modal}>
          <Text numberOfLines={2} style={styles.title}>
            {filename}
          </Text>

          <View style={styles.optionContainer}>
            <TouchableOpacity style={styles.button} onPress={onPlayPress}>
              <View style={styles.optionView}>
                <AntDesign
                  style={styles.optionIcon}
                  name="caretright"
                  size={18}
                  color={color.FONT_LIGHT}
                />

                <Text style={styles.option}>Oynat</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={onPlayListPress}>
              <View style={styles.optionView}>
                <MaterialIcons
                  name="playlist-add"
                  size={24}
                  color={color.FONT_LIGHT}
                  style={styles.optionIcon}
                />

                <Text style={styles.option}>Çalma Listesine Ekle</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalBg} />
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {},

  modal: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: color.APP_BG,
    zIndex: 1000,
  },

  modalBg: {
    backgroundColor: color.MODAL_BG,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    position: "absolute",
  },
  optionView: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIcon: {
    flexBasis: 30,
  },

  optionContainer: {
    padding: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 20,
    paddingBottom: 0,
    color: color.FONT_MEDIUM,
  },

  option: {
    fontSize: 16,
    fontWeight: "bold",
    color: color.FONT,
    paddingVertical: 10,
    letterSpacing: 1,
  },
});

export default OptionModal;
