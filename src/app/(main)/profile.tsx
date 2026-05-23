import React, { useState, useEffect, useRef } from "react";
import {
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

interface CustomRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const getLeafletHtml = (lat: number, lng: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; }
    #map { height: 100vh; width: 100vw; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([${lat}, ${lng}], 15);

    L.tileLayer('https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // Communicate map movements back to React Native
    map.on('moveend', function() {
      var center = map.getCenter();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        latitude: center.lat,
        longitude: center.lng
      }));
    });

    // Listen for center messages from React Native
    window.addEventListener('message', function(event) {
      try {
        var data = JSON.parse(event.data);
        if (data.type === 'center') {
          map.setView([data.latitude, data.longitude], 15);
        }
      } catch (e) {}
    });
  </script>
</body>
</html>
`;

import { ThemedText } from "@/components/themed-text";
import { Spacing, AppColors } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { useAlert } from "@/context/AlertContext";
import { getCurrentUser, signOutUser } from "@/services/authService";
import { updateProfile } from "@react-native-firebase/auth";
import { getUserProfile, saveUserProfile, getUserOrderCount } from "@/services/userService";
import { profileStyles as styles } from "@/styles/profile.styles";

const C = AppColors;

export default function ProfileScreen() {
  const user = getCurrentUser();
  const { cartCount } = useCart();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const [points, setPoints] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");

  // Map Picker states & refs
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState<CustomRegion | null>(null);
  const [initialCoords, setInitialCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapAddress, setMapAddress] = useState("");
  const [mapCity, setMapCity] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const mapViewRef = useRef<WebView>(null);

  const handleCloseMap = () => {
    setIsMapVisible(false);
    setInitialCoords(null);
  };

  const handleMapMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.latitude && data.longitude) {
        setMapRegion({
          latitude: data.latitude,
          longitude: data.longitude,
          latitudeDelta: 0.00922,
          longitudeDelta: 0.00421,
        });
        geocodeCoordinates(data.latitude, data.longitude);
      }
    } catch (e) {
      console.error("Error parsing message from webview:", e);
    }
  };

  const handleOpenMapPicker = async () => {
    setIsMapVisible(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showAlert({
          title: "تنبيه",
          message: "يرجى تفعيل صلاحية الوصول للموقع الجغرافي لتحديد عنوان التوصيل.",
          type: "warning",
        });
        return;
      }
      
      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const initCoords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setInitialCoords(initCoords);
      setMapRegion({
        ...initCoords,
        latitudeDelta: 0.00922,
        longitudeDelta: 0.00421,
      });
      geocodeCoordinates(loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const geocodeCoordinates = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const response = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (response && response.length > 0) {
        const item = response[0];
        const street = item.street || item.name || "";
        const district = item.district || "";
        const cityName = item.city || item.subregion || "";
        
        const formattedAddress = [street, district].filter(Boolean).join(" - ");
        setMapAddress(formattedAddress || "موقع محدد على الخريطة");
        setMapCity(cityName || "الخرطوم");
      } else {
        setMapAddress("موقع غير معروف");
      }
    } catch (error) {
      setMapAddress("فشل تحديد العنوان الجغرافي");
    } finally {
      setIsGeocoding(false);
    }
  };

  // Map moves are handled via handleMapMessage from the WebView

  const handleCenterOnUser = async () => {
    try {
      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      mapViewRef.current?.postMessage(
        JSON.stringify({
          type: "center",
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        })
      );
    } catch (error) {
      console.error("Error centering map:", error);
    }
  };

  const handleConfirmLocation = () => {
    if (mapAddress) {
      setAddress(mapAddress);
    }
    if (mapCity) {
      setCity(mapCity);
    }
    setIsMapVisible(false);
    setInitialCoords(null);
  };

  // Load profile data
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const key = user.email || user.uid;

    setName(user.displayName || "");

    getUserProfile(key)
      .then((profile) => {
        if (profile) {
          setPoints(profile.points || 0);
          if (profile.shippingInfo) {
            setPhone(profile.shippingInfo.phone || "");
            setAddress(profile.shippingInfo.address || "");
            setCity(profile.shippingInfo.city || "");
            setZip(profile.shippingInfo.zip || "");
          }
          if (profile.displayName) {
            setName(profile.displayName);
          }
        }
      })
      .catch((e) => console.error("Error fetching profile:", e))
      .finally(() => setLoading(false));

    getUserOrderCount(user.email!)
      .then(setTotalOrders)
      .catch((e) => console.error("Error counting orders:", e));
  }, [user]);

  const handleSaveChanges = async () => {
    if (!user) return;
    if (!name.trim()) {
      showAlert({
        title: "تنبيه",
        message: "يرجى إدخال الاسم بالكامل.",
        type: "warning",
      });
      return;
    }
    setSaving(true);
    try {
      // 1. Update Firebase Auth Profile
      await updateProfile(user, {
        displayName: name.trim(),
      });

      // 2. Save user profile document in Firestore
      await saveUserProfile(user.email || user.uid, {
        displayName: name.trim(),
        shippingInfo: {
          address: address.trim(),
          city: city.trim(),
          zip: zip.trim(),
          phone: phone.trim(),
        },
      });

      showAlert({
        title: "نجاح",
        message: "تم حفظ البيانات بنجاح.",
        type: "success",
      });
      setIsEditModalVisible(false);
    } catch (error: any) {
      console.error("Error saving user details:", error);
      showAlert({
        title: "خطأ",
        message: "فشل حفظ البيانات. يرجى المحاولة لاحقاً.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    showAlert({
      title: "تسجيل الخروج",
      message: "هل أنت متأكد من رغبتك في تسجيل الخروج؟",
      type: "confirm",
      buttons: [
        { text: "إلغاء", style: "cancel" },
        { text: "تسجيل الخروج", style: "destructive", onPress: () => signOutUser() },
      ],
    });
  };

  return (
    <View style={styles.container}>
      {!user ? (
        <View style={[styles.mainContent, styles.centered]}>
          <ThemedText style={{ color: C.textMuted }}>الرجاء تسجيل الدخول لعرض الملف الشخصي.</ThemedText>
        </View>
      ) : (
        <View style={styles.mainContent}>


          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Bio Card */}
            <View style={styles.bioCard}>
              <TouchableOpacity style={styles.avatarContainer} onPress={() => setIsEditModalVisible(true)}>
                {user.photoURL ? (
                  <Image source={{ uri: user.photoURL }} style={styles.avatar} contentFit="cover" />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <ThemedText style={styles.avatarInitial}>
                      {name ? name[0].toUpperCase() : (user.displayName ? user.displayName[0].toUpperCase() : "U")}
                    </ThemedText>
                  </View>
                )}
                <View style={styles.cogContainer}>
                  <Feather name="settings" size={12} color={C.white} />
                </View>
              </TouchableOpacity>
              
              <ThemedText style={styles.userName}>{name || user.displayName || "عميلنا المميز"}</ThemedText>
              <ThemedText style={styles.userEmail}>{(user.email || "").toUpperCase()}</ThemedText>

              <TouchableOpacity style={styles.logoutBtnCard} onPress={handleSignOut}>
                <Feather name="log-out" size={16} color={C.textDark} />
                <ThemedText style={styles.logoutBtnText}>تسجيل الخروج</ThemedText>
              </TouchableOpacity>
            </View>

            {/* 2x2 Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.gridRow}>
                {/* 1. Orders */}
                <View style={styles.gridBox}>
                  <View style={[styles.gridIconContainer, { backgroundColor: "rgba(245, 158, 11, 0.08)" }]}>
                    <Feather name="package" size={18} color="#F59E0B" />
                  </View>
                  <ThemedText style={styles.gridNumber}>{totalOrders}</ThemedText>
                  <ThemedText style={styles.gridLabel}>الطلبات</ThemedText>
                </View>

                {/* 2. Favorites */}
                <View style={styles.gridBox}>
                  <View style={[styles.gridIconContainer, { backgroundColor: "rgba(239, 68, 68, 0.08)" }]}>
                    <Feather name="heart" size={18} color="#EF4444" />
                  </View>
                  <ThemedText style={styles.gridNumber}>00</ThemedText>
                  <ThemedText style={styles.gridLabel}>المفضلة</ThemedText>
                </View>
              </View>

              <View style={styles.gridRow}>
                {/* 3. Cart */}
                <View style={styles.gridBox}>
                  <View style={[styles.gridIconContainer, { backgroundColor: "rgba(59, 130, 246, 0.08)" }]}>
                    <Feather name="shopping-bag" size={18} color="#3B82F6" />
                  </View>
                  <ThemedText style={styles.gridNumber}>
                    {cartCount.toString().padStart(2, "0")}
                  </ThemedText>
                  <ThemedText style={styles.gridLabel}>السلة</ThemedText>
                </View>

                {/* 4. Points */}
                <View style={styles.gridBox}>
                  <View style={[styles.gridIconContainer, { backgroundColor: "rgba(16, 185, 129, 0.08)" }]}>
                    <Feather name="zap" size={18} color="#10B981" />
                  </View>
                  <ThemedText style={styles.gridNumber}>{points.toFixed(1)}</ThemedText>
                  <ThemedText style={styles.gridLabel}>النقاط</ThemedText>
                </View>
              </View>
            </View>

            {/* Primary Address Card */}
            <View style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <ThemedText style={styles.addressTitle}>العنوان الرئيسي</ThemedText>
                <TouchableOpacity style={styles.addressEditBtn} onPress={() => setIsEditModalVisible(true)}>
                  <Feather name="edit-2" size={14} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.addressBody}>
                <View style={styles.addressPinContainer}>
                  <Feather name="map-pin" size={20} color="#3B82F6" />
                </View>
                <View style={styles.addressTextContainer}>
                  <ThemedText style={styles.addressMainText} numberOfLines={2}>
                    {address || "لم يتم تحديد عنوان التوصيل بعد"}
                  </ThemedText>
                  <ThemedText style={styles.addressSubText}>
                    {city || zip ? `${city}، ${zip}` : "يرجى تعديل الملف الشخصي لإضافة تفاصيل العنوان"}
                  </ThemedText>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>تعديل البيانات الشخصية</ThemedText>
            
            <View style={styles.form}>
              <ThemedText style={styles.label}>الاسم الكامل</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="أدخل الاسم الكامل..."
                placeholderTextColor={C.textMuted}
                value={name}
                onChangeText={setName}
              />

              <ThemedText style={styles.label}>رقم التواصل</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="أدخل رقم الهاتف..."
                placeholderTextColor={C.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <ThemedText style={styles.label}>عنوان الشارع</ThemedText>
              <View style={styles.addressInputRow}>
                <TextInput
                  style={[styles.input, styles.addressInput]}
                  placeholder="اسم الشارع والحي ورقم المنزل..."
                  placeholderTextColor={C.textMuted}
                  value={address}
                  onChangeText={setAddress}
                />
                <TouchableOpacity style={styles.mapPickerBtn} onPress={handleOpenMapPicker}>
                  <Feather name="map-pin" size={20} color={C.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.label}>المدينة</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="المدينة..."
                    placeholderTextColor={C.textMuted}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.label}>الرمز البريدي</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="الرمز البريدي..."
                    placeholderTextColor={C.textMuted}
                    value={zip}
                    onChangeText={setZip}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.modalSaveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSaveChanges}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={C.white} />
                ) : (
                  <ThemedText style={styles.modalSaveBtnText}>حفظ التغييرات</ThemedText>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditModalVisible(false)}
                disabled={saving}
              >
                <ThemedText style={styles.modalCancelBtnText}>إلغاء</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Map Location Picker Modal */}
      <Modal visible={isMapVisible} animationType="slide" onRequestClose={handleCloseMap}>
        <SafeAreaView style={styles.modalContainer} edges={["top", "bottom"]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.closeBtn} onPress={handleCloseMap}>
              <Feather name="x" size={24} color={C.textDark} />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>تحديد موقع التوصيل</ThemedText>
            <View style={{ width: 32 }} />
          </View>
          
          <View style={styles.mapWrapper}>
            {initialCoords && (
              <WebView
                ref={mapViewRef}
                style={styles.mapView}
                source={{ html: getLeafletHtml(initialCoords.latitude, initialCoords.longitude) }}
                onMessage={handleMapMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scalesPageToFit={true}
              />
            )}
            
            {/* Centered pinpoint marker */}
            <View style={styles.markerFixed} pointerEvents="none">
              <Feather name="map-pin" size={40} color={C.primary} />
            </View>

            {/* GPS Locate Button */}
            <TouchableOpacity style={styles.gpsBtn} onPress={handleCenterOnUser}>
              <Feather name="crosshair" size={24} color={C.textDark} />
            </TouchableOpacity>

            {/* Address Overlay Card */}
            <View style={styles.mapOverlayCard}>
              <ThemedText style={styles.mapOverlayTitle}>موقع التوصيل المحدد</ThemedText>
              {isGeocoding ? (
                <ActivityIndicator size="small" color={C.primary} style={{ marginVertical: Spacing.one }} />
              ) : (
                <ThemedText style={styles.mapOverlayAddress}>{mapAddress || "يرجى تحريك الخريطة لتحديد الموقع..."}</ThemedText>
              )}
              
              <TouchableOpacity style={styles.mapConfirmBtn} onPress={handleConfirmLocation} disabled={isGeocoding}>
                <ThemedText style={styles.mapConfirmText}>تأكيد هذا العنوان</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
