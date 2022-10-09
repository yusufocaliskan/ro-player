import React, { useState, useContext, useEffect } from "react";
import { Text, View, Alert, StyleSheet, ActivityIndicator } from "react-native";
import color from "../misc/color";
import config from "../misc/config";
import Logo from "../components/Logo";
import Input from "../components/form/Input";
import Button from "../components/form/Button";
import { XMLParser } from "fast-xml-parser";
import axios from "axios";
import { newAuthContext } from "../context/newAuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LangContext } from "../context/LangProvider";
import LanguageModal from "../components/LanguageModal";
//Navigator.
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
const Login = () => {
  // Context

  const navigation = useNavigation();
  const [userName, setUserName] = useState();
  const [password, setPassword] = useState();
  const { adminSingIn, singIn } = useContext(newAuthContext);
  const { Lang } = useContext(LangContext);
  const [checking, setChecking] = useState(false);
  const [failedToLogin, setFailedToLogin] = useState(false);

  const LoginAction = async () => {
    //Kullanıcı bilgileri boş mu?
    setChecking(true);
    setFailedToLogin(false);
    if (userName == "" || password == "") {
      return Alert.alert("Hata", "Bilgileri yaz.", [{ text: "Tamam." }]);
    }

    //Bu bir admin girişi mi=
    if (
      userName === config.ADMIN_INFO.ADMIN_USERNAME &&
      password === config.ADMIN_INFO.ADMIN_PASSWORD
    ) {
      adminSingIn(config.ADMIN_INFO);
      //audioContext.getSoundsAndAnonsFromServer();
      await AsyncStorage.setItem("username", userName);
      await AsyncStorage.setItem("password", password);

      return navigation.navigate("Admin");
    }

    //Değil ise kullanıcı girişine bak.
    //Servera sor
    const xml = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <FirmaveKullaniciBilgileri xmlns="http://tempuri.org/">
          <SertifikaBilgileri>
          <KullaniciAdi>${config.SER_USERNAME}</KullaniciAdi>
          <Sifre>${config.SER_PASSWORD}</Sifre>
        </SertifikaBilgileri>
        <Eposta>${userName}</Eposta>
        <Sifre>${password}</Sifre>
            <MakineKodu>string</MakineKodu>
          </FirmaveKullaniciBilgileri>
        </soap:Body>
      </soap:Envelope>`;

    axios
      .post(config.SOAP_URL, xml, {
        headers: { "Content-Type": "text/xml" },
      })
      .then(async (resData) => {
        const options = {
          ignoreNameSpace: false,
          ignoreAttributes: false,
        };
        const parser = new XMLParser(options);
        const jObj = parser.parse(getSoapBody(resData.data));
        setChecking(false);
        //Giriş Hatalı mı?
        if (jObj.Basarili == false) {
          setFailedToLogin(true);
          setTimeout(() => {
            setFailedToLogin(false);
          }, 3000);
          return false;
        }

        //Giriş başarılı mı?
        if (jObj.Basarili == true) {
          //Sayfaya gönder
          //Storage'a verileri koy
          singIn(jObj);
          //audioContext.getSoundsAndAnonsFromServer();
          await AsyncStorage.setItem("username", userName);
          await AsyncStorage.setItem("password", password);
          //await TrackPlayer.reset();
          return navigation.navigate("MainApp");
        }
      })

      .catch((error) => {
        console.error(`SOAP FAIL: ${error}`);
      });
  };

  //Gelen bilgileri ayıkla
  const getSoapBody = (xmlStr) => {
    let soapBody = null;
    if (xmlStr) {
      const soapBodyRegex =
        /<FirmaveKullaniciBilgileriResult>([\s\S]*)<\/FirmaveKullaniciBilgileriResult>/im;
      const soapBodyRegexMatchResult = xmlStr.match(soapBodyRegex);
      soapBody = soapBodyRegexMatchResult[1];
    }
    return soapBody;
  };

  //Giriş yapmamış ise burayı göster.

  //Giriş yapılmamış ise giriş formunu
  return (
    <View style={styles.container}>
      <Logo styles={styles.logo} />
      {/* <Text style={{ color: "white" }}>{Platform.isTV.toString()}</Text> */}
      {failedToLogin === true ? (
        <View style={styles.message}>
          <MaterialIcons name="error-outline" size={24} color={color.WHITE} />
          <Text style={styles.messageText}>{Lang?.LOGIN_ERROR}</Text>
        </View>
      ) : null}

      <Input
        type="text"
        placeholder={Lang?.USER_NAME}
        value={userName}
        setValue={setUserName}
        style={styles.input}
      />

      <Input
        style={styles.input}
        type="secure"
        placeholder={Lang?.USER_PASSWORD}
        value={password}
        setValue={setPassword}
      />
      {checking == false ? (
        <Button
          onPress={LoginAction}
          style={styles.loginButton}
          text={Lang?.LOGIN}
        />
      ) : (
        <ActivityIndicator size="large" color={color.WHITE} />
      )}

      <View style={styles.languageView}>
        <LanguageModal />
        <View style={styles.bottomText}>
          <Text style={{ color: "#666" }}>{Lang?.RADI_OFFICIAL}</Text>
          <Text style={{ color: "#666", letterSpacing: 3 }}>
            ({config.VERSION})
          </Text>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.BLACK,
  },
  loginButton: {
    marginTop: 10,
  },
  bottomText: {
    alignItems: "center",
    marginTop: 10,
  },
  message: {
    marginBottom: 10,
    backgroundColor: color.BLUE,
    padding: 5,
    borderRadius: 5,
    flexDirection: "row",
  },
  messageText: {
    color: color.WHITE,
    fontSize: 16,
    marginLeft: 10,
  },
  logo: {
    width: 300,
    marginTop: 40,
    marginBottom: 10,
    height: 130,
  },
  languageView: {
    position: "absolute",
    top: 50,
    alignItems: "center",
    right: 50,
  },
});

export default Login;
