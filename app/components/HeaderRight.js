import React, { useContext } from "react";
import { StyleSheet, View, Text } from "react-native";
import NoInternetConnection from "./NoInternetConnection";
import color from "../misc/color";
import { MaterialIcons } from "@expo/vector-icons";
import { LangContext } from "../context/LangProvider";
import Debug from "./Debug";
import configs from "../misc/config";
const HeaderRight = ({ lastPlaylistUpdateTime }) => {
  const { Lang } = useContext(LangContext);
  return (
    <>
      {configs.DEBUG ? <Debug /> : null}
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <View style={styles.updateView}>
            <MaterialIcons name="update" size={18} color={color.BLACK} />
            <Text style={styles.updateText}>{lastPlaylistUpdateTime}</Text>
          </View>
          <View style={styles.updateView}>
            <Text style={styles.updateText}>{configs.VERSION}</Text>
          </View>
          <View style={styles.updateView}>
            <Text style={styles.updateText}>
              Timeout : {configs.TIME_OF_GETTING_SONGS_FROM_SERVER}
            </Text>
          </View>
          <NoInternetConnection text={Lang?.NO_INTERNET} />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  updateView: {
    flexDirection: "row",
    backgroundColor: color.LIGHT_RED,
    alignItems: "center",
    marginRight: 10,
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  updateText: {
    color: color.BLACK,
    marginLeft: 5,
  },
});

export default HeaderRight;
