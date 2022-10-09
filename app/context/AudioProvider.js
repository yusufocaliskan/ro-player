import React, { PureComponent, createContext } from "react";
import { Text, Modal, StyleSheet, View, Alert, AppState } from "react-native";
import * as MediaLibrary from "expo-media-library";
import NetInfo from "@react-native-community/netinfo";
import WebView from "react-native-webview";
import TrackPlayer, { RepeatMode } from "react-native-track-player";
import BackgroundTimer from "react-native-background-timer";

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

      //Playlist güncelleme tarih
      lastPlaylistUpdateTime: null,
      noInternetConnection: false,
    };

    this.totalAudioCount = 0;
    this.totalAnonsCount = 0;

    this.inervalCheck4Update = null;
    this.appState;
    this.downloadTask;
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
    //Version numarasını söyle.
    //Tts.speak(`Versiyon ${config.VERSION}`);
    this.appState = AppState.addEventListener("change", (nextState) => {
      console.log(nextState);
      if (
        nextState == "background" ||
        nextState == "inactive" ||
        nextState == "unknown"
      ) {
        BackgroundTimer.clearInterval(this.inervalCheck4Update);
        //this.downloadTask.cancel();
      }
      if (nextState == "active") {
        this.startTheCronJob();
      }
    });

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

        //Player kurulu ise yeniden kurma
        if (service == false) {
          await TrackPlayer.setupPlayer();
          await TrackPlayer.setRepeatMode(RepeatMode.Queue);
        }

        //lastAudioIndex'i 0 eşitle
        AsyncStorage.setItem("lastAudioIndex", JSON.stringify(0));

        //Son updatei state'e ata
        const lastTime = await AsyncStorage.getItem(
          "Last_Playlist_Update_Time"
        );
        this.setState({ ...this.state, lastPlaylistUpdateTime: lastTime });
        await this.loginToServerAndPlay();

        //Güncelleme için yeni interval aç
        //Her TIME_OF_GETTING_SONGS_FROM_SERVER süre sorran playlisti güncelle
        this.startTheCronJob();

        //Eventleri dinle
        await this.playerEventListener();
      });

      //Serverdan şarkı ve anonsları al
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Belli aralıklarla playlisti günceller.
   */
  startTheCronJob = () => {
    this.inervalCheck4Update = BackgroundTimer.setInterval(() => {
      console.log("-----HII--CRON---JOB---");

      //Download işlemi yoksa çalıştır.
      if (this.state.isDownloading == false) {
        this.check4Update();
      }
    }, convertSecondToMillisecond(config.TIME_OF_GETTING_SONGS_FROM_SERVER + 5));
  };
  /**
   * Interval için kullanıylıyor...
   * //Yeni güncelleme var mı yok mıu?
   * //Her TIME_OF_GETTING_SONGS_FROM_SERVER kontrol et
   */
  check4Update = async () => {
    const cacheTimeout = await this.cacheControl();
    //Çalıyorsa durdur.
    if (this.state.isPlaying == true && cacheTimeout == true) {
      await TrackPlayer.pause();
    }

    //Yeni güncellemeden önce son index'is sakla
    AsyncStorage.setItem(
      "lastAudioIndex",
      JSON.stringify(this.state.currentAudioIndex)
    );

    //Playlisti güncelle
    //Tabi eğer cache süresi dolmuş ise.

    await this.loginToServerAndPlay();
  };

  /**
   * Cache'ten mi okuyamlım playlist yoksa
   * Servera gidip alalım mı?
   */
  loginToServerAndPlay = async () => {
    //Cache kontrolü yap.
    //Cache zamanı dolmamış ise playlisti olduğu gibi
    //kullanmaya devam et
    if ((await this.cacheControl()) === false) {
      console.log("------------ Reading from Cache -------------");

      //Cache'i al
      const songs = JSON.parse(await AsyncStorage.getItem("songs"));
      this.setState({ ...this.state, audioFiles: songs });

      //Çalmağa başala.
      //await TrackPlayer.reset();
      if (this.state.isPlaying == false) {
        //İlk açıldığında cache zamanı ise cache'ten çal.
        await this.startToPlay();
      }

      return;
    }

    //Cache zamanı geçti ise
    //Servera git ve yeni playlist var mı diye kontrol et.
    if (this.state.noInternetConnection === false) {
      this.setState({ ...this.state, audioFiles: [] });
    }
    await this.getPlaylistFromServer().then(async () => {
      //Eğer internet var, Playlisti güncelle
      //Internety yoksa oynatmaya devam et.
      if (this.state.noInternetConnection === false) {
        console.log("----------- Playlist güncelleniiiyeaaa... -----------");
        //Playlisti boşalat. Yeni bir şeyler getirmiş olmalı.
        await TrackPlayer.reset();

        await this.getAudioFiles();
      }

      //ve çal
      await this.startToPlay(true);
    });
  };

  /**
   * Serverdan playlisti çeker
   * //State e atar. songs state i daha sonra
   * getAudioFiles method'unda işleniyor
   * ve audioFiles state'ini oluşruuyor
   */
  getPlaylistFromServer = async () => {
    this.setState({ ...this.state, playListCrossChecking: true });
    this.setState({ ...this.state, isPlaying: false });
    //this.setState({ ...this.state, showLoginModal: true });

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
                this.setState({ ...this.state, countDownloadedSong: 0 });
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
        const mp3_file = `https://file.radiorder.online/${sounds?.mp3}`;

        if (!isExist) {
          //Şarkıyı indir..
          if (sounds) {
            this.downloadTask = {
              fileCache: true,
              addAndroidDownloads: {
                useDownloadManager: true,
                notification: false,
                path: soundName,
                description: "Downloading.",
              },
            };
            try {
              console.log(this.downloadTask);
              await RNFetchBlob.config(this.downloadTask)
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
    clearInterval(this.inervalCheck4Update);
    BackgroundTimer.clearInterval(this.inervalCheck4Update);
    this.appState.remove();
    this.setState = (state, callback) => {
      return;
    };
  }

  //Playerdaki değişimleri dinler..
  playerEventListener = async () => {
    TrackPlayer.addEventListener("playback-state", async (e) => {
      console.log("---------------EVENT---------------", e);

      if (e.state == "paused" && e.state == "connecting" && e.state == "idle") {
        this.setState({ ...this.state, isPlaying: false });
      }
      if (e.state == "playing") {
        this.setState({ ...this.state, isPlaying: true });
      }
    });

    //Şarkı değiştiğinde - Bittinğin de
    TrackPlayer.addEventListener("playback-track-changed", async () => {
      console.log("------------ . SONG CHANGED .----------");

      //Bağlantıyı kontrol et.
      NetInfo.fetch().then(async (connection) => {
        if (connection.isConnected == true) {
          this.setState({ ...this.state, noInternetConnection: false });
        }
      });

      const currentAudioIndex = await TrackPlayer.getCurrentTrack();
      // console.log("currentAudioIndex", currentAudioIndex);
      // console.log("this.state.audioFiles.length", this.state.audioFiles.length);

      ///Son şarkı ise, bir bak bakalım silindecek mp3 dosyası var mı?
      if (currentAudioIndex + 1 == this.state.audioFiles.length) {
        //if (currentAudioIndex == 2) {
        console.log("----------QUEUE ENDED : TIME TO CLEANING---------");
        this.theSongCleaner();
      }

      //Logout yapılınca yeniden çağrılıyor.
      const user_token = await AsyncStorage.getItem("userToken");
      if (user_token == null) {
        await TrackPlayer.pause();
        return false;
      }

      //flatlist index
      this.setState({
        ...this.state,
        flatListScrollIndex: currentAudioIndex,
        currentAudioIndex: currentAudioIndex,
        activeFlatListIndex: currentAudioIndex,
      });

      // const status = await TrackPlayer.getState();
      // const playbackObj = await TrackPlayer.getTrack(songIndex);
    });
  };

  /**
   * getAudioFiles() methodunda içi dolurulan audioFiles statni alır
   * ve TrackPlayer'a ekler. Son kaldığı yerden çalmaya başlar.
   * @param timeToUpdate boolean servara veriler alındıktan sonra true olarak girili
   */
  startToPlay = async (timeToUpdate = false) => {
    //Dosya boş ise

    setTimeout(async () => {
      console.log("----------------- START TO PLAY -----------------");

      //Şarkıyı yükle ve çal
      //Playeri oluştur
      try {
        await TrackPlayer.add(this.state.audioFiles).then(async () => {
          //Eğer güncelleme yapıldıysa.
          //Son kaldığı şarkı sırasına git ve çalmaya oradan başla.
          if (timeToUpdate) {
            let lastAudioIndex = JSON.parse(
              await AsyncStorage.getItem("lastAudioIndex")
            );

            if (lastAudioIndex == null) lastAudioIndex = 0;

            this.state.currentAudioIndex = lastAudioIndex;
            await TrackPlayer.skip(lastAudioIndex);
          }

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
    console.log("------------------FILE DELETING--------------");
    //Silecnecek dosyaları bul be abi
    const { DownloadDir } = RNFetchBlob.fs.dirs;
    let media = await this.getMediaFiles();

    media = media.assets;
    let audioFiles = this.state.audioFiles;
    let queue = await TrackPlayer.getQueue();
    // console.log("audioFiles.length", audioFiles.length);
    // console.log("queue.length", queue.length);
    // console.log("media.length", media.length);
    if (audioFiles.length == 0) return;

    //Silinecek dosyaları belirle
    for (let i = 0; i < audioFiles.length; i++) {
      media = media.filter((item) => {
        return item?.filename != audioFiles[i]?.filename;
      });
    }
    console.log("Media: ", media.length);

    //Sil şimdi.
    for (let d = 0; d < media?.length; d++) {
      let file = `${DownloadDir}/${media[d].filename}`;
      const isExist = await RNFetchBlob.fs.exists(media[d].uri);
      console.log("DELETED FILE: ", file);
      console.log("File exists:", isExist);

      const result = await RNFetchBlob.fs
        .unlink(file)
        .then((res) => {
          console.log("------------DELETEEE----", res);
        })
        .catch((err) => {
          console.log(err);
        });
      console.log(result);
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
          inervalCheck4Update: this.inervalCheck4Update,
          downloadTask: this.downloadTask,
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
