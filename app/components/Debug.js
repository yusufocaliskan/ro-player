import React, { createContext, useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AudioContext } from "../context/AudioProvider";
import configs from "../misc/config";

const Debug = () => {
  const context = useContext(AudioContext);

  return (
    <View style={styles.debuging}>
      <View style={[styles.debugingRow, styles.borderBottom]}>
        <Text style={styles.debugingText}>Ps: {context?.pageNo} / </Text>
        <Text style={styles.debugingText}>
          Ls: {context?.ListenedSongCount} /
        </Text>
        <Text style={styles.debugingText}>
          AuF: {context?.audioFiles?.length} /
        </Text>
        <Text style={styles.debugingText}>
          AnF: {context?.anonsFiles?.length} /
        </Text>
        <Text style={styles.debugingText}>
          MdF: {context?.mediaFiles?.length} /
        </Text>
        <Text style={styles.debugingText}>Vr: {configs.VERSION}</Text>
      </View>
      <View style={styles.separator}></View>
      <View style={[styles.debugingRow, styles.borderBottom]}>
        <Text style={styles.debugingText}>
          ScrollPoss: {context?.flatListCurrentScrollPossion}
        </Text>
      </View>
      <View style={[styles.debugingRow, styles.borderBottom]}>
        <Text style={styles.debugingText}>
          FlatListCurrentIndex: {context?.flatListScrollIndex}
        </Text>
      </View>
      <View style={[styles.debugingRow, styles.borderBottom]}>
        <Text style={styles.debugingText}>
          BelirliGunTekrar: {configs.BELIRGUN_TEKRARLI_ANONS}
        </Text>
      </View>
      <View style={[styles.debugingRow, styles.borderBottom]}>
        <Text style={styles.debugingText}>
          HerHafta: {configs.HERGUN_TEKRARLI_ANONS}
        </Text>
      </View>
      <View style={[styles.debugingRow, styles.borderBottom]}>
        <Text style={styles.debugingText}>
          CrosCheckin ({context?.playListCrossChecking.toString()})
        </Text>
      </View>
      <View style={[styles.debugingRow, styles.borderBottom]}>
        <Text style={styles.debugingText}>
          noInternetConnection ({context?.noInternetConnection.toString()})
        </Text>
      </View>
      <View style={[styles.debugingRow, styles.borderBottom]}>
        <Text style={styles.debugingText}>
          currentAudioIndex: {context?.currentAudioIndex}
        </Text>
      </View>
      <View style={[styles.debugingRow, styles.borderBottom]}>
        <Text style={styles.debugingText}>
          CurrentAnons: {context?.currentAnonsName}
        </Text>
      </View>
      <View style={[styles.debugingRow, styles.borderBottom]}>
        <Text style={styles.debugingText}>Debug: {context?.debug}</Text>
      </View>
      <View style={[styles.debugingRow, styles.borderBottom]}>
        <Text style={styles.debugingText}>
          PlayAnons: {context?.countPlayAnons}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  debuging: {
    backgroundColor: "green",
    zIndex: 999,
    position: "absolute",
    top: 50,
    right: 5,
    padding: 4,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: "#7FB77E",
    opacity: 0.8,
  },
  debugingRow: {
    flexDirection: "row",
  },
  debugingText: {
    color: "#fff",
    marginRight: 5,
  },
  separator: {
    height: 2,
    backgroundColor: "#7FB77E",
  },
});
export default Debug;
