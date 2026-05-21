import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { Spacing, AppColors } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { getCurrentUser, signOutUser } from "@/services/authService";
import { getUserProfile, saveUserProfile, getUserOrderCount } from "@/services/userService";
import { profileStyles as styles } from "@/styles/profile.styles";

const C = AppColors;

export default function ProfileScreen() {
  const user = getCurrentUser();
  const { cartCount } = useCart();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [points, setPoints] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");

  // Load profile data
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const key = user.email || user.uid;

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
    setSaving(true);
    try {
      await saveUserProfile(user.email || user.uid, {
        shippingInfo: {
          address: address.trim(),
          city: city.trim(),
          zip: zip.trim(),
          phone: phone.trim(),
        },
      });
      Alert.alert("نجاح", "تم حفظ بيانات العنوان بنجاح.");
    } catch (error: any) {
      console.error("Error saving user details:", error);
      Alert.alert("خطأ", "فشل حفظ البيانات. يرجى المحاولة لاحقاً.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("تسجيل الخروج", "هل أنت متأكد من رغبتك في تسجيل الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "تسجيل الخروج", style: "destructive", onPress: () => signOutUser() },
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ThemedText style={{ color: C.textMuted }}>الرجاء تسجيل الدخول لعرض الملف الشخصي.</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>الملف الشخصي</ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Bio Card */}
          <View style={styles.bioCard}>
            {user.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <ThemedText style={styles.avatarInitial}>
                  {user.displayName ? user.displayName[0] : "U"}
                </ThemedText>
              </View>
            )}
            <ThemedText style={styles.userName}>{user.displayName || "عميلنا المميز"}</ThemedText>
            <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <ThemedText style={styles.statNumber}>{points}</ThemedText>
              <ThemedText style={styles.statLabel}>النقاط</ThemedText>
            </View>
            <View style={styles.statBox}>
              <ThemedText style={styles.statNumber}>{totalOrders}</ThemedText>
              <ThemedText style={styles.statLabel}>إجمالي الطلبات</ThemedText>
            </View>
            <View style={styles.statBox}>
              <ThemedText style={styles.statNumber}>{cartCount}</ThemedText>
              <ThemedText style={styles.statLabel}>عناصر السلة</ThemedText>
            </View>
          </View>

          {/* Address Form */}
          <View style={styles.formCard}>
            <ThemedText style={styles.formTitle}>بيانات العنوان الافتراضي</ThemedText>
            {loading ? (
              <ActivityIndicator size="small" color={C.primary} style={{ marginVertical: Spacing.four }} />
            ) : (
              <View style={styles.form}>
                <ThemedText style={styles.label}>رقم التواصل</ThemedText>
                <TextInput style={styles.input} placeholder="أدخل رقم الهاتف..." placeholderTextColor={C.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

                <ThemedText style={styles.label}>عنوان الشارع</ThemedText>
                <TextInput style={styles.input} placeholder="اسم الشارع والحي ورقم المنزل..." placeholderTextColor={C.textMuted} value={address} onChangeText={setAddress} />

                <View style={styles.rowInputs}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.label}>الرمز البريدي</ThemedText>
                    <TextInput style={styles.input} placeholder="أدخل الرمز..." placeholderTextColor={C.textMuted} value={zip} onChangeText={setZip} keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1, marginLeft: Spacing.two }}>
                    <ThemedText style={styles.label}>المدينة</ThemedText>
                    <TextInput style={styles.input} placeholder="المدينة..." placeholderTextColor={C.textMuted} value={city} onChangeText={setCity} />
                  </View>
                </View>

                <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSaveChanges} disabled={saving}>
                  {saving ? <ActivityIndicator color={C.white} /> : <ThemedText style={styles.saveBtnText}>حفظ التغييرات</ThemedText>}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <ThemedText style={styles.signOutText}>تسجيل الخروج</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
