# Radiorder Music Player

Readiorder Music Player react native+expo kullanarak Android TV platformunda çalıştırılmak üzere kodlandı.

# Kurulum

Application’ı çalıştırmak için, daha önce bir **nodejs**, **npm**, **expo-cli**, **react-native**, **react-native-cli, appcenter-cli** ve **android emulator**’ün bilgisayarınızda kurulu olduğu varsayımı üzerinden kurulumn nasıl olacağı açıklanacak.

Gerekli kurulumlar hazırsa, `ro-player` klasörüne girin ve npm paketlerini indirin. Aşağıdaki kodları kullanabilirsiniz.

```jsx
cd ro-player
npm install
```

Node paketlerini indirdikten sonra, artık Android Emülator’unu çalıştırıp aşağıdaki `expo-cli`

komutu ile application’ın emulatore aktarabilriz.

```jsx
expo run:android
```

Bu komuttan sonra application kendisini build etmeye başlayacak emülatore APK’yi kurup çalıştıracak. Application’ın .apk’sını `ro-player/android/app/debug` dizininde bulabillirsiniz

# Dosya Tanıtımı

Sistemi oluşturan bütün dosyalar `ro-player/app/` dizinin de yer alıyor.

- 📁 `components`
  Component dosyasında applicationın genelinde kullanılan componentler tutuluyor.
  - 📁 `form` form componentleri
  - AnonModal - Son güncellemeden sonra kullanılmıyor
  - AudioListItem - Flatlist içinde dönen list componenti
  - Debug - [config](http://config.com).js dosyasında DEBUG degişkeni true verildiğinde çalışacak komponen, ekranın sağ üstünde görülür
  - DownloadingGif - şarkılar indirliken ekranın üstünde görülen yeşin alan
  - HeaderRight - Ekranın sağ üst alanı
  - LanguageModal - Application dil değişiimi için kullanılan modal
  - LoadingGif - yükleniyor… componenti
  - noInternetConnection - internet olmadığında çalışan component
  - Screen - Screen componentleri
- 📁 `context`
  Componentler ve screenler arasında playlaşılan bilgilerle bu dizinde yer alıyor
  - AudioProvider.js - Applicationında genelinden kullanılan context. Download işlemini ve player oynatma işlemini yapar
  - newAuthProvider - Kullanıcı giriş çıkışlarını belirler
- 📁 `database`
  Son güncellemeden sonra kullanılmıyor
- 📁 `fonts`
  Son güncellemeden sonra kullanılmıyor
- 📁 `images`
  Son güncellemeden sonra kullanılmıyor
- 📁 `lang`
  Application birden fazla dil desteği sunuyor. `lang` dosyasında dil çevirileri yer alıyor.
- **📁** `misc`
  Yardımcı bazı fonksiyonlar burada
  - color - application’da kullanılan renkleri tutur
  - config - application için gerekli bazı sabitleri tutar
  - helper - bazı yardımcı fonksiyonları tutar
- 📁 `navigation`
  Application içerisinde route’lamayı yapan navigationlar burada
  - AdminNavigation - Artık kullanılmıyor.
  - AppNavigatior - Kullanıcı giriş yaptığında Tab alanı.
  - NavigationStack - Kullanıcı giriş yapmamış ise kullanılan Stack
- 📁 `redux`
  Son güncellemeden sonra kullanılmıyor
- 📁 `screens`
  Application ekran componenti burada
  - Admin - Artık kullanılmıyor
  - Anons.js - Artık kullanılmıyor
  - AudioList - Şarkıların bir flatlistte listelendiği ekran
  - Login - Login Ekranı
  - User - Kullanıcı sayfası

# CodePush ile Güncelleme Yapma

Yeni bir güncelleme yaptıktan sonra, eğer tüm testleriniz tamam ise, bilgisayarınız appcenter-cli kurun ve aşağıdaki komutu terminale yazın.

**Staging**

```jsx
appcenter codepush release-react -a yusufocaliskan/Ro-Player -d Staging
```

Bu komut `Staging` key’ini kullanan tüm .Apk’ları günceller. Testlerinizi önce Staging’de ile oluşturduğunuz bir .pk deneyin ardından `Production`'na çıkın.

**Production**

Production için aşağıdaki komutu kullanın

```jsx
appcenter codepush release-react -a yusufocaliskan/Ro-Player -d Production
```

**Key alma**

Yeni bir key almak için [https://appcenter.ms/](https://appcenter.ms/) sitesine gidip ro-player application’ından solda bölümde yer alan Distribute > CodePush sekmesine gidin. Sağ üstte ayarlar kısmında key’ üretin.

**Key değişimi**

Staging ve Production arasında değişim için `ro-player/android/app/src/main/res/values/string.xml` dosyasında aşağıdaki `key` değiştirebilrsiniz

```jsx
<string moduleConfig="true" name="CodePushDeploymentKey">
  k3ti1l1QSug04Cv-EJc5chfypRPxED_BI_9dn
</string>
```
