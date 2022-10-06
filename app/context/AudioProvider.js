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
import { stop, play, pause, resume, playNext } from "../misc/AudioController";

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
      currentAudioIndex: null,
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
      currentSongNumber: null,
      waitLittleBitStillDownloading: false,

      //Şarkı listesi
      dataProvider: null,

      //songs
      songs: [],
      pageNo: 1,
      flatListCurrentScrollPossion: 0,
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

  /**
   * Application açıldığında en son şarkıyı
   * Alır ve çalar.
   */
  loadPreviousAudio = async () => {
    let previousAudio = await AsyncStorage.getItem("previousAudio");
    let currentAudio;
    let currentAudioIndex;

    //Kullanıcı henüz bir şarkı çaldırmadı
    if (previousAudio === null) {
      currentAudio = this.state.audioFiles[0];
      currentAudioIndex = 0;
    } else {
      (previousAudio = JSON.parse(previousAudio)),
        (currentAudio = previousAudio.audio);
      currentAudioIndex = previousAudio.index;
    }

    //Durumu güncelle
    this.setState({ ...this.state.state, currentAudio, currentAudioIndex });
  };

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

      // const { DownloadDir } = RNFetchBlob.fs.dirs;
      // //İsmi temizle ve yeniden oşlutiur
      // let file = `${DownloadDir}/${dosya_name}`;
      // const isExist = await RNFetchBlob.fs.exists(file);
      // if (isExist === false) continue;

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
    //console.log(this.state.audioFiles);

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
          //await this.getAudioFiles();
          //  await TrackPlayer.reset();
          this.startToPlay();

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
      console.log("-------------Reading : CACHETEN-------------");

      console.log("--------Needed: Cacheee-------");
      const songs = JSON.parse(await AsyncStorage.getItem("songs"));
      this.setState({ ...this.state, audioFiles: songs });

      await this.startToPlay();

      return;
    }

    //Web siteye login ol.
    await this.getPlaylistFromServer();
    if (this.state.noInternetConnection === false) {
      //Playlisti boşalat.
      await TrackPlayer.reset();
      await this.getAudioFiles();
    }

    //ve çal
    await this.startToPlay();
  };

  //Playlisti alır..
  getPlaylistFromServer = async () => {
    this.setState({ ...this.state, showLoginModal: true });

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
        console.log("Playlist: ", playlist.length);

        if (playlist.length !== 0) {
          for (i = 0; i <= playlist.length; i++) {
            await this.DownloadSongsFromServer(playlist[i], "sound").then(
              () => {
                if (i == playlist.length) {
                  this.setState({ ...this.state, isDownloading: false });
                  this.setState({ ...this.state, currentDownloadedSong: "" });
                }
              }
            );

            // if (playlist[i].artist == "Radiorder Anons Sistemi") {
            //   this.setState({
            //     ...this.state,
            //     anons: [...this.state.anons, playlist[i]],
            //   });
            // }
          }

          this.setState({ ...this.state, songs: playlist });
          console.log("-------------IT IS the Time to UPDATE ---------------");
          AsyncStorage.setItem(
            "Last_Playlist_Update_Time",
            new Date().toISOString()
          );
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
  DownloadSongsFromServer = async (sounds, downloadType = "sound", pageNo) => {
    try {
      // if (typeof sounds == undefined || sounds.length == 0 || sounds === null) {
      //   return;
      // }

      const { DownloadDir } = RNFetchBlob.fs.dirs;

      //İsmi temizle ve yeniden oşlutiur
      let soundName = `${DownloadDir}/${downloadType}_${clearFileName(
        sounds?.mp3?.split("/").pop()
      )}`;

      //console.log(soundName);

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
              this.setState({
                ...this,
                currentDownloadedSong: sounds.title,
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

    TrackPlayer.addEventListener("playback-queue-ended", async (e) => {
      console.log("--------------------QUEUE ENDEDDDD. --------------");
      //this.theSongCleaner();
    });

    //Şarkı değiştiğinde - Bittinğin de
    TrackPlayer.addEventListener("playback-track-changed", async () => {
      console.log("------------ . NEXT: Song .----------");

      //Index'i belirle
      const songIndex = await TrackPlayer.getCurrentTrack();
      console.log("CurrentIndex : ", songIndex);
      //console.log(await TrackPlayer.getQueue());

      //Playlisti güncelle
      //Tabi eğer cache süresi dolmuş ise.
      await this.loginToServerAndPlay().then(() => {
        //Temizlik yap.
        if (songIndex == this.state.audioFiles.length - 1) {
          console.log("-------------TIME TO CLEANING-----");
          this.theSongCleaner();
        }
      });
      //flatlist index
      this.setState({
        ...this.state,
        flatListScrollIndex: songIndex,
        currentAudioIndex: songIndex,
        isPlaying: true,
      });

      // const status = await TrackPlayer.getState();
      // const playbackObj = await TrackPlayer.getTrack(songIndex);
    });
  };

  /**
   * Çal
   */
  startToPlay = async () => {
    //Dosya boş ise

    setTimeout(async () => {
      console.log("----------------- START TO PLAY -----------------");

      //Şarkıyı yükle ve çal
      //Playeri oluştur
      try {
        //await TrackPlayer.reset();

        //await TrackPlayer.removeUpcomingTracks();

        //await TrackPlayer.reset();
        //console.log(await TrackPlayer.getQueue());
        //console.log(this.state.audioFiles);
        //Playlisti yükle
        await TrackPlayer.add(this.state.audioFiles);

        await TrackPlayer.setRepeatMode(RepeatMode.Queue);
        await TrackPlayer.play();
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
          loadPreviousAudio: this.loadPreviousAudio,
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
          debug: this.state.debug,
          playListCrossChecking: this.state.playListCrossChecking,
          anonsCrossChecking: this.state.anonsCrossChecking,
          noInternetConnection: this.state.noInternetConnection,
        }}
      >
        {this.state.noInternetConnection === false ? (
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
          <DownloadingGif songName={this.state.currentDownloadedSong} />
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
