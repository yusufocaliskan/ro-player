//Play#1
import RNFetchBlob from "rn-fetch-blob";

//Şarkıyı başlatmak için kullanılır
export const play = async (playbackObj, uri) => {
  try {
    //İlk durur
    //stop(playbackObj);
    const isExist = await RNFetchBlob.fs.exists(uri);
    console.log("URI:", uri);
    console.log("File Exists: ", isExist);

    //if (playbackObj._loaded === true) return resume(playbackObj);
    return await playbackObj.loadAsync({ uri }, { shouldPlay: true });
  } catch (error) {
    console.log("Hata!", error.message);
  }
};

//Şarkıyı durudur..
export const stop = async (playbackObj) => {
  try {
    return await playbackObj.stopAsync({
      shouldPlay: false,
      positionMillis: false,
    });
  } catch (error) {
    console.log("Hata!", error.message);
  }
};

//Pause#2
//Şarkıyı durdurmak için kullanırılır
export const pause = async (playbackObj) => {
  try {
    console.log("Paused");
    return await playbackObj.setStatusAsync({
      shouldPlay: false,
    });
  } catch (error) {
    console.log("Hata: Şarkı durdurulamadı.", error.message);
  }
};

//Resum#3
//Durdurulmuş şarkıyı yeniden başlatmak için kullanırılır
export const resume = async (playbackObj) => {
  try {
    console.log("Resumed");
    return await playbackObj.playAsync();
  } catch (error) {
    console.log("Hata! Şarkı durdurulamadı.", error.message);
  }
};

//Başka bir şarkıya geç

//Next: Başka bir şarkıya geç
export const playNext = async (playbackObj, uri) => {
  try {
    await playbackObj.stopAsync();
    await playbackObj.unloadAsync();
    return await play(playbackObj, uri);
  } catch (error) {
    console.log("Hata: Başka bir şarkıya geçilemedi.");
  }
};
