import React, { useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Camera } from "react-native-vision-camera";
import { useCameraDevices } from "react-native-vision-camera";
import { useCamera } from "../../hooks/use-camera.hook";
import { useRecentImages } from "../../hooks/use-recent-images.hook";
import { TopControls } from "../../components/camera/top-controls.component";
import { CaptureButton } from "../../components/camera/capture-button.component";
import { GalleryButton } from "../../components/camera/gallery-button.component";
import { ThumbnailList } from "../../components/camera/thumbnail-list.component";
import { LocationService } from "../../../services/location/location.service";
import { Modalize } from "react-native-modalize";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import CustomImagePickerScreen from "./custom-image-picker-screen";
import {useLoading} from "../../contexts/loading-context";


const { width } = Dimensions.get("window");

type StackParamList = {
  ImagePreview: { imageUri: string; location?: any };
  CustomImagePickerScreen: undefined;
};

export const CameraGalleryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();
  const devices = useCameraDevices();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { showLoading, hideLoading } = useLoading();

  const {
    cameraRef,
    isCapturing,
    position,
    flashMode,
    takePhoto,
    toggleFlashMode,
    flipCamera,
    cancelCapture,
  } = useCamera();

  const { openUri } = require("../../hooks/use-gallery.hook").useGallery();
  const recentImages = useRecentImages();

  const galleryModalRef = useRef<Modalize>(null);

  const device = devices[position];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (isCapturing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isCapturing, pulseAnim]);

  const handleCapture = async () => {
    showLoading();
    try {
      const uri = await takePhoto();
      const location = await LocationService.getCurrentCoords();
      hideLoading();
      navigation.navigate("ImagePreview", { imageUri: uri, location });
    } catch {
      cancelCapture();
      hideLoading();
    }
  };

  const handleOpenGallery = () => galleryModalRef.current?.open();
  const handleConfirm = (uri: string) => {
    galleryModalRef.current?.close();
    navigation.navigate("ImagePreview", { imageUri: uri });
  };
  const handleCancel = () => galleryModalRef.current?.close();

  if (!device) return <Loading />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <Animated.View style={[styles.full, { opacity: fadeAnim }]}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo
          enableZoomGesture={true}
        />

        {/* Controles arriba */}
        <TopControls
          onBack={() => navigation.goBack()}
          onToggleFlash={toggleFlashMode}
          onFlip={flipCamera}
          flashMode={flashMode}
          showFlash={position === 0}
          style={{ marginTop: insets.top }}
        />

        {/* Controles abajo */}
        <View
          style={[
            styles.bottomControls,
            { paddingBottom: insets.bottom + 10 },
          ]}>
          <GalleryButton onPress={handleOpenGallery} />

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <CaptureButton onPress={handleCapture} isActive={isCapturing} />
          </Animated.View>
        </View>

        {/* Miniaturas recientes */}
        {recentImages.length > 0 && (
          <View
            style={[
              styles.thumbnailContainer,
              {
                bottom: insets.bottom + 120,
                height: width * 0.2 + 30,
              },
            ]}>
            <ThumbnailList uris={recentImages} onSelect={openUri} />
          </View>
        )}
      </Animated.View>
      <Modalize
        ref={galleryModalRef}
        adjustToContentHeight={false}
        modalHeight={Dimensions.get("window").height * 0.8}
        scrollViewProps={{
          scrollEnabled: true,
          nestedScrollEnabled: true,
        }}
        panGestureEnabled={true}
        withOverlay={true}
        handlePosition="inside"
        childrenStyle={{ flex: 1 }}>
        <CustomImagePickerScreen
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </Modalize>
    </SafeAreaView>
  );
};

const Loading = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#ffffff" />
    <Text style={styles.loadingText}>Cargando cámara...</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "black",
  },
  full: {
    flex: 1,
    backgroundColor: "black",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "white",
  },
  bottomControls: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  thumbnailContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
