import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View, Text, Modal } from "react-native";
import color from "../misc/color";
import { Ionicons } from "@expo/vector-icons";
import { convertTime } from "../misc/Helper";

/**
 * Anons olunca modal için gösterir
 * @param {anons} param0 Gösterilecek anons
 * @returns
 */
const AnonsModal = ({ anons }) => {
  const minute = convertTime(anons.duration).split(":")[1];
  const [time, setTime] = useState(minute);

  const timerRef = useRef(time);

  useEffect(() => {
    const timerId = setInterval(() => {
      timerRef.current -= 1;
      if (timerRef.current < 0) {
        clearInterval(timerId);
      } else {
        setTime(timerRef.current);
      }
    }, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, []);

  return (
    <Modal style={styles.anonsModal} transparent={true} animationType="slide">
      <View style={styles.modalView}>
        <ActivityIndicator style={styles.spinner} color={color.WHITE} />

        <View style={styles.icon}>
          <Ionicons name="volume-high-outline" size={70} color={color.WHITE} />
        </View>
        <View>
          <Text style={styles.title}>Anons</Text>
          <Text style={[styles.description]}>{anons.Ismi}</Text>
          <Text style={[styles.description, styles.descriptionSub]}>
            {anons.Aciklama}
          </Text>
        </View>

        <View>
          <Text style={styles.countDown}>0:{time}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  spinner: {
    position: "absolute",
    zIndex: 999,
    elevation: 999,
    top: 20,
    right: 20,
  },
  modalView: {
    backgroundColor: color.BLUE,
    opacity: 0.9,
    flex: 1,
    paddingTop: 50,
    marginTop: 70,
    padding: 40,
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
  },
  anonsModal: {
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    backgroundColor: color.DARK_RED,
  },
  title: {
    fontSize: 60,
    color: color.WHITE,
  },
  description: {
    fontSize: 20,
    color: color.WHITE,
  },
  descriptionSub: {
    fontSize: 15,
  },
  icon: {},
  countDown: {
    color: color.YELLOW,
    fontSize: 100,
  },
});

export default AnonsModal;
