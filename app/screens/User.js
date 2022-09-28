import React, { useEffect, useContext } from "react";
import { Alert, View, StyleSheet, Text, Image } from "react-native";
import Screen from "../components/Screen";
import { AudioContext } from "../context/AudioProvider";
import Button from "../components/form/Button";
import { newAuthContext } from "../context/newAuthContext";
import color from "../misc/color";
import { stop } from "../misc/AudioController";
import LanguageModal from "../components/LanguageModal";
import { LangContext } from "../context/LangProvider";
import * as ScreenOrientation from "expo-screen-orientation";
import configs from "../misc/config";

const User = () => {
  const { singOut, loadingState } = useContext(newAuthContext);
  const audioContext = useContext(AudioContext);
  const { Lang } = useContext(LangContext);

  const singOutHandle = async () => {
    //Çalan şarkı varsa durdur..
    const status = await stop(audioContext.playbackObj);
    audioContext.updateState(audioContext, {
      playbackObj: audioContext.playbackObj,
      soundObj: status,
      isPlaying: false,
      playbackPosition: null,
      playbackDuration: null,
    });

    singOut();
  };
  const singOutUser = async () => {
    Alert.alert(Lang?.LOGOUT, Lang?.ARE_YOU_SURE, [
      {
        text: Lang?.OK,
        onPress: async () => await singOutHandle(),
      },
      {
        text: Lang?.CANCEL,
      },
    ]);
  };

  /**
   * Indırılmiş dosyaları siler.
   */
  const cleanAllTheFilesDownloaded = async () => {
    //Uyar
    Alert.alert(Lang?.ARE_YOU_SURE, Lang?.ALL_DATA_WILL_BE_LOST, [
      {
        text: Lang?.OK,
        onPress: async () => {
          const resp = await audioContext.cleanAllTheFilesDownloaded();
          console.log(resp);
          if (resp?.deleted == true) {
            Alert.alert(
              Lang?.RESULT,
              `${Lang?.DELETED_FILES} : ${resp.deletedFileCount}`,
              [
                {
                  text: Lang?.OK,
                },
              ]
            );
          } else {
            Alert.alert(Lang?.ERROR, "-", [
              {
                text: Lang?.OK,
              },
            ]);
          }
        },
      },
      {
        text: Lang?.CANCEL,
        onPress: () => console.log("Canceled"),
        style: "cancel",
      },
    ]);
  };

  const changeScreenOrientation = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );
  };

  useEffect(() => {
    //this.props.navigation.setOptions({ orientation: "landscape" });
    changeScreenOrientation();
  }, []);

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.langView}>
          <LanguageModal />
        </View>
        <Image
          source={{
            uri: `http://radiorder.online/${loadingState.userData?.FSL?.KullaniciListesi?.KullaniciDto?.ProfilResmi}`,
          }}
          style={styles.userImage}
        />
        <Text style={styles.userName}>{loadingState.userData?.FSL?.Ismi}</Text>
        <Text style={styles.Eposta}>
          {loadingState.userData?.FSL?.KullaniciListesi?.KullaniciDto?.Eposta}
        </Text>
        <Text style={styles.Sehir}>{loadingState.userData?.FSL?.Sehir}</Text>

        <View style={styles.ButtonsView}>
          {/* <Button
            style={[styles.logOutButton, styles.cleanTheFilesButton]}
            onPress={cleanAllTheFilesDownloaded}
            text={Lang?.CLEAN}
            textStyle={styles.buttonTextStyle}
          /> */}
          <Button
            style={styles.logOutButton}
            onPress={singOutUser}
            text={Lang?.LOGOUT}
            textStyle={styles.buttonTextStyle}
          />
        </View>
        <View>
          <Text style={styles.Sehir}>{configs.VERSION}</Text>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 200,
  },
  userImage: {
    width: 150,
    height: 150,
    borderRadius: 100,
    borderWidth: 5,
    borderColor: color.RED,
  },

  userName: {
    color: "white",
    fontSize: 15,
    marginTop: 20,
    marginVertical: 4,
    letterSpacing: 5,
  },

  Eposta: {
    color: color.WHITE,
    fontSize: 15,
    marginVertical: 4,
    backgroundColor: color.GRAY,
    padding: 2,
    paddingHorizontal: 10,
    borderRadius: 100,
  },

  Sehir: {
    color: color.FONT_LARGE,
    fontSize: 15,
    marginVertical: 4,
  },
  logOutButton: {
    backgroundColor: color.RED,
    marginTop: 50,
    opacity: 0.5,
    padding: 5,
    width: 130,
  },
  buttonTextStyle: { color: color.WHITE },
  langView: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  ButtonsView: {
    flexDirection: "row",
    alignContent: "space-between",
  },
  cleanTheFilesButton: {
    backgroundColor: color.YELLOW,
    marginRight: 10,
  },
});

export default User;
