import React, { PureComponent, Component } from "react";
import { Dimensions, FlatList, View, Text, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { AudioContext } from "../context/AudioProvider";
import AudioListItem from "../components/AudioListItem";
import color from "../misc/color";
import Screen from "../components/Screen";
import ListFooterComponent from "../components/ListFooterComponent";
import { storeAudioForNextOpening } from "../misc/Helper";
import AnonsModal from "../components/AnonsModal";
import * as ScreenOrientation from "expo-screen-orientation";

//Expo-av şarkıları çalar.
import { Audio } from "expo-av";

//Controller
import { play, pause, resume, playNext } from "../misc/AudioController";

import "react-native-get-random-values";
import LoadingSimple from "../components/LoadingSimple";

export class AudioList extends PureComponent {
  static contextType = AudioContext;

  //Constructor
  constructor(props) {
    super(props);
    this.state = {
      optionModalVisible: false,
      finish: true,
      offset: 0,
      flatListRef: null,
      flatListScrollDirection: null,
      flatListCurrentScrollIndex: this.context?.flatListScrollIndex,
    };

    this.currentItem = {};
  }

  /**
   * //İlkez: şarkıya çalmak için basıldığında
   * @param {object} audio
   * @returns object
   */
  handleAudioPress = async (audio) => {
    const { playbackObj, soundObj, currentAudio, updateState, audioFiles } =
      this.context;

    //Play#1: Şarkıyı çal. Daha önce hiç çalınmamış ise
    if (soundObj === null) {
      const playbackObj = new Audio.Sound();

      //Controllerdan çağır.
      const status = await play(playbackObj, audio.uri);
      const index = audioFiles.indexOf(audio);

      //Yeni durumu state ata ve ilerlememesi için return'le
      updateState(this.context, {
        currentAudio: audio,
        playbackObj: playbackObj,
        soundObj: status,
        currentAudioIndex: index,

        //Çalma-Durdurma iconları için
        isPlaying: true,
      });

      playbackObj.setOnPlaybackStatusUpdate(
        this.context.onPlaybackStatusUpdate
      );

      //Application açıldığında
      //son çalınna şarkıyı bulmak için kullanırı
      storeAudioForNextOpening(audio, index);
    }

    //Pause#2: Şarkıyı durdur.
    if (
      soundObj != null &&
      soundObj.isLoaded &&
      soundObj.isPlaying &&
      currentAudio.id === audio.id
    ) {
      //Controller
      const status = await pause(playbackObj);

      //Yeni durumu state ata ve ilerlememesi için return'le
      return updateState(this.context, { soundObj: status, isPlaying: false });
    }

    //Resume#3 : Şarkı durdurulmuş ise yeniden çalıdrmaya devam ettir
    if (
      soundObj != null &&
      soundObj.isLoaded &&
      !soundObj.isPlaying &&
      currentAudio.id === audio.id
    ) {
      //console.log(audio);
      const status = await resume(playbackObj);

      //Yeni durumu state ata ve ilerlememesi için return'le
      return updateState(this.context, {
        soundObj: status,
        isPlaying: true,
      });
    }

    //Next#4 : Başka bir şarlkıya geç
    if (
      soundObj != null &&
      soundObj.isLoaded &&
      soundObj.isPlaying &&
      currentAudio.id !== audio.id
    ) {
      const index = audioFiles.indexOf(audio);
      const status = await playNext(playbackObj, audio.uri);

      //Yüklenmiş toplam şarkıdan bir 2eksi olunca yükle
      if (index == this.context.audioFiles.length - 3) {
        this.context.LoadMoreSongs();
      }

      updateState(this.context, {
        currentAudio: audio,
        soundObj: status,
        isPlaying: true,
        currentAudioIndex: index,
      });
      storeAudioForNextOpening(audio, index);
    }

    if (
      soundObj != null &&
      soundObj.isLoaded &&
      !soundObj.isPlaying &&
      currentAudio.id !== audio.id
    ) {
      const index = audioFiles.indexOf(audio);
      const status = await playNext(playbackObj, audio.uri);
      updateState(this.context, {
        currentAudio: audio,
        soundObj: status,
        isPlaying: true,
        currentAudioIndex: index,
      });
      storeAudioForNextOpening(audio, index);
    }
  };

  /**
   * Bir anons çalar.
   */

  handleFlatListScroll = (event) => {
    this.context.updateState(this.context, {
      flatListCurrentScrollPossion: event.nativeEvent.contentOffset.y,
    });
  };

  //FlatList Scrollünü şarkının bulunduğu konuma
  //scroll et
  flatListScrollToIndex = () => {
    //this.context?.flatListScrollIndex
    this.flatListRef?.scrollToIndex({
      animated: false,
      index: this.context?.flatListScrollIndex - 1,
    });
  };

  componentDidMount = () => {
    //this.props.navigation.setOptions({ orientation: "landscape" });
    //this.changeScreenOrientation();
  };

  componentDidUpdate = (nextProps, nextState) => {
    // if (this.context?.flatListScrollIndex) {
    //   this.flatListScrollToIndex();
    // }
  };

  render() {
    if (!this.context?.audioFiles?.length) {
      return <LoadingSimple />;
    }

    return (
      <>
        <Screen>
          <FlatList
            style={{ paddingTop: 20 }}
            data={this.context.audioFiles}
            keyExtractor={(item, index) => String(index)}
            //initialNumToRender={2}
            //scrollEnabled={this.context.playListCrossChecking ? false : true}
            // ref={(ref) => {
            //   this.flatListRef = ref;
            // }}
            // onEndReached={() => {
            //   NetInfo.fetch().then(async (connection) => {
            //     if (connection.isConnected) {
            //       this.context.LoadMoreSongs();
            //     }
            //   });
            // }}
            //onEndReachedThreshold={0.1}
            //refreshing={<ListFooterComponent />}
            //ListFooterComponent={<ListFooterComponent />}
            onScroll={(event) => {
              let currentOffset = event.nativeEvent.contentOffset.y;

              let direction = currentOffset > this.state.offset ? "down" : "up";
              this.state.offset = currentOffset;
              this.state.flatListScrollDirection = direction;
              this.handleFlatListScroll(event);
            }}
            renderItem={({ item, index }) => (
              <AudioListItem
                title={item.filename}
                style={[
                  styles.songItem,
                  index + 1 == this.context.audioFiles.length
                    ? { marginBottom: 30 }
                    : null,
                ]}
                duration={item.duration}
                isPlaying={this.context.isPlaying}
                activeListItem={this.context.currentAudioIndex === index}
                item={item}
                index={index}
                keyy={index + 1}
                onAudioPress={() => this.handleAudioPress(item)}
              />
            )}
          />

          {this.state.flatListScrollDirection == "down" ? (
            <View style={styles.playlistLen}>
              <View style={[styles.playlistLenTextView]}>
                <Text style={styles.playlistLenText}>
                  {this.context?.currentAudioIndex + 1}
                </Text>
                <Text style={styles.playlistLenText}>/</Text>
                <Text style={styles.playlistLenText}>
                  {this.context.audioFiles.length}
                </Text>
              </View>
            </View>
          ) : null}
        </Screen>

        {this.context.anonsSoundObj != null &&
        this.context.currentPlayingAnons != null &&
        this.context.anonsSoundObj.isPlaying ? (
          <AnonsModal anons={this.context.currentPlayingAnons} />
        ) : null}
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },

  songItem: {
    paddingTop: 10,
  },
  playlistLen: {
    alignSelf: "center",
    paddingHorizontal: 10,

    marginTop: 5,
    alignItems: "center",
    alignContent: "center",
    backgroundColor: color.WHITE,
    position: "absolute",
    top: 0,
    zIndex: 999,
    borderRadius: 10,
  },
  playlistLenTextView: {
    flexDirection: "row",
  },
  playlistLenText: {
    fontSize: 18,
    padding: 5,
    color: "#888",
  },
  playlistLenTextUpdateDate: {
    flexDirection: "row",
    alignContent: "center",
    borderTopWidth: 1,
    borderColor: "#aaa",
  },
  playlistLenTextUpdate: {
    fontSize: 15,
    padding: 5,
    color: "#aaa",
  },
  iconUpdate: {
    marginTop: 7,
  },
});

export default AudioList;
