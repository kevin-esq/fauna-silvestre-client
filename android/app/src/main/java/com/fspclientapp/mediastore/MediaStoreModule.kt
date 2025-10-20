package com.fspclientapp.mediastore

import android.content.ContentUris
import android.provider.MediaStore
import android.database.Cursor
import android.os.Build
import android.util.Log
import androidx.exifinterface.media.ExifInterface
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import java.io.File
import java.io.InputStream

@ReactModule(name = MediaStoreModule.NAME)
class MediaStoreModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "MediaStoreModule"
        const val TAG = "MediaStoreModule"
    }

    override fun getName(): String = NAME

    private fun getLatLongFromExif(exif: ExifInterface): Pair<Double, Double>? {
        try {
            val latLong = exif.latLong
            if (latLong != null && latLong.size >= 2) {
                if (latLong[0] != 0.0 || latLong[1] != 0.0) {
                    return Pair(latLong[0], latLong[1])
                }
            }
            val latValue = exif.getAttribute(ExifInterface.TAG_GPS_LATITUDE) ?: return null
            val latRef = exif.getAttribute(ExifInterface.TAG_GPS_LATITUDE_REF) ?: return null
            val lonValue = exif.getAttribute(ExifInterface.TAG_GPS_LONGITUDE) ?: return null
            val lonRef = exif.getAttribute(ExifInterface.TAG_GPS_LONGITUDE_REF) ?: return null
            val latitude = convertToDegree(latValue, latRef)
            val longitude = convertToDegree(lonValue, lonRef)
            if (latitude == 0.0 && longitude == 0.0) return null
            return Pair(latitude, longitude)
        } catch (e: Exception) {
            Log.e(TAG, "Error extracting GPS from EXIF: ${e.message}")
            return null
        }
    }

    private fun convertToDegree(stringDMS: String, ref: String): Double {
        try {
            val dms = stringDMS.split(",").map {
                val parts = it.trim().split("/")
                if (parts.size == 2) {
                    val numerator = parts[0].toDoubleOrNull() ?: 0.0
                    val denominator = parts[1].toDoubleOrNull() ?: 1.0
                    if (denominator != 0.0) numerator / denominator else 0.0
                } else {
                    it.toDoubleOrNull() ?: 0.0
                }
            }
            if (dms.size < 3) return 0.0
            var result = dms[0] + dms[1] / 60.0 + dms[2] / 3600.0
            if (ref.equals("S", ignoreCase = true) || ref.equals("W", ignoreCase = true)) {
                result = -result
            }
            return result
        } catch (e: Exception) {
            Log.e(TAG, "Error converting DMS to degree: ${e.message}")
            return 0.0
        }
    }

    private fun getExifFromUri(uriString: String): ExifInterface? {
        try {
            val uri = android.net.Uri.parse(uriString)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q || uri.scheme == "content") {
                return try {
                    reactApplicationContext.contentResolver.openInputStream(uri)?.use { inputStream ->
                        ExifInterface(inputStream)
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error reading EXIF from content URI: ${e.message}")
                    null
                }
            }

            if (uri.scheme == "file" || uriString.startsWith("/")) {
                val filePath = uri.path ?: uriString
                val file = File(filePath)

                if (file.exists() && file.canRead()) {
                    return try {
                        ExifInterface(file)
                    } catch (e: Exception) {
                        Log.e(TAG, "Error reading EXIF from file: ${e.message}")
                        null
                    }
                }
            }

            if (uri.scheme == "content") {
                val projection = arrayOf(MediaStore.Images.Media.DATA)
                reactApplicationContext.contentResolver.query(uri, projection, null, null, null)?.use { cursor ->
                    if (cursor.moveToFirst()) {
                        val columnIndex = cursor.getColumnIndex(MediaStore.Images.Media.DATA)
                        if (columnIndex >= 0) {
                            val path = cursor.getString(columnIndex)
                            if (!path.isNullOrEmpty()) {
                                val file = File(path)
                                if (file.exists() && file.canRead()) {
                                    return try {
                                        ExifInterface(file)
                                    } catch (e: Exception) {
                                        Log.e(TAG, "Error reading EXIF from queried path: ${e.message}")
                                        null
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return null
        } catch (e: Exception) {
            Log.e(TAG, "Error in getExifFromUri: ${e.message}")
            return null
        }
    }

    @ReactMethod
    fun getImageMetadata(uri: String, promise: Promise) {
        try {
            val exif = getExifFromUri(uri)

            if (exif == null) {
                promise.reject("EXIF_ERROR", "Could not read EXIF from URI: $uri")
                return
            }

            val location = getLatLongFromExif(exif)

            if (location != null) {
                val (latitude, longitude) = location

                val result = Arguments.createMap().apply {
                    putDouble("latitude", latitude)
                    putDouble("longitude", longitude)

                    val altitude = exif.getAltitude(Double.NaN)
                    if (!altitude.isNaN()) {
                        putDouble("altitude", altitude)
                    }

                    val width = exif.getAttributeInt(ExifInterface.TAG_IMAGE_WIDTH, 0)
                    val height = exif.getAttributeInt(ExifInterface.TAG_IMAGE_LENGTH, 0)
                    if (width > 0) putInt("width", width)
                    if (height > 0) putInt("height", height)

                    val orientation = exif.getAttributeInt(
                        ExifInterface.TAG_ORIENTATION,
                        ExifInterface.ORIENTATION_NORMAL
                    )
                    putInt("orientation", orientation)

                    val dateTime = exif.getAttribute(ExifInterface.TAG_DATETIME_ORIGINAL)
                        ?: exif.getAttribute(ExifInterface.TAG_DATETIME_DIGITIZED)
                        ?: exif.getAttribute(ExifInterface.TAG_DATETIME)

                    if (dateTime != null) {
                        try {
                            val sdf = java.text.SimpleDateFormat("yyyy:MM:dd HH:mm:ss", java.util.Locale.US)
                            val date = sdf.parse(dateTime)
                            if (date != null) {
                                putDouble("dateTaken", date.time.toDouble())
                            }
                        } catch (e: Exception) {
                            Log.w(TAG, "Error parsing date: ${e.message}")
                        }
                    }

                    exif.getAttribute(ExifInterface.TAG_MAKE)?.let { putString("cameraMake", it) }
                    exif.getAttribute(ExifInterface.TAG_MODEL)?.let { putString("cameraModel", it) }

                    putString("uri", uri)
                }
                promise.resolve(result)
            } else {
                promise.reject("NO_LOCATION", "Image has no GPS coordinates in EXIF")
            }

        } catch (e: Exception) {
            Log.e(TAG, "Error in getImageMetadata: ${e.message}", e)
            promise.reject("ERROR", "Error reading metadata: ${e.message}", e)
        }
    }

    @ReactMethod
    fun getAllImagesWithLocation(limit: Int, promise: Promise) {
        try {
            val projection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                arrayOf(
                    MediaStore.Images.Media._ID,
                    MediaStore.Images.Media.DISPLAY_NAME,
                    MediaStore.Images.Media.DATE_TAKEN,
                    MediaStore.Images.Media.SIZE,
                    MediaStore.Images.Media.MIME_TYPE
                )
            } else {
                arrayOf(
                    MediaStore.Images.Media._ID,
                    MediaStore.Images.Media.DATA,
                    MediaStore.Images.Media.DISPLAY_NAME,
                    MediaStore.Images.Media.DATE_TAKEN,
                    MediaStore.Images.Media.SIZE,
                    MediaStore.Images.Media.MIME_TYPE
                )
            }

            val selection = "${MediaStore.Images.Media.SIZE} > 0"
            val sortOrder = "${MediaStore.Images.Media.DATE_TAKEN} DESC"

            val cursor = reactApplicationContext.contentResolver.query(
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                projection,
                selection,
                null,
                sortOrder
            )

            val results = Arguments.createArray()
            var found = 0
            var processed = 0
            val maxToProcess = limit * 10

            cursor?.use { c ->
                val idIndex = c.getColumnIndexOrThrow(MediaStore.Images.Media._ID)
                val nameIndex = c.getColumnIndex(MediaStore.Images.Media.DISPLAY_NAME)
                val dateIndex = c.getColumnIndex(MediaStore.Images.Media.DATE_TAKEN)
                val dataIndex = if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                    c.getColumnIndex(MediaStore.Images.Media.DATA)
                } else {
                    -1
                }

                while (c.moveToNext() && found < limit && processed < maxToProcess) {
                    processed++

                    try {
                        val id = c.getLong(idIndex)
                        val contentUri = ContentUris.withAppendedId(
                            MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                            id
                        )

                        val exif = getExifFromUri(contentUri.toString()) 
                            ?: if (dataIndex >= 0) {
                                val filePath = c.getString(dataIndex)
                                if (!filePath.isNullOrEmpty()) {
                                    getExifFromUri("file://$filePath")
                                } else null
                            } else null
                        if (exif != null) {
                            val location = getLatLongFromExif(exif)
                            if (location != null) {
                                val (latitude, longitude) = location
                                val image = Arguments.createMap().apply {
                                    putString("uri", contentUri.toString())
                                    putDouble("latitude", latitude)
                                    putDouble("longitude", longitude)
                                    if (dateIndex >= 0) {
                                        val dateTaken = c.getLong(dateIndex)
                                        if (dateTaken > 0) {
                                            putDouble("dateTaken", dateTaken.toDouble())
                                        }
                                    }
                                    if (nameIndex >= 0) {
                                        c.getString(nameIndex)?.let { putString("filename", it) }
                                    }
                                    putString("id", id.toString())
                                }
                                results.pushMap(image)
                                found++
                            }
                        }
                    } catch (e: Exception) {
                        Log.w(TAG, "Error processing image: ${e.message}")
                        continue
                    }
                }
            }
            Log.i(TAG, "Found $found images with location out of $processed processed")
            promise.resolve(results)
        } catch (e: Exception) {
            Log.e(TAG, "Error in getAllImagesWithLocation: ${e.message}", e)
            promise.reject("ERROR", "Error querying images: ${e.message}", e)
        }
    }

    @ReactMethod
    fun getImageMetadataBatch(uris: ReadableArray, promise: Promise) {
        try {
            val results = Arguments.createArray()
            for (i in 0 until uris.size()) {
                val uri = uris.getString(i) ?: continue
                try {
                    val exif = getExifFromUri(uri)
                    if (exif != null) {
                        val location = getLatLongFromExif(exif)
                        if (location != null) {
                            val (latitude, longitude) = location
                            val metadata = Arguments.createMap().apply {
                                putString("uri", uri)
                                putDouble("latitude", latitude)
                                putDouble("longitude", longitude)
                                val altitude = exif.getAltitude(Double.NaN)
                                if (!altitude.isNaN()) {
                                    putDouble("altitude", altitude)
                                }
                            }
                            results.pushMap(metadata)
                        } else {
                            results.pushNull()
                        }
                    } else {
                        results.pushNull()
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "Error processing URI $uri: ${e.message}")
                    results.pushNull()
                }
            }
            promise.resolve(results)
        } catch (e: Exception) {
            Log.e(TAG, "Error in getImageMetadataBatch: ${e.message}", e)
            promise.reject("ERROR", "Error in batch processing: ${e.message}", e)
        }
    }

    @ReactMethod
    fun clearCache(promise: Promise) {
        promise.resolve(true)
    }
}