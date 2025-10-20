package com.fspclientapp

import android.app.Application
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost

// 👇 importa tus paquetes nativos personalizados
import com.fspclientapp.mediastore.MediaStorePackage
import com.fspclientapp.allfilespermission.AllFilesPermissionPackage

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        @Suppress("DEPRECATION")
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              Log.d("MainApplication", "🔧 Registering MediaStorePackage")
              add(MediaStorePackage())

              Log.d("MainApplication", "🔧 Registering AllFilesPermissionPackage")
              add(AllFilesPermissionPackage())
            }

        override fun getJSMainModuleName(): String = "index"
        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)

    try {
      val ai: ApplicationInfo = applicationContext.packageManager
        .getApplicationInfo(packageName, PackageManager.GET_META_DATA)
      val bundle: Bundle = ai.metaData
      val apiKey: String? = bundle.getString("com.google.android.geo.API_KEY")
      Log.d("MAPS_API_KEY", "Google Maps API Key: $apiKey")
    } catch (e: Exception) {
      Log.e("MAPS_API_KEY", "Error obteniendo la API Key", e)
    }
  }
}
