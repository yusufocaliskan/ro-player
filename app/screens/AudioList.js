import React, { PureComponent, Component } from "react";
import { FlatList, View, Text, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { AudioContext } from "../context/AudioProvider";
import AudioListItem from "../components/AudioListItem";
import color from "../misc/color";
import Screen from "../components/Screen";
import AnonsModal from "../components/AnonsModal";
import TrackPlayer from "react-native-track-player";

//Controller

import "react-native-get-random-values";
import LoadingSimple from "../components/LoadingSimple";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class AudioList extends Component {
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
    };

    this.currentItem = {};
  }

  /**
   * //İlkez: şarkıya çalmak için basıldığında
   * @param {object} audio
   * @returns object
   */
  handleAudioPress = async (audio, index) => {
    const { playbackObj, soundObj, currentAudio, updateState, audioFiles } =
      this.context;
    const status = await TrackPlayer.getState();
    const currentAudioIndex = this.context.currentAudioIndex;
    //const currentAudioIndex =  JSON.parse(await AsyncStorage.getItem("lastAudioIndex"));

    //const currentAudioIndex = await TrackPlayer.getCurrentTrack();

    if (currentAudioIndex == index && status == "playing") {
      TrackPlayer.pause();
      updateState(this.context, {
        currentAudioIndex: index,
        isPlaying: false,
      });
    } else if (currentAudioIndex == index && status == "paused") {
      TrackPlayer.play();
      updateState(this.context, {
        currentAudioIndex: index,
        isPlaying: true,
      });
    }

    //Şarkıya geç
    else {
      TrackPlayer.skip(index);

      TrackPlayer.play();
      updateState(this.context, {
        currentAudioIndex: index,
        isPlaying: true,
      });
      AsyncStorage.setItem("lastAudioIndex", JSON.stringify(index));
    }

    return;
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
  flatListScrollToIndex = (index) => {
    //this.context?.flatListScrollIndex
    this.flatListRef?.scrollToIndex({
      animated: true,
      index: index,
    });
  };

  componentDidMount = () => {
    //this.props.navigation.setOptions({ orientation: "landscape" });
    //this.changeScreenOrientation();
    this.eventListener();
  };

  eventListener = () => {
    TrackPlayer.addEventListener("playback-track-changed", async () => {
      const songIndex = await TrackPlayer.getCurrentTrack();

      this.flatListScrollToIndex(songIndex);
    });
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
    console.log("-----------INDEX: ", this.context.currentAudioIndex);
    return (
      <>
        <Screen>
          <FlatList
            style={{ paddingTop: 20 }}
            data={this.context.audioFiles}
            keyExtractor={(item, index) => String(index)}
            //initialNumToRender={2}
            //scrollEnabled={this.context.playListCrossChecking ? false : true}
            ref={(ref) => {
              this.flatListRef = ref;
            }}
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
                activeListItem={this.context.activeFlatListIndex === index}
                item={item}
                index={index}
                keyy={index + 1}
                onAudioPress={() => this.handleAudioPress(item, index)}
              />
            )}
          />

          {this.state.flatListScrollDirection == "down" ? (
            <View style={styles.playlistLen}>
              <View style={[styles.playlistLenTextView]}>
                <Text style={styles.playlistLenText}>
                  {this.context?.flatListScrollIndex + 1}
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
