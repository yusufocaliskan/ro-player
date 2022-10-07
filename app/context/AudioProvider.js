import React, { PureComponent, createContext } from "react";
import { Text, Modal, StyleSheet, View, Alert } from "react-native";
import * as MediaLibrary from "expo-media-library";
import NetInfo from "@react-native-community/netinfo";
import WebView from "react-native-webview";
import TrackPlayer, { RepeatMode } from "react-native-track-player";
import {
  getCurrentDate,
  getDifferenceBetweenTwoHours,
  convertSecondToMillisecond,
  clearFileName,
} from "../misc/Helper";
import RNFetchBlob from "rn-fetch-blob";
import DownloadingGif from "../components/DownloadingGif";

//Şarkıları listelemek için kullanırlır
//ScrollView'den daha performanlısdır.

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import config from "../misc/config";
import { newAuthContext } from "../context/newAuthContext";

//Test Anonslar
//import TestAnons from "../TestAnons";
import color from "../misc/color";

export const AudioContext = createContext();

export class AudioProvider extends PureComponent {
  static contextType = newAuthContext;

  constructor(props) {
    super(props);

    this.state = {
      //Kullanıcı bilgileri
      username: null,
      password: null,

      //Login Pop-up
      showLoginModal: false,
      loggingIsDone: false,

      debug: null,

      //Mediadan alınan şarkılar
      audioFiles: [],
      anonsFiles: [],
      mediaFiles: [],

      //Permission hataları
      permissionError: false,
      permission: null,

      //Şarkı listesi
      dataProvider: null,

      //Şarkı çalma conrtolleri.
      playbackObj: null,
      soundObj: null,
      soundObjects: null,
      currentAudio: {},
      isPlaying: false,
      currentAudioIndex: 0,
      howManySongPlayed: 0,

      //Slider için
      playbackPosition: null,
      playbackDuration: null,

      userData: null,
      totalSongInTheServer: {},

      //Downloads
      isDownloading: false,

      playListCrossChecking: false,
      anonsCrossChecking: false,
      currentDownloadedSong: "",
      countDownloadedSong: 0,
      totalSong: 0,
      currentSongNumber: null,
      waitLittleBitStillDownloading: false,

      //Şarkı listesi
      dataProvider: null,

      //songs
      songs: [],
      pageNo: 1,
      flatListCurrentScrollPossion: 0,
      activeFlatListIndex: 0,
      flatListScrollIndex: 0,

      //AllAnons
      anons: [],
      anonsSoundObj: null,
      currentAnons: null,
      currentAnonsName: null,
      currentPlayingAnons: null,
      anonsIsPlaying: false,
      countPlayAnons: 0,

      //Song and Anons in the Storage
      downloadedSongs: [],
      downloadedAnons: [],
      theDownloadedPage: 0,

      //Playlist
      currentPlaylist: [],
      anonsPlaylist: [],

      //Anons Database bağlantısı
      DBConnection: null,
      AppSettingsConnection: null,

      //How Many song singged
      ListenedSongCount: 1,
      theSongListened: [],
      theTimePastedSinceAnonsLoopStart: 0,

      //Updates
      noAnyNewUpdateInserver: false,

      player: null,

      //Güncel tarih
      whatIsTheDate: `${getCurrentDate(
        new Date()
      )}T${new Date().toLocaleTimeString({
        hour12: false,
        hour: "2-digit",
        timeZone: "Europe/Istanbul",
      })}`,

      //Playlist güncelleme tarih
      lastPlaylistUpdateTime: null,
      noInternetConnection: false,
    };

    this.totalAudioCount = 0;
    this.totalAnonsCount = 0;
  }

  //Hata mesajı göster.
  permissionAlert = () => {
    Alert.alert(
      "Şarkılara erişim izni verilmek zorunlu.",
      "Uygulama izne ihtiyaç duyar.",
      [
        { text: "Tamam, izin ver.", onPress: this.getPermission() },
        { text: "Hayır", onPress: this.permissionAlert() },
      ]
    );
  };

