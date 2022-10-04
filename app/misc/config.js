const configs = {
  //Application versionu
  //Burada belirt.
  VERSION: "v3.2",

  //Sertifika bilgileri
  SER_USERNAME: "radiorder",
  SER_PASSWORD: "1@K_#$159X!",

  //Application Adminn girişi..
  ADMIN_INFO: {
    ADMIN_USERNAME: "radiorder",
    ADMIN_PASSWORD: "2121",
    ADMIN_FULLNAME: "Radio Order",
  },

  /// 10 şarkıda bir tane anons ya. : defalt değer,
  //Daha sonra veritabanından kendini çekiyor
  HERGUN_TEKRARLI_ANONS: 63,

  //Her 20 şarkıda bir : Default değer
  //Daha sonra veritabanından kendini çekiyor
  BELIRGUN_TEKRARLI_ANONS: 54,

  //Debug penceresi.
  //Sağ üstte görünür.
  DEBUG: false,

  //Application başlatıldığında müsic çalsın.
  //PLAY_ON_LOAD: true,

  //Servera gitme saati
  //saniye cinsinden
  TIME_OF_GETTING_SONGS_FROM_SERVER: 60 * 60, //1 saat

  //Servera indirilmiş olan şarkıların yeniden
  ANONS_FILTERING_CACHE_TIME: 1, //

  //PLAY_ANONS_TIME
  //saniye cinsinden
  PLAY_ANONS_TIME: 10,

  //SOAP QUERY
  SOAP_URL: "https://www.radiorder.online/ws/radi.asmx",

  //Login Token
  LOGIN_TOKEN: "!!+234lmfdlkmdfm23ş5+^&^+TERFew'4ewfdsf",
};

export default configs;
