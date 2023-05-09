import React, { useContext, useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import NoInternetConnection from "./NoInternetConnection";
import color from "../misc/color";
import { MaterialIcons } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";

import { LangContext } from "../context/LangProvider";

import { AudioContext } from "../context/AudioProvider";
import Debug from "./Debug";
import configs from "../misc/config";
const HeaderRight = () => {
  const { Lang } = useContext(LangContext);
  const context = useContext(AudioContext);
  const lastPlaylistUpdateTime = new Date(
    context.lastPlaylistUpdateTime
  ).toLocaleTimeString();

  // const [currentTime, setCurrentTime] = useState();
  // useEffect(() => {
  //   const time = new Date().toLocaleTimeString();
  //   const interval = setInterval(() => {
  //     setCurrentTime(time);
  //   }, 36000);

  //   return () => {
  //     clearInterval(interval);
  //   };
  // });

  return (
    <>
      {configs.DEBUG ? <Debug /> : null}
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <View style={styles.updateView}>
            <MaterialIcons name="update" size={18} color={color.BLACK} />
            <Text style={styles.updateText}>
              {/* {Lang?.UPDATE}:  */}
              {lastPlaylistUpdateTime.split(" ")[0]}
            </Text>
          </View>
          <View style={[styles.updateView, styles.versionIcon]}>
            <Octicons name="versions" size={16} color="black" />
            <Text style={styles.updateText}>v{configs.VERSION}</Text>
          </View>
          <View style={[styles.updateView, styles.versionIcon]}>
            <Entypo name="time-slot" size={16} color="black" />
            <Text style={styles.updateText}>
              {Lang?.EVERY} {configs.TIME_OF_GETTING_SONGS_FROM_SERVER / 60}{" "}
              {Lang?.MINUTE}
            </Text>
          </View>

          {/* <View style={[styles.updateView, styles.versionIcon]}>
            <Text>{currentTime}</Text>
          </View> */}
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
  versionIcon: {
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
  },
  updateText: {
    color: color.BLACK,
    marginLeft: 5,
  },
  playlistUpdate: {
    backgroundColor: color.GREEN,
    padding: 3,
    paddingHorizontal: 10,
  },
  playlistUpdateText: {
    color: color.WHITE,
    marginLeft: 5,
  },
});

export default HeaderRight;
