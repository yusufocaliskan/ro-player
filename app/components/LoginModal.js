import React, { useState } from "react";
import { Modal } from "react-native";
import WebView from "react-native-webview";

const LoginModal = ({ showLoginModal }) => {
  const [modalVisibility, setModalVisibility] = useState(showLoginModal);
  console.log("--------------", modalVisibility);
  return (
    <Modal animationType="slide" visible={modalVisibility}>
      <WebView
        //ref={(r) => (this.state.webView = r)}
        onNavigationStateChange={(e) => {
          if (e.loading == false) {
            // this.setState({ ...this.state, showLoginModal: false });
          }
        }}
        source={{
          uri: "https://www.radiorder.online/Radiorder/Giris/r",
          body: `DilSec=en&email=info@yusuf.com&password=123456`,
          method: "POST",
        }}
        onLoad={() => {
          setModalVisibility(false);
          console.log("-*****");
        }}
        javaScriptEnabled={true}
        startInLoadingState={true}
        thirdPartyCookiesEnabled={true}
        domStorageEnabled={true}
        bounces={true}
        scrollEnabled={true}
        geolocationEnabled={true}
        allowUniversalAccessFromFileURLs={true}
        useWebKit={true}
      />
    </Modal>
  );
};

export default LoginModal;
