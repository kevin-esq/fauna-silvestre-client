package com.fspclientapp.allfilespermission

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import com.facebook.react.bridge.*

class AllFilesPermissionModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "AllFilesPermission"

  @Deprecated("Overridden for compatibility with React Native 0.74+")
  override fun initialize() {
    super.initialize()
  }

  @ReactMethod
  fun hasAllFilesAccess(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        val granted = Environment.isExternalStorageManager()
        promise.resolve(granted)
      } else {
        promise.resolve(true)
      }
    } catch (e: Exception) {
      promise.reject("ERROR_CHECK", e.message, e)
    }
  }

  @ReactMethod
  fun openAllFilesSettings() {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION)
        intent.data = Uri.parse("package:${reactContext.packageName}")
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactContext.startActivity(intent)
      } else {
        val intent = Intent(Settings.ACTION_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactContext.startActivity(intent)
      }
    } catch (e: Exception) {
      e.printStackTrace()
    }
  }
}
