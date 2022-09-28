import React, { createContext, useState, useEffect } from "react";
import { View, Text } from "react-native";

import tr from "../lang/tr";
import en from "../lang/en";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const LangContext = createContext();

const LangProvider = (props) => {
  const [selectedLang, setSelectedLang] = useState();
  const [Lang, setLang] = useState();
  const Languages = {
    tr: tr,
    en: en,
  };

  //Display için
  const Languages_LookUp = {
    tr: "Türkçe",
    en: "English",
  };

  useEffect(() => {
    freshSelectedLang();
  });

  //Seçili olan dili belirle.
  const freshSelectedLang = async () => {
    let appLang = await AsyncStorage.getItem("AppLang");

    if (!appLang) {
      appLang = "tr";
    }
    setSelectedLang(appLang);
    setLang(Languages[selectedLang]);
  };

  //Dil değiştiriliken kullanılıyor..
  const updateSelectedLang = async (newVal) => {
    await AsyncStorage.setItem("AppLang", newVal);
    setSelectedLang(newVal);
  };

  return (
    <LangContext.Provider
      value={{
        Lang: Lang,
        selectedLang: selectedLang,
        updateSelectedLan: updateSelectedLang,
        Languages_LookUp: Languages_LookUp,
      }}
    >
      {props.children}
    </LangContext.Provider>
  );
};

export default LangProvider;
