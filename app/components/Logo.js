import React from "react";
import { Image } from "react-native";
import LogoPNG from "../images/logo.png";
import LogoBlackPNG from "../images/logo_black.png";

const Logo = ({ styles, height, color }) => {
  return (
    <Image
      source={color == "black" ? LogoBlackPNG : LogoPNG}
      resizeMode="contain"
      //Ekranin %30'u
      style={styles}
    />
  );
};

export default Logo;
