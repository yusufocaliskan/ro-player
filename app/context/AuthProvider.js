import React, { createContext, Component } from "react";
import Logo from "../components/Logo";
import LoadingGif from "../components/LoadingGif";
import config from "../misc/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();
//kullanıcı giriş çıkışlarını kontrol eder.

class AuthProvider extends Component {
  //Navigation

  constructor(props) {
    super(props);

    //Logo için yükseklik değerini al
    this.state = {
      //Değişkenleri tanımla
      logging: true,

      //Login
      isLoggedIn: false,
      userToken: "",
      userId: null,
      userImage: null,
      userCity: "",
      userEmail: "",
      userFullName: "",
      userData: {},
    };
  }

  setLoggedIn = async () => {
    this.state.isLoggedIn = true;
  };

  /**
   * Kullanıcı bilgilerini state e ata
   * @param {object} data Kullanıcı bilileri
   */
  setUserInfo = async (data) => {
    this.setState({ ...this.state, userFullName: "data.FSL.Ismi" });
    await AsyncStorage.setItem("userData", JSON.stringify({ data }));

    this.state.userData = data;
  };

  setLoggedOut = () => {
    this.state.userToken = null;
    this.state.isLoggedIn = false;
  };

  //Kontolleri yap
  componentDidMount() {
    setTimeout(() => {
      this.state.isLoggedIn = false;
    }, 1000);
  }

  //Giriş yapılmamış ise giriş formunu
  render() {
    if (this.state.isLoggedIn) {
      return <LoadingGif />;
    }

    return (
      <AuthContext.Provider
        value={{
          setLoggedIn: this.setLoggedIn,
          isLoggedIn: this.state.isLoggedIn,
          setUserInfo: this.setUserInfo,
          userFullName: this.state.userFullName,
          userData: this.state.userData,
        }}
      >
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

export default AuthProvider;
