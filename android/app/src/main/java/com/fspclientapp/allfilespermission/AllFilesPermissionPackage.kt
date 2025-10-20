package com.fspclientapp.allfilespermission

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class AllFilesPermissionPackage : ReactPackage {
  @Deprecated("Required for backward compatibility")
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(AllFilesPermissionModule(reactContext))
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return emptyList()
  }
}
