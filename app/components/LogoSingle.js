import React from "react";
import { Image } from "react-native";

import LogoSinglePNG from "../images/logo_single.png";

const LogoSingle = ({ styles, height, color }) => {
  return (
    <Image
      source={LogoSinglePNG}
      resizeMode="contain"
      //Ekranin %30'u
      style={styles}
    />
  );
};

export default LogoSingle;
