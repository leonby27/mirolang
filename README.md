# MiroLang

React Native приложение для изучения английских слов через интервальное повторение.

- **iOS bundle ID:** `ru.mirolang`
- **Android applicationId:** `ru.mirolang`
- **RN:** 0.74.1 (bare workflow)
- **Hermes:** enabled
- **Firebase:** `@react-native-firebase/*` (Auth + Firestore + Analytics + Crashlytics + Functions)
- **IAP:** `react-native-iap` v12

## Setup

```bash
npm install --legacy-peer-deps
cd ios && pod install && cd ..
```

### Required external assets (NOT in repo)

| Path | Источник | Зачем |
|------|----------|-------|
| `ios/GoogleService-Info.plist` | Firebase Console → iOS app | Firebase iOS клиент |
| `android/app/google-services.json` | Firebase Console → Android app | Firebase Android клиент (есть в репо, но добавить release SHA-1) |
| `android/app/release.keystore` | сгенерировать локально keytool | Подпись Play release |
| `android/key.properties` | пароли от keystore | Подгружается gradle |

## Run

### iOS

```bash
npx react-native run-ios --simulator "iPhone 17 Pro"
```

### Android

```bash
npx react-native run-android
```

### Metro standalone

```bash
npx react-native start --reset-cache
```

## Firebase / IAP backend setup

### 1. Firestore rules

```bash
firebase deploy --only firestore:rules
```

Rules в `firestore.rules` запрещают клиенту записывать `user.pro` — только Cloud Function.

### 2. Cloud Function для верификации покупок

```bash
cd cloud-functions
npm install firebase-admin firebase-functions
firebase deploy --only functions:verifyPurchase
```

Stub в `cloud-functions/verifyPurchase.ts` — нужно вставить реальную верификацию через Apple App Store Server API / Google Play Developer API.

### 3. App Store Connect / Google Play Console

Создать подписки с product IDs:
- `mirolang_pro_monthly`
- `mirolang_pro_yearly`

## Architecture

- `App.js` — корневой `NavigationContainer` + `BottomSheetModalProvider` + `GestureHandlerRootView`.
- `screens/` — 12 экранов
  - `LevelsMain` — Уровни tab (showOnboarding через AsyncStorage)
  - `Prestart` — настройки уровня + список слов + BottomSheet с фильтрами
  - `Learn` — карточки (react-native-deck-swiper) + spaced repetition
  - `Overview` — карусель для пропущенных/выученных (reanimated-carousel)
  - `HistoryMain` / `HistoryScreen` — История tab
  - `AccountMain` / `AccountSettings` / `Login` — Аккаунт tab
  - `MirolangPro` — paywall upsell (открывает ProVersion модал)
  - `Support` — Email / Site
  - `Swiper` — onboarding (react-native-swiper)
- `src/data.js` — словарь (~6500 слов в 25 уровнях)
- `src/components/iap.js` — IAP helper (init, products, purchase, restore)
- `src/components/ProVersion.js` — UI модал с подписками + Subscription disclosure + Restore Purchases
- `src/components/firebaseconfig.js` — удалён
- `cloud-functions/verifyPurchase.ts` — stub серверной верификации

## Spaced-repetition статусы

- 0 / undefined — новое
- 1 — «учу» (показываем сейчас)
- 2 — следующий показ через 5 мин
- 3 — через 30 мин
- 4 — через 1 день
- 5 — через 7 дней
- 6 — выучено
- 7 — пропущено пользователем (исключено из деки)

Свайп влево = «Вспомнил» → `status + 1`.
Свайп вправо = «Забыл» → `status - 1` (min 1, status≥6 сбрасывается в 1).
Свайп вниз = `status: 0` (reset).
Свайп вверх = `status: 6` (Знаю).

## Pro

- Лимит 10 новых слов в день для free.
- Доступ ко всем уровням сразу.
- Без рекламы.

## Что доделать (production-readiness)

1. Реальный `GoogleService-Info.plist` (сейчас placeholder).
2. Release SHA-1 в Firebase Console.
3. `android/app/release.keystore` + поднять `signingConfig signingConfigs.release` в `android/app/build.gradle`.
4. Включить ProGuard: `enableProguardInReleaseBuilds = true`.
5. Создать subscription продукты в ASC / Play Console.
6. Имплементировать `cloud-functions/verifyPurchase.ts` (stub).
7. Развернуть `firestore.rules`.
8. Native splash setup для Android (`launch_screen.xml` + `SplashScreen.show()` в MainActivity).
9. Adaptive icon для Android (через Android Studio Asset Studio).
10. App Store Connect / Play Console: screenshots, описание, privacy URL.
