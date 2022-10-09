import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import color from "../misc/color";
import { useNetInfo } from "@react-native-community/netinfo";
import { MaterialIcons } from "@expo/vector-icons";
/**
 * Sağ üstte internet yok yazısı göstermek için kullanılır.
 */
export default NoInternetConnection = ({ text }) => {
  const netInfo = useNetInfo();

  //Internet varsa
  if (netInfo.isConnected == true) {
    return (
      <View style={styles.itIsConnected}>
        <MaterialIcons name="wifi" size={20} color={color.WHITE} />
      </View>
    );
  }

  //Internet yoksa
  if (netInfo.isConnected != true) {
    return (
      <View style={styles.internetInfo}>
        <Ionicons name="cloud-offline" size={20} color={color.BLACK} />
        <Text style={styles.internetInfoText}>{text}</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  internetInfo: {
    marginRight: 20,
    backgroundColor: color.YELLOW,
    paddingHorizontal: 10,
    paddingVertical: 2,
    paddingBottom: 3,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  internetInfoText: {
    color: color.BLACK,
    marginLeft: 10,
  },
  itIsConnected: {
    paddingHorizontal: 3,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 5,
    alignContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  itIsConnectedText: {
    color: color.WHITE,
    marginLeft: 6,
  },
});