  /**
   * Kullanıcıdan şarkılarına erişim izni iste
   */
  getPermission = async () => {
    const permission = await MediaLibrary.getPermissionsAsync();

    //İzin verildiy mi?
    if (permission.granted) {
      //izin verildi tüm şarkıları aall
      //this.savePermission("granted");
    }
    if (!permission.granted && !permission.canAskAgain) {
      this.setState({ ...this.state.state, permissionError: true });
      return;
    }
    //İzin verilmedi ama yeniden sorulabilir.
    //O zaman soralım!
    if (!permission.granted && permission.canAskAgain) {
      const { status, canAskAgain } =
        await MediaLibrary.requestPermissionsAsync();

      //Bize izin vermedi!
      if (status === "denied" && canAskAgain) {
        //Bir hata göster
        this.permissionAlert();
      }

      //Izin verildi..
      if (status === "granted") {
        //Tüm şarkıları all..
        this.setState({ ...this.state.state, permissionError: false });
        //this.savePermission("granted");
      }

      if (!permission.canAskAgain && !permission.granted) {
        this.setState({ ...this.state.state, permissionError: true });
        //this.savePermission("denied");
      }

      //izin verilmedi ve yeniden sormamızı mı engelledi!!
      if (status === "denied" && !canAskAgain) {
        //Ona bir şeyler söyle..
        this.setState({ ...this.state.state, permissionError: true });
        //this.savePermission("denied");
      }
    }
  };

  /**
   * Download klasöründe olan tüm ses dosyalarını verir.
   * @returns object
   */
  getMediaFiles = async () => {
    let media;
    media = await MediaLibrary.getAssetsAsync({ mediaType: "audio" });
    media = await MediaLibrary.getAssetsAsync({
      mediaType: "audio",
      first: media.totalCount,
    });

    //Save it to cache
    //AsyncStorage.setItem("mediaFiles", JSON.stringify(media));
    return media;
  };

  /**
   * Şarkı dosyalarını al.
   */
  getAudioFiles = async () => {
    //Ses telefona indirilen/Download dosyaları
    const media = await this.getMediaFiles();

    this.totalAudioCount = this.state.audioFiles.length;
    this.state.mediaFiles = media.assets;

    //Eğer inter yoksa..
    //Direk cache'den all..
    if (this.state.noInternetConnection) {
      console.log(
        "-------------Songs Files: NO Connection Cache---------------------"
      );

      this.setState({
        ...this.state,
        audioFiles: JSON.parse(await AsyncStorage.getItem("songs")),
      });
      return;
    }

    //Şarkıları da al.
    const songs = this.state.songs;
    const filtered_song = [];

    //Ses
    let d = 0;
    //for (; d < 5; d++) {
    for (; d < songs?.length; d++) {
      const mp3_file = songs[d].mp3.split("/").pop();
      const dosya_name = `sound_${clearFileName(mp3_file)}`;

      //Dosya eşini bul.
      let storageFile;
      media.assets.map((item) => {
        if (dosya_name == item.filename) {
          storageFile = item;
        }
      });
      //Push etmeden önce kontrol et push edeceğimiz ses var mı?
      if (!storageFile) {
        continue;
      } else {
        const the_song = {
          albumId: storageFile?.albumId,
          creationTime: storageFile?.creationTime,
          duration: storageFile?.duration,
          filename: storageFile?.filename,
          height: storageFile?.height,
          id: storageFile?.id,
          url: storageFile?.uri,
          mediaType: storageFile?.mediaType,
          modificationTime: storageFile?.modificationTime,
          uri: storageFile?.uri,
          width: storageFile?.width,
          DosyaIsmi: songs[d].title,
          Artist: songs[d].artist,
          mp3: songs[d].mp3,
          Ismi: songs[d].title,
        };
        if (the_song.url == "") {
          console.log("URL CREATED : ", songs[d].title);
          the_song.url = `file:///storage/emulated/0/Download/${the_song.mp3
            .split("/")
            .pop()}`;
        }

        filtered_song.push(the_song);
      }
    }

    //console.log(filtered_song)
    //push it into the state
    this.setState({
      ...this.state,
      audioFiles: [...filtered_song],
    });

    //Listeyi Cache at.
    if (filtered_song.length != 0) {
      await AsyncStorage.setItem("songs", JSON.stringify(filtered_song));
      await AsyncStorage.setItem("mediaFiles", JSON.stringify(media.assets));
    }
  };

