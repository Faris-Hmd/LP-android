import React, { useState, useEffect, useRef } from "react";
import {
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
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
import { ThemedText } from "@/components/themed-text";
import { Spacing, AppColors } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { useAlert } from "@/context/AlertContext";
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
  const { showAlert } = useAlert();

  const [showCheckout, setShowCheckout] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bankak");
  const [transactionRef, setTransactionRef] = useState("");



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
    showAlert({
      title: "نسخ",
      message: `تم نسخ ${label} بنجاح: ${text}`,
      type: "success",
    });
  };

  const handleCheckout = async () => {
    if (!user) {
      showAlert({
        title: "تنبيه",
        message: "يرجى تسجيل الدخول أولاً.",
        type: "warning",
      });
      return;
    }
    if (cart.length === 0) {
      showAlert({
        title: "تنبيه",
        message: "سلة المشتريات فارغة.",
        type: "warning",
      });
      return;
    }
    if (!address.trim() || !city.trim() || !phone.trim()) {
      showAlert({
        title: "تنبيه",
        message: "يرجى تعبئة الحقول الأساسية: العنوان، المدينة، ورقم الهاتف.",
        type: "warning",
      });
      return;
    }
    if (paymentMethod !== "stripe" && !transactionRef.trim()) {
      showAlert({
        title: "تنبيه",
        message: "يرجى إدخال رقم المعاملة المرجعي لتأكيد الدفع.",
        type: "warning",
      });
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

      showAlert({
        title: "نجاح",
        message: "تم إرسال طلبك بنجاح! سيتم مراجعته قريباً.",
        type: "success",
        buttons: [
          {
            text: "موافق",
            onPress: () => {
              clearCart();
              setShowCheckout(false);
              setTransactionRef("");
              router.replace("/orders");
            },
          },
        ],
      });
    } catch (error: any) {
      console.error("Order creation error:", error);
      showAlert({
        title: "خطأ",
        message: "فشل إتمام الطلب. يرجى المحاولة لاحقاً.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>

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
                {/* Cart Title Section */}
                <View style={styles.cartTitleSection}>
                  <ThemedText style={styles.cartTitleText}>سلة المشتريات</ThemedText>
                  <ThemedText style={styles.cartSubtitleText}>
                    لديك {cart.reduce((acc, item) => acc + (item.p_qu || 1), 0)} أصناف في سلتك
                  </ThemedText>
                </View>

                {/* Cart List */}
                <View style={styles.listContainer}>
                  {cart.map((item) => {
                    const imageUri = (item.p_imgs && item.p_imgs.length > 0 && item.p_imgs[0].url)
                      || "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300";
                    const price = parseFloat(item.p_cost as string) || 0;
                    const itemCategory = item.p_cat === "PC" ? "بيتزا" : item.p_cat === "BG" ? "برجر" : item.p_cat === "DN" ? "دونات" : item.p_cat;
                    return (
                      <View
                        key={item.id}
                        style={styles.cartItemCard}
                      >
                        {/* Product Image on Right */}
                        <Image source={{ uri: imageUri }} style={styles.cartItemImage} contentFit="cover" />
                        
                        {/* Product Details (Middle) */}
                        <View style={styles.cartItemDetails}>
                          <ThemedText style={styles.cartItemName}>{item.p_name}</ThemedText>
                          <ThemedText style={styles.cartItemCat}>{itemCategory}</ThemedText>
                          <ThemedText style={styles.cartItemPrice}>{price.toLocaleString()} جنية</ThemedText>
                        </View>

                        {/* Pill Counter (Bottom Left) */}
                        <View style={styles.itemQuantityContainer}>
                          {/* Plus on Left */}
                          <TouchableOpacity style={styles.actionBtn} onPress={() => updateQuantity(item.id, (item.p_qu || 1) + 1)}>
                            <Feather name="plus" size={12} color={C.primary} />
                          </TouchableOpacity>
                          
                          {/* Quantity in Middle */}
                          <ThemedText style={styles.quantityText}>{item.p_qu || 1}</ThemedText>
                          
                          {/* Minus on Right */}
                          <TouchableOpacity style={styles.actionBtn} onPress={() => updateQuantity(item.id, (item.p_qu || 1) - 1)}>
                            <Feather name="minus" size={12} color="#9CA3AF" />
                          </TouchableOpacity>
                        </View>

                        {/* Delete Button (Top Left) */}
                        <TouchableOpacity style={styles.deleteBtn} onPress={() => removeFromCart(item.id)}>
                          <Feather name="trash-2" size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>

                {/* Order Summary */}
                <View style={styles.summaryCard}>
                  <ThemedText style={styles.summaryTitle}>ملخص الطلب</ThemedText>
                  <View style={styles.summaryRow}>
                    <ThemedText style={styles.summaryLabel}>المجموع الفرعي</ThemedText>
                    <ThemedText style={styles.summaryValue}>{totalAmount.toLocaleString()} جنية</ThemedText>
                  </View>
                  <View style={styles.summaryRow}>
                    <ThemedText style={styles.summaryLabel}>رسوم التوصيل</ThemedText>
                    <ThemedText style={styles.freeDelivery}>مجاني</ThemedText>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.summaryRow}>
                    <ThemedText style={styles.totalLabel}>الإجمالي كلياً</ThemedText>
                    <ThemedText style={styles.totalValue}>{totalAmount.toLocaleString()} جنية</ThemedText>
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
                  {/* Read-only Location Details Card */}
                  <View style={styles.locationDetailsCard}>
                    <View style={styles.locationDetailsHeader}>
                      <Feather name="map-pin" size={16} color={C.primary} />
                      <ThemedText style={styles.locationDetailsTitle}>عنوان التوصيل المحدد</ThemedText>
                    </View>
                    
                    {(!address.trim() || !city.trim() || !phone.trim()) ? (
                      <LinearGradient
                        colors={["#FFF5F5", "#FFE3E3"]}
                        style={styles.emptyLocationWarningGradient}
                      >
                        <View style={styles.emptyLocationWarningContent}>
                          <Feather name="alert-triangle" size={20} color={C.primary} style={{ marginBottom: 4 }} />
                          <ThemedText style={styles.emptyLocationText}>
                            لم يتم حفظ بيانات التوصيل أو رقم الهاتف بعد. يرجى ملء بيانات العنوان في ملفك الشخصي لتتمكن من إتمام الطلب.
                          </ThemedText>
                          <TouchableOpacity 
                            style={styles.goToProfileBtn} 
                            onPress={() => {
                              setShowCheckout(false);
                              router.replace("/profile" as any);
                            }}
                          >
                            <ThemedText style={styles.goToProfileBtnText}>الذهاب لحسابي لإضافة العنوان</ThemedText>
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    ) : (
                      <View style={styles.locationInfoBody}>
                        <View style={styles.locationInfoRow}>
                          <ThemedText style={styles.locationLabelText}>رقم الهاتف</ThemedText>
                          <ThemedText style={styles.locationValueText}>{phone}</ThemedText>
                        </View>
                        <View style={styles.locationInfoRow}>
                          <ThemedText style={styles.locationLabelText}>العنوان</ThemedText>
                          <ThemedText style={styles.locationValueText}>{address}</ThemedText>
                        </View>
                        <View style={styles.locationInfoRow}>
                          <ThemedText style={styles.locationLabelText}>المدينة</ThemedText>
                          <ThemedText style={styles.locationValueText}>{city}</ThemedText>
                        </View>
                        {zip ? (
                          <View style={styles.locationInfoRow}>
                            <ThemedText style={styles.locationLabelText}>الرمز البريدي</ThemedText>
                            <ThemedText style={styles.locationValueText}>{zip}</ThemedText>
                          </View>
                        ) : null}
                        
                        <View style={styles.locationHintBox}>
                          <Feather name="info" size={14} color={C.textMuted} />
                          <ThemedText style={styles.locationHintText}>
                            لتغيير عنوان التوصيل أو رقم الهاتف، يرجى الانتقال إلى صفحة حسابي.
                          </ThemedText>
                        </View>
                      </View>
                    )}
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
                        حول المبلغ ({totalAmount.toLocaleString()} جنية) إلى الحساب التالي:
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

    </View>
  );
}
