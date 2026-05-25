# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.hermes.reactexecutor.** { *; }

# Firebase (react-native-firebase + Firebase SDK)
-keep class io.invertase.firebase.** { *; }
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# Reanimated 3
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# react-native-svg
-keep class com.horcrux.svg.** { *; }

# react-native-gesture-handler / deck-swiper
-keep class com.swmansion.gesturehandler.** { *; }

# react-native-sound
-keep class com.zmxv.RNSound.** { *; }

# react-native-tts
-keep class net.no_mad.tts.** { *; }

# Google Sign-In
-keep class com.google.android.gms.auth.api.signin.** { *; }
-keep class com.reactnativegooglesignin.** { *; }

# Apple Sign-In (Invertase)
-keep class com.RNAppleAuthentication.** { *; }

# react-native-iap (Google Play Billing)
-keep class com.dooboolab.RNIap.** { *; }
-keep class com.android.billingclient.** { *; }

# Keep all annotations / line info for crash reports
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes SourceFile,LineNumberTable