  /**
   * Son güncelleme tarhi ile bu günü karşılaştırır
   * @param {integer} lastCacheTime güncelleme zamanı
   * @param {integer} timeOut kaç saat?
   * @returns boolean
   */
  cacheControl = async () => {
    const lastAnonsUpdateTime = await AsyncStorage.getItem(
      "Last_Playlist_Update_Time"
    );
    const timeOut = config.TIME_OF_GETTING_SONGS_FROM_SERVER;

    const diffTime = getDifferenceBetweenTwoHours(
      new Date(lastAnonsUpdateTime).getTime(),
      new Date().getTime()
    );

    // console.log(
    //   "Anons Last",
    //   new Date(lastAnonsUpdateTime),
    //   "Anons Time:",
    //   new Date()
    // );
    // console.log("Anons Time: ", new Date().getTime());
    // console.log("Anons TimeOut: ", convertSecondToMillisecond(timeOut));
    // console.log("diff ", diffTime);
    // console.log("Cont", diffTime > convertSecondToMillisecond(timeOut));

    if (diffTime > convertSecondToMillisecond(timeOut)) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Internet yoksa, şarkı listesini Storage'tan al.
   * //Ve çalll
   */
  ifThereIsNOOInternet = async () => {
    NetInfo.fetch().then(async (connection) => {
      try {
        //Heger ki internet yoksammm
        if (!connection.isConnected) {
          console.log(
            "-------------INTERNET YOK : CACHETEN OKUYORUZZ-------------"
          );
          const songs = JSON.parse(await AsyncStorage.getItem("songs"));
          this.setState({ ...this.state, audioFiles: songs });

          this.setState({ ...this.state, noInternetConnection: true });
          //  await this.getAnonsFiles();
        } else {
          this.setState({ ...this.state, noInternetConnection: false });
        }
      } catch (e) {
        throw "Hata! ";
      }
    });
  };

  /**
   * Kullanıcı bilgiler.
   */
  getUserInfo = async () => {
    const username = await AsyncStorage.getItem("username");
    const password = await AsyncStorage.getItem("password");
    this.setState({ ...this.state, username: username, password: password });
  };

  /**
   * Çalıştığında
   */
  componentDidMount = () => {
    //DB Bağlantı, dosya izni ve verileri databaseden all.
    this.getUserInfo();
    this.dbConnection();
  };

  /**
   * Database bağlantısını yap
   */
  dbConnection = async () => {
    //DATAbase table bağlantıları
    try {
      //this.requestToPermissions();
      //Musiclere erişim izni all
      await this.getPermission().then(async () => {
        //Admin ayarları
        //Serverdan Şarkı listesini al
        //await this.getSoundsAndAnonsFromServer();
        const service = await TrackPlayer.isServiceRunning();

        if (service == false) {
          await TrackPlayer.setupPlayer();
        }

        const lastTime = await AsyncStorage.getItem(
          "Last_Playlist_Update_Time"
        );
        this.setState({ ...this.state, lastPlaylistUpdateTime: lastTime });
        await this.loginToServerAndPlay();
        await this.playerEventListener();
      });

      //Serverdan şarkı ve anonsları al
    } catch (error) {
      console.log(error);
    }
  };

  loginToServerAndPlay = async () => {
    //Cache kontrolü yap.
    if ((await this.cacheControl()) === false) {
      console.log("------------EV:-Reading : CACHETEN-------------");

      const songs = JSON.parse(await AsyncStorage.getItem("songs"));
      this.setState({ ...this.state, audioFiles: songs });

      await this.startToPlay();

      return;
    }

    this.manualUpdate();
  };

  manualUpdate = async () => {
    //Web siteye login ol.
    await this.getPlaylistFromServer();

    if (this.state.noInternetConnection === false) {
      console.log("--------------------HEREEE--------------");
      //Playlisti boşalat.
      await TrackPlayer.reset();
      await this.getAudioFiles();
    }

    //ve çal
    await this.startToPlay(true);
  };

  //Playlisti alır..
  getPlaylistFromServer = async () => {
    this.setState({ ...this.state, playListCrossChecking: true });
    await axios
      .post("https://www.radiorder.online/Profil/MobilePlaylistYukle", {
        from: "mobileapp",
      })
      .then(async (playlist) => {
        //this.state.anons = playlist["data"];
        return playlist["data"];
      })
      .then(async (playlist) => {
        //Şarkıları indir.
        this.setState({ ...this.state, playListCrossChecking: false });
        this.setState({ ...this.state, noInternetConnection: false });

        if (playlist.length !== 0) {
          for (i = 0; i <= playlist.length; i++) {
            await this.DownloadSongsFromServer(
              playlist[i],
              "sound",
              i,
              playlist.length
            ).then(() => {
              if (i == playlist.length) {
                this.setState({ ...this.state, isDownloading: false });
                this.setState({ ...this.state, currentDownloadedSong: "" });
                this.setState({ ...this.state, totalSong: 0 });
              }
            });
          }

          this.setState({ ...this.state, songs: playlist });
          console.log("-------------IT IS the Time to UPDATE ---------------");
          AsyncStorage.setItem(
            "Last_Playlist_Update_Time",
            new Date().toISOString()
          );
          this.state.lastPlaylistUpdateTime = new Date().toISOString();
        }
      })
      .catch(async (e) => {
        await this.ifThereIsNOOInternet();
      });
  };

  /**
   * Server'dan şarkıları çeker
   * @param {object} sounds indirilicek şarkı
   */
  DownloadSongsFromServer = async (
    sounds,
    downloadType = "sound",
    i,
    totalSong
  ) => {
    try {
      // if (typeof sounds == undefined || sounds.length == 0 || sounds === null) {
      //   return;
      // }

      const { DownloadDir } = RNFetchBlob.fs.dirs;

      //İsmi temizle ve yeniden oşlutiur
      let soundName = `${DownloadDir}/${downloadType}_${clearFileName(
        sounds?.mp3?.split("/").pop()
      )}`;

      //Dosya yok is indir.
      //Dosyayı daha önce indirmişsek, bir şey yapma..
      try {
        const isExist = await RNFetchBlob.fs.exists(soundName);

        if (!isExist) {
          //Şarkıyı indir..
          if (sounds) {
            const options = {
              fileCache: true,
              addAndroidDownloads: {
                useDownloadManager: true,
                notification: false,
                path: soundName,
                description: "Downloading.",
              },
            };
            try {
              const mp3_file = `https://radiorder.online/${sounds?.mp3}`;

              await RNFetchBlob.config(options)
                .fetch("GET", mp3_file)
                .then((res) => {
                  return "res";
                });

              this.setState({ ...this.state, isDownloading: true });
              this.setState({ ...this.state, totalSong: totalSong });
              this.setState({
                ...this,
                currentDownloadedSong: sounds.title,
                countDownloadedSong: this.state.countDownloadedSong + 1,
              });
            } catch (error) {
              console.log(error);
            }
          }
        } else {
          return "File Already exists!";
        }
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  componentWillUnmount() {
    //this.state.DBConnection.close();
    this.setState = (state, callback) => {
      return;
    };
  }

  //Playerdaki değişimleri dinler..
  playerEventListener = async () => {
    TrackPlayer.addEventListener("playback-state", async (e) => {
      console.log("--------------------EVENT--------------");
      console.log(e);
    });

    //Şarkı değiştiğinde - Bittinğin de
    TrackPlayer.addEventListener("playback-track-changed", async () => {
      console.log("------------ . NEXT: Song .----------");
      NetInfo.fetch().then(async (connection) => {
        if (connection.isConnected == true) {
          this.setState({ ...this.state, noInternetConnection: false });
        }
      });
      //Logout yapılınca yeniden çağrılıyor.
      const user_token = await AsyncStorage.getItem("userToken");
      if (user_token == null) {
        await TrackPlayer.pause();
        return false;
      }
      //Index'i belirle
      const songIndex = JSON.parse(
        await AsyncStorage.getItem("lastAudioIndex")
      );
      const activePlaylistIndex = await TrackPlayer.getCurrentTrack();
      //flatlist index
      this.setState({
        ...this.state,
        flatListScrollIndex: activePlaylistIndex,
        currentAudioIndex: songIndex,
        activeFlatListIndex: activePlaylistIndex,
        isPlaying: true,
      });

      //Playlisti güncelle
      //Tabi eğer cache süresi dolmuş ise.
      await this.loginToServerAndPlay().then(() => {
        //Temizlik yap.
        if (songIndex == this.state.audioFiles.length - 1) {
          console.log("-------------TIME TO CLEANING-----");
          this.theSongCleaner();
        }
      });

      AsyncStorage.setItem("lastAudioIndex", JSON.stringify(songIndex));

      // const status = await TrackPlayer.getState();
      // const playbackObj = await TrackPlayer.getTrack(songIndex);
    });
  };

  /**
   * Çal
   */
  startToPlay = async (timeToUpdate = false) => {
    //Dosya boş ise

    setTimeout(async () => {
      console.log("----------------- START TO PLAY -----------------");
      if (this.state.isPlaying && timeToUpdate == false) {
        return false;
      }
      //Şarkıyı yükle ve çal
      //Playeri oluştur
      try {
        await TrackPlayer.add(this.state.audioFiles);

        await TrackPlayer.setRepeatMode(RepeatMode.Queue);
        let lastAudioIndex = JSON.parse(
          await AsyncStorage.getItem("lastAudioIndex")
        );
        console.log("------------lastAudioIndex: ", lastAudioIndex);
        if (lastAudioIndex == null) lastAudioIndex = 0;

        await TrackPlayer.skip(lastAudioIndex).then(async () => {
          await TrackPlayer.play().then(() => {
            this.setState({ ...this.state, isPlaying: true });
          });
        });
      } catch (error) {
        console.log(error);
      }
    }, 1000);
  };

  //Tüm müzik dosyalarını Temile
  //Not works, somehow
  cleanAllTheFilesDownloaded = async () => {
    const { DownloadDir } = RNFetchBlob.fs.dirs;
    let mediaFiles = await this.getMediaFiles();
    mediaFiles = mediaFiles.assets;

    for (let i = 0; mediaFiles.length; i++) {
      const results = await RNFetchBlob.fs
        .unlink(`${DownloadDir}/${mediaFiles[i].filename}`)
        .then(async () => {
          //Cacheleri temizle
          this.state.songs = [];
          this.state.anons = [];
          this.state.audioFiles = [];
          this.state.anonsFiles = [];
          AsyncStorage.removeItem("anons");
          AsyncStorage.removeItem("songs");

          await TrackPlayer.stop();
          return {
            message: "Dosyalar silindi.. ",
            deleted: true,
            deletedFileCount: mediaFiles.length,
          };
        })
        .catch((err) => {
          return {
            message: "İşlem başarısız oldu",
            deleted: false,
            deletedFileCount: mediaFiles.length,
          };
        });

      return results;
    }
  };

  //Kullanılmayan tüm müzik Dosylarını silleerr
  //Playlistteki dosyalar ve mediadaki dosyalar kkarşılaştırıp
  //Eşleşmeyeni siler
  theSongCleaner = async () => {
    const { DownloadDir } = RNFetchBlob.fs.dirs;
    console.log("------------------FILE DELETING--------------");
    //Silecnecek dosyaları bul be abi
    let media = await this.getMediaFiles();
    media = media.assets;
    let audioFiles = this.state.audioFiles;

    let fileWillDeleted = [];
    for (let i = 0; i < audioFiles.length; i++) {
      media = media.filter((item) => {
        return item?.filename != audioFiles[i]?.filename;
      });
    }

    for (let d = 0; d < media?.length; d++) {
      //TEmizle
      const file = `${DownloadDir}/${media[d].filename}`;
      console.log("DELETED FILE: ", file);

      const results = await RNFetchBlob.fs
        .unlink(file)
        .then(() => {
          return { deleted: true };
        })
        .catch((err) => {
          return { deleted: false };
        });

      console.log(results);
    }
  };

  /**Kontrollerdan */
  updateState = (prevState, newState = {}) => {
    this.setState({ ...prevState, ...newState });
  };

  render() {
    const {
      audioFiles,
      anonsFiles,
      mediaFiles,
      permissionError,
      dataProvider,
      playbackObj,
      soundObj,
      currentAudio,
      isPlaying,
      userData,
      currentAudioIndex,
      playbackPosition,
      playbackDuration,
    } = this.state;

    if (permissionError)
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            fontSize: 30,
            color: "red",
          }}
        >
          <Text style={styles.permissionError}>
            Ses dosyalarına erişim izni vermediniz. Ayarları gidip erişim izni
            verin.
          </Text>
        </View>
      );

    return (
      <AudioContext.Provider
        value={{
          audioFiles,
          anonsFiles,
          mediaFiles,
          playbackObj,
          soundObj,
          currentAudio,
          isPlaying,
          currentAudioIndex,
          playbackPosition,
          playbackDuration,
          dataProvider: dataProvider,
          userData,
          getAnonsFiles: this.getAnonsFiles,
          getAudioFiles: this.getAudioFiles,
          newAuthContext: this.context.loadingState.userData,
          totalAudioCount: this.totalAudioCount,
          updateState: this.updateState,
          isDownloading: this.state.isDownloading,
          onPlaybackStatusUpdate: this.onPlaybackStatusUpdate,
          startToPlay: this.startToPlay,
          pageNo: this.state.pageNo,

          //ANONS
          anonsSoundObj: this.state.anonsSoundObj,
          currentPlayingAnons: this.state.currentPlayingAnons,
          anonsPlaylist: this.state.anonsPlaylist,

          cleanAllTheFilesDownloaded: this.cleanAllTheFilesDownloaded,
          lastPlaylistUpdateTime: this.state.lastPlaylistUpdateTime,
          ListenedSongCount: this.state.ListenedSongCount,
          flatListCurrentScrollPossion: this.state.flatListCurrentScrollPossion,
          flatListScrollIndex: this.state.flatListScrollIndex,
          activeFlatListIndex: this.state.activeFlatListIndex,
          debug: this.state.debug,
          playListCrossChecking: this.state.playListCrossChecking,
          anonsCrossChecking: this.state.anonsCrossChecking,
          noInternetConnection: this.state.noInternetConnection,
          manualUpdate: this.manualUpdate,
        }}
      >
        {this.state.noInternetConnection == false ? (
          <Modal animationType="slide" visible={this.state.showLoginModal}>
            <WebView
              //ref={(r) => (this.state.webView = r)}
              onNavigationStateChange={(e) => {
                if (e.loading == false) {
                  // this.setState({ ...this.state, showLoginModal: false });
                }
              }}
              source={{
                uri: "https://www.radiorder.online/Radiorder/Giris/r",
                body: `DilSec=en&email=${this.state.username}&password=${this.state.password}&from=mobileapp`,
                method: "POST",
              }}
              onLoad={() => {
                this.setState({ ...this.state, showLoginModal: false });
              }}
              javaScriptEnabled={true}
              startInLoadingState={true}
              thirdPartyCookiesEnabled={true}
              domStorageEnabled={true}
              bounces={true}
              //injectedJavaScript={jsCode}
              geolocationEnabled={true}
              useWebKit={true}
            />
          </Modal>
        ) : null}

        {this.state.isDownloading ? (
          <DownloadingGif
            totalSong={this.state.totalSong}
            countDownloadedSong={this.state.countDownloadedSong}
            songName={this.state.currentDownloadedSong}
          />
        ) : null}

        {this.props.children}
      </AudioContext.Provider>
    );
  }
}

const styles = StyleSheet.create({
  permissionError: {
    fontSize: 30,
    color: color.WHITE,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    textAlign: "center",
    backgroundColor: color.RED,
    padding: 15,
    borderRadius: 10,
  },
});
export default AudioProvider;
