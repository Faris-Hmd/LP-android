import React, { useState, useEffect, useRef } from "react";
import {
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Clipboard,
  Modal,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInRight, FadeOutLeft, LinearTransition } from "react-native-reanimated";
import MapView, { Region, UrlTile } from "react-native-maps";
import * as Location from "expo-location";

import { ThemedText } from "@/components/themed-text";
import { Spacing, AppColors } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { getCurrentUser } from "@/services/authService";
import { getUserProfile } from "@/services/userService";
import { submitOrder, saveUserShippingOnOrder } from "@/services/orderService";
import { cartStyles as styles } from "@/styles/cart.styles";
import { PaymentMethod, ShippingInfo } from "@/types";

const C = AppColors;

const BANKAK_ACCOUNT = "3052845";
const MYCASHI_ACCOUNT = "0960504030";

export default function CartScreen() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
  const user = getCurrentUser();

  const [showCheckout, setShowCheckout] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bankak");
  const [transactionRef, setTransactionRef] = useState("");

  const [isMapVisible, setIsMapVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [mapAddress, setMapAddress] = useState("");
  const [mapCity, setMapCity] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const mapViewRef = useRef<MapView>(null);

  const handleOpenMapPicker = async () => {
    setIsMapVisible(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("تنبيه", "يرجى تفعيل صلاحية الوصول للموقع الجغرافي لتحديد عنوان التوصيل.");
        return;
      }
      
      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const initialRegion: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.00922,
        longitudeDelta: 0.00421,
      };

      setMapRegion(initialRegion);
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

  const handleRegionChangeComplete = (newRegion: Region) => {
    setMapRegion(newRegion);
    geocodeCoordinates(newRegion.latitude, newRegion.longitude);
  };

  const handleCenterOnUser = async () => {
    try {
      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      mapViewRef.current?.animateToRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.00922,
        longitudeDelta: 0.00421,
      });
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
  };

  // Load user shipping details
  useEffect(() => {
    if (!user) return;
    setLoadingUser(true);
    const key = user.email || user.uid;
    getUserProfile(key)
      .then((profile) => {
        if (profile?.shippingInfo) {
          setPhone(profile.shippingInfo.phone || "");
          setAddress(profile.shippingInfo.address || "");
          setCity(profile.shippingInfo.city || "");
          setZip(profile.shippingInfo.zip || "");
        }
      })
      .catch((e) => console.error("Error reading user details:", e))
      .finally(() => setLoadingUser(false));
  }, [user]);

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert("نسخ", `تم نسخ ${label} بنجاح: ${text}`);
  };

  const handleCheckout = async () => {
    if (!user) { Alert.alert("تنبيه", "يرجى تسجيل الدخول أولاً."); return; }
    if (cart.length === 0) { Alert.alert("تنبيه", "سلة المشتريات فارغة."); return; }
    if (!address.trim() || !city.trim() || !phone.trim()) {
      Alert.alert("تنبيه", "يرجى تعبئة الحقول الأساسية: العنوان، المدينة، ورقم الهاتف.");
      return;
    }
    if (paymentMethod !== "stripe" && !transactionRef.trim()) {
      Alert.alert("تنبيه", "يرجى إدخال رقم المعاملة المرجعي لتأكيد الدفع.");
      return;
    }

    setIsSubmitting(true);
    try {
      const shipping: ShippingInfo = {
        address: address.trim(),
        city: city.trim(),
        zip: zip.trim(),
        phone: phone.trim(),
      };

      await submitOrder({
        customer_email: user.email!,
        customer_name: user.displayName || "عميل غير معروف",
        shippingInfo: shipping,
        productsList: cart,
        status: "Processing",
        createdAt: Date.now(),
        totalAmount,
        paymentMethod,
        transactionReference: paymentMethod === "stripe" ? "STRIPE_IN_APP" : transactionRef.trim(),
      });

      await saveUserShippingOnOrder(user.email || user.uid, shipping);

      Alert.alert("نجاح", "تم إرسال طلبك بنجاح! سيتم مراجعته قريباً.", [
        {
          text: "موافق",
          onPress: () => {
            clearCart();
            setShowCheckout(false);
            setTransactionRef("");
            router.replace("/orders");
          },
        },
      ]);
    } catch (error: any) {
      console.error("Order creation error:", error);
      Alert.alert("خطأ", "فشل إتمام الطلب. يرجى المحاولة لاحقاً.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={["#FFEBEB", "#FFF3E3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView edges={["top"]}>
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>سلة المشتريات</ThemedText>
            {cart.length > 0 && ((address.trim() || city.trim()) ? (
              <ThemedText style={styles.headerSubtitle}>
                التوصيل إلى: {address.trim()}، {city.trim()}
              </ThemedText>
            ) : (
              <ThemedText style={styles.headerSubtitle}>
                لم يتم تحديد عنوان التوصيل بعد
              </ThemedText>
            ))}
          </View>
        </SafeAreaView>
      </View>

      {cart.length === 0 ? (
        <View style={[styles.mainContent, styles.centered]}>
          <Feather name="shopping-cart" size={48} color="#9CA3AF" style={{ marginBottom: 16 }} />
          <ThemedText style={styles.emptyTitle}>سلة المشتريات فارغة</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            تصفح القائمة وأضف وجباتك المفضلة لتظهر هنا.
          </ThemedText>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.replace("/" as any)}>
            <ThemedText style={styles.shopBtnText}>ابدأ الطلب الآن</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.mainContent}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {!showCheckout ? (
              <>
                {/* Cart List */}
                <View style={styles.listContainer}>
                {cart.map((item) => {
                  const imageUri = (item.p_imgs && item.p_imgs.length > 0 && item.p_imgs[0].url)
                    || "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300";
                  const price = parseFloat(item.p_cost as string) || 0;
                  return (
                    <Animated.View
                      key={item.id}
                      style={styles.cartItemCard}
                      entering={FadeInRight.duration(300)}
                      exiting={FadeOutLeft.duration(300)}
                      layout={LinearTransition.springify().damping(15)}
                    >
                      <Image source={{ uri: imageUri }} style={styles.cartItemImage} contentFit="cover" />
                      <View style={styles.cartItemDetails}>
                        <ThemedText style={styles.cartItemName}>{item.p_name}</ThemedText>
                        <ThemedText style={styles.cartItemCat}>{item.p_cat}</ThemedText>
                        <ThemedText style={styles.cartItemPrice}>{price.toLocaleString()} SDG</ThemedText>
                      </View>
                      <View style={styles.itemQuantityContainer}>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => updateQuantity(item.id, (item.p_qu || 1) + 1)}>
                          <Feather name="plus" size={16} color={C.primary} />
                        </TouchableOpacity>
                        <ThemedText style={styles.quantityText}>{item.p_qu || 1}</ThemedText>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => updateQuantity(item.id, (item.p_qu || 1) - 1)}>
                          <Feather name="minus" size={16} color={C.primary} />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => removeFromCart(item.id)}>
                        <Feather name="trash-2" size={20} color={C.danger} />
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>

              {/* Order Summary */}
              <View style={styles.summaryCard}>
                <ThemedText style={styles.summaryTitle}>ملخص الطلب</ThemedText>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>المجموع الفرعي</ThemedText>
                  <ThemedText style={styles.summaryValue}>{totalAmount.toLocaleString()} SDG</ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>رسوم التوصيل</ThemedText>
                  <ThemedText style={styles.freeDelivery}>مجاني</ThemedText>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.totalLabel}>الإجمالي كلياً</ThemedText>
                  <ThemedText style={styles.totalValue}>{totalAmount.toLocaleString()} SDG</ThemedText>
                </View>
                <TouchableOpacity style={styles.checkoutBtn} onPress={() => setShowCheckout(true)}>
                  <ThemedText style={styles.checkoutBtnText}>إتمام الطلب بأمان</ThemedText>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.checkoutContainer}>
              <View style={styles.checkoutHeader}>
                <TouchableOpacity style={styles.backBtn} onPress={() => setShowCheckout(false)}>
                  <ThemedText style={styles.backBtnText}>◀ رجوع للسلة</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.checkoutTitle}>بيانات التوصيل والدفع</ThemedText>
              </View>

              {loadingUser ? (
                <ActivityIndicator size="small" color={C.primary} style={{ marginVertical: Spacing.four }} />
              ) : (
                <View style={styles.form}>
                  <ThemedText style={styles.label}>رقم التواصل</ThemedText>
                  <TextInput style={styles.input} placeholder="أدخل رقم الهاتف..." placeholderTextColor={C.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

                  <ThemedText style={styles.label}>عنوان الشارع</ThemedText>
                  <View style={styles.addressInputRow}>
                    <TextInput
                      style={[styles.input, styles.addressInput]}
                      placeholder="مثال: شارع النيل، عمارة 4..."
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
                      <ThemedText style={styles.label}>الرمز البريدي</ThemedText>
                      <TextInput style={styles.input} placeholder="الرمز..." placeholderTextColor={C.textMuted} value={zip} onChangeText={setZip} keyboardType="numeric" />
                    </View>
                    <View style={{ flex: 1, marginLeft: Spacing.two }}>
                      <ThemedText style={styles.label}>المدينة</ThemedText>
                      <TextInput style={styles.input} placeholder="مثال: الخرطوم..." placeholderTextColor={C.textMuted} value={city} onChangeText={setCity} />
                    </View>
                  </View>

                  <View style={styles.formDivider} />

                  <ThemedText style={styles.label}>وسيلة الدفع</ThemedText>
                  <View style={styles.paymentSelector}>
                    {(["bankak", "mycashi", "stripe"] as PaymentMethod[]).map((method) => (
                      <TouchableOpacity
                        key={method}
                        style={[styles.payMethodBtn, paymentMethod === method && styles.payMethodActive]}
                        onPress={() => setPaymentMethod(method)}
                      >
                        <ThemedText style={[styles.payText, paymentMethod === method && styles.payActiveText]}>
                          {method === "bankak" ? "بنكك" : method === "mycashi" ? "كاشي" : "بطاقة"}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {paymentMethod !== "stripe" && (
                    <View style={styles.manualPayCard}>
                      <ThemedText style={styles.manualPayInstruction}>
                        حول المبلغ ({totalAmount.toLocaleString()} SDG) إلى الحساب التالي:
                      </ThemedText>
                      <View style={styles.accountRow}>
                        <TouchableOpacity
                          style={styles.copyBtn}
                          onPress={() => copyToClipboard(
                            paymentMethod === "bankak" ? BANKAK_ACCOUNT : MYCASHI_ACCOUNT,
                            paymentMethod === "bankak" ? "حساب بنكك" : "رقم كاشي"
                          )}
                        >
                          <ThemedText style={styles.copyBtnText}>نسخ</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.accountNumber}>
                          {paymentMethod === "bankak" ? BANKAK_ACCOUNT : MYCASHI_ACCOUNT}
                        </ThemedText>
                      </View>
                      <ThemedText style={[styles.label, { marginTop: Spacing.two }]}>رقم المعاملة المرجعي</ThemedText>
                      <TextInput
                        style={[styles.input, { backgroundColor: C.white }]}
                        placeholder="أدخل الرقم المرجعي للتحويل..."
                        placeholderTextColor={C.textMuted}
                        value={transactionRef}
                        onChangeText={setTransactionRef}
                        keyboardType="numeric"
                      />
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.submitOrderBtn, isSubmitting && { opacity: 0.7 }]}
                    onPress={handleCheckout}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={C.white} />
                    ) : (
                      <ThemedText style={styles.submitOrderText}>تأكيد وإرسال الطلب</ThemedText>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
      )}

      <Modal visible={isMapVisible} animationType="slide" onRequestClose={() => setIsMapVisible(false)}>
        <SafeAreaView style={styles.modalContainer} edges={["top", "bottom"]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsMapVisible(false)}>
              <Feather name="x" size={24} color={C.textDark} />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>تحديد موقع التوصيل</ThemedText>
            <View style={{ width: 32 }} />
          </View>
          
          <View style={styles.mapWrapper}>
            {mapRegion && (
              <MapView
                ref={mapViewRef}
                style={styles.mapView}
                initialRegion={mapRegion}
                onRegionChangeComplete={handleRegionChangeComplete}
                mapType="none"
              >
                <UrlTile
                  urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maximumZ={19}
                  tileSize={256}
                />
              </MapView>
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
