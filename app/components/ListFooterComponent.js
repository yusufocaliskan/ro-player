import React, { useContext } from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import color from "../misc/color";
import { LangContext } from "../context/LangProvider";

const ListFooterComponent = () => {
  const { Lang } = useContext(LangContext);
  return (
    <View style={styles.ListFooterComponent}>
      <ActivityIndicator
        style={styles.ListFooterComponentSpinner}
        color={color.WHITE}
      />
      <Text style={styles.ListFooterComponentText}>{Lang?.LOADING}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  ListFooterComponent: {
    backgroundColor: color.RED,
    padding: 10,
    width: 150,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 50,
    marginTop: 20,
    alignContent: "center",

    alignItems: "center",
    flexDirection: "row",
  },
  ListFooterComponentText: {
    color: color.WHITE,
    textAlign: "center",
    fontSize: 16,
  },
  ListFooterComponentSpinner: {
    marginRight: 20,
  },
});

export default ListFooterComponent;
