import React, { useContext, useEffect, useState } from "react";
import {
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  View,
  Text,
  StyleSheet,
  Alert,
  Keyboard,
} from "react-native";
import color from "../misc/color";
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/form/Button";
import { AdminSettings } from "../database/DatabaseShemas";
import { v4 as uuidv4 } from "uuid";
import { useNavigation } from "@react-navigation/native";
import "react-native-get-random-values";
import Realm, { BSON } from "realm";
import { FontAwesome5 } from "@expo/vector-icons";
/**
 * Application için gerekli bir kaç verir
 * alınması için kullanılır
 * @returns null
 */
const Admin = () => {
  const [weeklyAnons, setWeeklyAnons] = useState(50);
  const [certainDaysAnons, setCertainDaysAnons] = useState(50);
  let DBConnection;
  const navigation = useNavigation();

  //Database e bağlan
  const connection = async () => {
    const connection = await Realm.open({
      schema: [AdminSettings],
      deleteRealmIfMigrationNeeded: true,
    });
    DBConnection = connection;
  };

  //Ayarları al
  useEffect(() => {
    getSettings();
  }, []);

  //Ayarkarı sil
  const deleteSettings = async () => {
    DBConnection.write(() => {
      const appSettings = DBConnection.objects("AdminSettings");
      DBConnection.delete(appSettings);
    });
    DBConnection.close();
  };
  //deleteSettings();

  //Ayartları al
  const getSettings = async () => {
    await connection();

    const appSettings = DBConnection.objects("AdminSettings")[0];

    //Boşsa bunları ekle.
    if (settings != void 0) {
      DBConnection.write(() => {
        DBConnection.create("AdminSettings", {
          weeklyAnons: 43,
          certainAnons: 58,
        });
      });
    }

    setWeeklyAnons(appSettings?.weeklyAnons);
    setCertainDaysAnons(appSettings?.certainAnons);
    DBConnection.close();
  };

  //Onay al ve kayıt et
  const handleSaveTheSettings = () => {
    Keyboard.dismiss();
    Alert.alert("Emin misin", "İşlemi kaydetmek istiyor musun?", [
      {
        text: "Tamam",
        onPress: async () => await saveTheSettings(),
      },
      {
        text: "Hayır",
      },
    ]);
  };
  //Ayarları kaydet
  const saveTheSettings = async () => {
    await connection();
    //Boş değilse
    if (weeklyAnons == "" || certainDaysAnons == "") {
      return;
    }

    //integer değilse
    DBConnection.write(() => {
      const settings = DBConnection.objects("AdminSettings")[0];
      //Varsa güncelle
      if (settings != void 0) {
        settings.weeklyAnons = weeklyAnons;
        settings.certainAnons = certainDaysAnons;
      } else {
        //Yoksa ekle
        DBConnection.create("AdminSettings", {
          weeklyAnons: weeklyAnons,
          certainAnons: certainDaysAnons,
        });
      }
      setWeeklyAnons(weeklyAnons);
      setCertainDaysAnons(certainDaysAnons);
    });
    DBConnection.close();
  };

  //Oturu mu kapat
  const exitToSettings = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.adminView}>
      <View style={styles.header}>
        <Ionicons
          style={styles.icon}
          name="ios-settings-outline"
          size={30}
          color={color.WHITE}
        />
        <Text style={styles.headerText}>Admin : </Text>
        <Text style={[styles.headerText, styles.controlText]}>Kontrol </Text>
      </View>
      <View style={styles.form}>
        <View style={styles.formRow}>
          <View style={styles.formLable}>
            <Text style={styles.formLableText}>Haftalık</Text>
          </View>
          <View>
            <TextInput
              style={styles.formInput}
              keyboardType="numeric"
              placeholder="Haftalık tekrar eden anons aralığı"
              onChangeText={setWeeklyAnons}
              value={weeklyAnons}
            />
          </View>
        </View>
        <View style={styles.formRow}>
          <View style={styles.formLable}>
            <Text style={styles.formLableText}>Belirli Günler</Text>
          </View>
          <View>
            <TextInput
              style={styles.formInput}
              keyboardType="numeric"
              placeholder="Belirli günler de tekrar eden anons aralığı"
              onChangeText={setCertainDaysAnons}
              value={certainDaysAnons}
            />
          </View>
        </View>
        <View style={[styles.formRow, { alignItems: "center" }]}>
          <Button text="Kaydet" onPress={handleSaveTheSettings} />
        </View>
      </View>
      <TouchableOpacity style={styles.exitSettings} onPress={exitToSettings}>
        <FontAwesome5
          style={styles.exitIcon}
          name="times-circle"
          size={18}
          color="black"
        />
        <Text style={styles.exitText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  adminView: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: color.APP_BG,
  },
  header: {
    flexDirection: "row",
    marginTop: 50,
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 30,
  },
  headerText: {
    fontSize: 35,
    color: color.WHITE,
  },
  icon: {
    marginRight: 10,
  },
  controlText: {
    backgroundColor: color.RED,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  formInput: {
    backgroundColor: color.WHITE,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: color.GRAY,
    padding: 5,

    paddingHorizontal: 20,
  },
  formLable: {
    paddingLeft: 15,
  },
  formLableText: {
    color: color.WHITE,
    marginBottom: 10,
    fontSize: 15,
  },

  formRow: {
    marginBottom: 20,
    paddingHorizontal: 30,
  },
  formColm: {
    maxWidth: 180,
    marginRight: 10,
  },
  exitSettings: {
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#554994",
    padding: 3,
    paddingHorizontal: 5,
    borderRadius: 15,
  },
  exitText: {
    fontSize: 15,
    color: color.WHITE,
  },
  exitIcon: {
    marginRight: 5,
    color: color.WHITE,
  },
});

export default Admin;
