import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import color from "../misc/color";
import { useNavigation } from "@react-navigation/native";
import HeaderRight from "../components/HeaderRight";
import AsyncStorage from "@react-native-async-storage/async-storage";
const Screen = ({ children }) => {
  const navigation = useNavigation();
  createHeader = async () => {
    const lastPlaylistUpdateTime = await AsyncStorage.getItem(
      "Last_Playlist_Update_Time"
    );
    navigation?.setOptions({
      headerRight: () => {
        return (
          <HeaderRight
            lastPlaylistUpdateTime={new Date(
              lastPlaylistUpdateTime
            ).toLocaleTimeString()}
          />
        );
      },
    });
  };
  useEffect(() => {
    createHeader();
  }, []);

  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.APP_BG,
    paddingTop: StatusBar.currentHeight,
  },
});

export default Screen;
