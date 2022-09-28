import React, { useContext, useState } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Modal,
  Dimensions,
} from "react-native";
import color from "../misc/color";
import { LangContext } from "../context/LangProvider";

const LanguageModal = ({ showIt, closeIt, selectTR, selectEN }) => {
  const { Lang, selectedLang, updateSelectedLan, Languages_LookUp } =
    useContext(LangContext);
  const [showLangModal, setShowLangModal] = useState(false);
  const [closeLangModal, setCloseLangModal] = useState(false);

  const selectTRLang = () => {
    updateSelectedLan("tr");
    setShowLangModal(false);
  };

  const selectENLang = () => {
    updateSelectedLan("en");
    setShowLangModal(false);
  };

  return (
    <>
      <View style={styles.languageView}>
        <TouchableOpacity
          style={styles.langSelection}
          onPress={() => {
            setShowLangModal(true);
          }}
        >
          <View>
            <Text style={styles.langSelectionText}>
              {Languages_LookUp[selectedLang]}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal transparent={true} animationType="slide" visible={showLangModal}>
        <TouchableOpacity onPress={() => setShowLangModal(false)}>
          <View style={styles.overview}></View>
        </TouchableOpacity>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{Lang?.SELECT_LANG}</Text>
          <View style={styles.optionsView}>
            <TouchableOpacity style={styles.option} onPress={selectTRLang}>
              <Text style={styles.optionText}>Türkçe</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={selectENLang}>
              <Text style={styles.optionText}>English</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};
const { height, width } = Dimensions.get("window");
const styles = StyleSheet.create({
  modalView: {
    backgroundColor: color.RED,
    position: "absolute",
    width: width,
    minHeight: 250,
    bottom: 0,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: 20,
    zIndex: 999,
    elevation: 999,
  },
  modalTitle: {
    color: color.DARK_RED,
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase",
    alignSelf: "center",
  },
  optionsView: {
    marginTop: 10,
  },
  option: {
    marginBottom: 5,
    padding: 10,
    opacity: 0.8,
    borderBottomWidth: 1,
    borderBottomColor: color.LIGHT_RED,
  },
  optionText: {
    textAlign: "center",
    fontSize: 18,
    color: color.WHITE,
  },
  overview: {
    backgroundColor: color.BLACK,
    zIndex: 888,
    position: "absolute",
    width: width,
    height: height,
    top: 0,
    left: 0,
    opacity: 0.2,
  },
  langSelection: {
    backgroundColor: color.FONT_LARGE,
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: color.GRAY,
    opacity: 0.7,
  },
  langSelectionText: {
    color: color.WHITE,
    textTransform: "uppercase",
    fontSize: 14,
  },
});

export default LanguageModal;
