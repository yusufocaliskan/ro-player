export const songShema = {};

//Anons Şeması
export const AnonsDocs = {
  name: "AnonsDocs",
  properties: {
    _id: "objectId",
    repeats: "int",
    anonsId: "int",
    anonsName: "string",
    repeatDate: "mixed",
    date: "mixed",
    anonsType: "string",
  },
};

export const AppSettings = {
  name: "AppSettings",
  properties: {
    AudioFilePermission: "mixed",
    pageNo: "mixed",
    ListenedSongCount: "mixed",
  },
};
export const AdminSettings = {
  name: "AdminSettings",
  properties: {
    weeklyAnons: "mixed",
    certainAnons: "mixed",
  },
};

export const ListenedSongShema = {
  name: "ListenedSongs",
  properties: {
    count: "mixed",
    date: "mixed",
  },
};

export const AnonsShema = {
  name: "Anons",
  properties: {
    Ismi: "mixed",
    Id: "mixed",
    AnonsType: "mixed",
  },
};
