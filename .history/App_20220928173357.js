import React, { useContext, useMemo, useEffect, useReducer } from "react";
import { LogBox } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { AudioProvider } from "./app/context/AudioProvider";

import LoadingGif from "./app/components/LoadingGif";
import { newAuthContext } from "./app/context/newAuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import LangProvider from "./app/context/LangProvider";

//Navigators
import AppNavigator from "./app/navigation/AppNavigator";
import NavigationStack from "./app/navigation/NavigationStack";

//CodePush
import codePush from "react-native-code-push";
const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_START,
};

//Hataları kaldır.
LogBox.ignoreAllLogs();

const App = () => {
  //Application başlatılıdğında Bir update var mı yok mu diye bak.
  //Bu update application için
  //Varsa hemen indir..IMMEDIATE IMMEDIATE IMMEDIATE :)
  //start: -------------------------------------------
  codePush.sync({
    updateDialog: false,
    installMode: codePush.InstallMode.IMMEDIATE,
  });
  //end: -------------------------------------------

  // codePush.sync(
  //   { updateDialog: false },
  //   (status) => {
  //     switch (status) {
  //       case codePush.SyncStatus.DOWNLOADING_PACKAGE:
  //         console.log("------ -------DONWLOADINNN GGG----");
  //         break;
  //       case codePush.SyncStatus.INSTALLING_UPDATE:
  //         console.log("-------------INSTALLLEEDD----");
  //         break;
  //     }
  //   },
  //   ({ receivedBytes, totalBytes }) => {
  //     /* Update download modal progress */
  //   }
  // );

  //default değerler
  const initialLoginState = {
    isLoading: true,
    userName: null,
    userToken: null,
    userData: null,
    isAdmin: false,
  };

  //REducerları oluştur..
  const loginReducer = (prevState, action) => {
    switch (action.type) {
      //İlk defa giriş yapılıyorsa
      case "RE_TOKEN":
        return {
          ...prevState,
          userToken: action.token,
          isLoading: false,
          userData: action.data,
        };

      //Kullanıcı giriş
      case "LOGIN":
        return {
          ...prevState,
          userID: action.id,
          userToken: action.token,
          isLoading: false,
          userData: action.data,
          isAdmin: false,
        };

      //Kullanıcı giriş
      case "ADMIN_LOGIN":
        return {
          ...prevState,
          userID: action.id,
          isLoading: false,
          isAdmin: false,
        };

      //Çıkış yaptığında
      case "LOGOUT":
        return {
          ...prevState,
          userToken: null,
          userName: null,
          isLoading: false,
          isAdmin: false,
        };
    }
  };

  const [loadingState, dispatch] = useReducer(loginReducer, initialLoginState);

  const authContext = useMemo(() => ({
    //Giriş yaptığında alınacak bilgler
    singIn: async (data) => {
      try {
        await AsyncStorage.setItem(
          "userToken",
          data.FSL.KullaniciListesi.KullaniciDto.Sifre
        );

        await AsyncStorage.setItem("userData", JSON.stringify(data));
      } catch (e) {
        console.log(e);
      }

      dispatch({
        type: "LOGIN",
        data: data,
        id: data.FSL.Id,
        token: data.FSL.KullaniciListesi.KullaniciDto.Sifre,
      });
    },

    //Admin girişi için
    adminSingIn: async (data) => {
      try {
        await AsyncStorage.setItem("AdminData", JSON.stringify(data));
      } catch (error) {
        console.log(error);
      }

      dispatch({
        type: "ADMIN_LOGIN",
        data: data,
        isAdmin: true,
      });
    },

    //Çıkış yaptığında
    singOut: async () => {
      try {
        //Tüm Storage'ı sil.
        //await AsyncStorage.removeItem("userToken");
        //await AsyncStorage.removeItem("userData");
        await AsyncStorage.clear();
      } catch (e) {
        console.log(e);
      }
      dispatch({ type: "LOGOUT", id: null, token: null });
    },

    //Kullanıcı bilgileri
    loadingState: loadingState,
  }));

  useEffect(() => {
    //Kullanıcıdan ses dosyalarına erişim izni iste

    setTimeout(async () => {
      let userToken = null;
      let userData = null;
      try {
        userToken = await AsyncStorage.getItem("userToken");
        userData = JSON.parse(await AsyncStorage.getItem("userData"));

        dispatch({
          type: "LOGIN",
          isLoading: true,
          token: userToken,
          data: userData,
        });
      } catch (e) {
        console.log(e);
      }
    }, 1000);
  }, []);

  if (loadingState.isLoading) {
    return <LoadingGif />;
  }
  return (
    <LangProvider>
      <newAuthContext.Provider value={authContext}>
        <StatusBar style="light" />
        <NavigationContainer>
          {loadingState.userToken == null ? (
            <NavigationStack />
          ) : (
            <AudioProvider>
              <AppNavigator />
            </AudioProvider>
          )}
        </NavigationContainer>
      </newAuthContext.Provider>
    </LangProvider>
  );
};

export default codePush(codePushOptions)(App);
//export default App;
