import React, { useEffect, useContext, useState } from "react";
import { AudioContext } from "../context/AudioProvider";
import { FlatList, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import AudioListItem from "../components/AudioListItem";

const Anons = () => {
  /**
   * Bir anons çaldırır
   */
  const context = useContext(AudioContext);

  return (
    <Screen>
      <FlatList
        style={styles.anonsList}
        data={context.anonsFiles}
        keyExtractor={(item, index) => String(index)}
        renderItem={({ item, index }) => (
          <AudioListItem
            title={item.filename}
            duration={item.duration}
            item={item}
            style={styles.audioItem}
            keyy={index}
          />
        )}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  anonsList: {
    paddingBottom: 50,
  },
  audioItem: { paddingTop: 10 },
});

export default Anons;
