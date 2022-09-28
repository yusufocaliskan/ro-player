import AsyncStorage from "@react-native-async-storage/async-storage";

//Application ilk açıldığında son çalınan şarkıyı
//Yeniden seçmek için kullanılır.
export const storeAudioForNextOpening = async (audio, index) => {
  await AsyncStorage.setItem("previousAudio", JSON.stringify({ audio, index }));
};

export const getCurrentDate = (customDate, separator = "-") => {
  let newDate = new Date();
  if (customDate) {
    newDate = customDate;
  }
  let date_raw = newDate.getDate();
  let month_raw = newDate.getMonth() + 1;
  if (!customDate) {
    month_raw = newDate.getMonth() + 1;
  }
  let year = newDate.getFullYear();
  var date, month;

  if (date_raw < 10) {
    date = "0" + date_raw.toString();
  } else {
    date = date_raw.toString();
  }
  if (month_raw < 10) {
    month = "0" + month_raw.toString();
  } else {
    month = month_raw.toString();
  }

  return `${year}${separator}${month}${separator}${date}`;
};

//Karıştır
export const shuffleArray = (array) => {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

export const devideEqualParts = (num, parts) => {
  return [...Array(parts)].map((_, i) => 0 | (num / parts + (i < num % parts)));
};

export const convertTime = (minutes) => {
  if (minutes) {
    const hrs = minutes / 60;
    const minute = hrs.toString().split(".")[0];
    const percent = parseInt(hrs.toString().split(".")[1].slice(0, 2));
    const sec = Math.ceil((60 * percent) / 100);

    if (parseInt(minute) < 10 && sec < 10) {
      return `0${minute}:0${sec}`;
    }

    if (parseInt(minute) < 10) {
      return `0${minute}:${sec}`;
    }
    return `${minute}:${sec}`;
  }
};

/**
 * Obje içindeki element durationları toplar.
 * @param {object} songs duration key'i olan bir obje
 * @returns
 */
export const calculateTotalSongDurration = (songs) => {
  let duration = 0;
  for (let i = 0; i < songs?.length; i++) {
    duration += parseInt(songs[i]?.durationMillis);
  }
  return duration;
};

/**
 * Saniye yi millisaniye çevirir
 * @param {int} second saniye
 * @returns int
 */
export const convertSecondToMillisecond = (second) => {
  return second * 1000;
};
export const converMinutesToMilliseconds = (min) => {
  return min * 60 * 1000;
};

export const convertHourToMilliseconds = (hr) => {
  return hr * 60 * 1000;
};
//Arayde var mı?
export const issetInArray = (array, data) => {
  if (array.length == 0) return true;

  if (array.length != 0) {
    for (let i = 0; i < array.length; i++) {
      if (parseInt(array[i]) === data) {
        return true;
      }
    }
  }
};

//Dosya isimlerini içindeki . (nokta)ları temizler.
export const clearFileName = (FileName) => {
  if (FileName !== undefined) {
    const extension = FileName.split(".").pop();
    const name = FileName.split(".").join("-");
    const soundName = `${name}.${extension}`;
    return soundName;
  }
};

export const howManyTimeSingToday = (AnonsRepeats, AnonsId) => {
  if (AnonsRepeats.length != 0) {
    for (let i = 0; i < AnonsRepeats.length; i++) {
      if (AnonsRepeats[i].AnonsId == AnonsId) {
        return AnonsRepeats[i].Repeats;
      }
    }
  }
};

//Anons çalma sayısını günceller.
export const updateAnonsSingRepeatTimes = async (AnonsId, repeat) => {
  const AnonsRepeats = JSON.parse(await AsyncStorage.getItem("AnonsRepeats"));

  const newAnonsUpdate = [];
  for (let i = 0; i < AnonsRepeats.length; i++) {
    if (AnonsRepeats[i].AnonsId) {
      delete AnonsRepeats[i];
      newAnonsUpdate.push({
        AnonsId: AnonsId,
        Repeats: AnonsRepeats[i].Repeats + 1,
      });
    }
  }

  //Update New vallue.
  AnonsRepeats.push(newAnonsUpdate);
  await AsyncStorage.setItem(
    "AnonsRepeats",
    JSON.stringify(AnonsRepeats.push(newAnonsUpdate))
  );
};

export const setAnonsRepeatTimes = async (AnonsId, repeat) => {
  const AnonsRepeats = JSON.parse(await AsyncStorage.getItem("AnonsRepeats"));

  //console.log(AnonsRepeats);

  if (AnonsRepeats.length == 0) {
    const AnonsRepeats = [];
    AnonsRepeats.push({ AnonsId: AnonsId, repeat });
    await AsyncStorage.setItem("AnonsRepeats", JSON.stringify(AnonsRepeats));
  } else {
    updateAnonsSingRepeatTimes(AnonsId, repeat);
  }

  //Update
};

export const getTheTime = () => {
  const time = `${getCurrentDate(new Date())}T${new Date().toLocaleTimeString({
    hour12: false,
    hour: "2-digit",
    timeZone: "Europe/Istanbul",
  })}`;

  return time;
};
//İlki saat arasındaki farkı bul
export const getDifferenceBetweenTwoHours = (time1, time2) => {
  return Math.abs(time1 - time2);
};

export const whatIsTheDate = () => {
  return `${new Date().toLocaleDateString()}T${new Date().toLocaleTimeString()}`;
};

export const whatIsTheTime = () => {
  return `${new Date().toLocaleTimeString()}`;
};

export const getHoursAndMinutes = ({ date }) => {
  const customDate = new Date(date);
  const hours = customDate.getHours();
  const minutes = customDate.getMinutes();
  return `${hours}:${minutes}`;
};
