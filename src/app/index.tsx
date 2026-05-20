import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";

import { ThemedText } from "@/components/themed-text";
import { AppColors } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { ProductType } from "@/types";
import { getProducts } from "@/services/productService";
import { signInWithGoogle, subscribeToAuthChanges, statusCodes } from "@/services/authService";
import { indexStyles as styles, cardWidth } from "@/styles/index.styles";

const C = AppColors;

const LabelMap: Record<string, string> = {
  PC: "بيتزا",
  LAPTOP: "ساندوتشات",
  WEBCAMS: "مقبلات",
  HARD_DRIVES: "مشروبات باردة",
  HEADSETS: "مشروبات ساخنة",
  KEYBOARDS: "حلويات",
  SPEAKERS: "سلطات",
  PRINTERS: "وجبات عائلية",
  MICROPHONES: "إضافات",
  MONITORS: "بيتزا إيطالية",
  SSD: "بيتزا شرقية",
  MOUSES: "وجبات سريعة",
};

const CATEGORIES = [
  { key: "all", label: "الكل" },
  { key: "PC", label: "بيتزا" },
  { key: "LAPTOP", label: "ساندوتشات" },
  { key: "WEBCAMS", label: "مقبلات" },
  { key: "HARD_DRIVES", label: "مشروبات" },
  { key: "KEYBOARDS", label: "حلويات" },
];

export default function MenuScreen() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  const [products, setProducts] = useState<ProductType[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((usr) => {
      setUser(usr);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Products Fetching
  useEffect(() => {
    if (!user) return;
    setProductsLoading(true);
    getProducts()
      .then(setProducts)
      .catch((e) => console.error("Error loading products:", e))
      .finally(() => setProductsLoading(false));
  }, [user]);

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoginLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert("تنبيه", "عملية تسجيل الدخول جارية بالفعل.");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("خطأ", "خدمات Google Play غير متوفرة.");
      } else {
        Alert.alert("خطأ في تسجيل الدخول", error.message || "حدث خطأ غير متوقع.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const name = product.p_name || "";
      const desc = product.p_details || "";
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.p_cat === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loginContainer}>
        <SafeAreaView style={styles.loginSafeArea}>
          <View style={styles.loginContent}>
            <View style={styles.logoContainer}>
              <ThemedText style={styles.pizzaLogo}>🍕</ThemedText>
              <ThemedText style={styles.brandTitle}>لييبر بيتزا</ThemedText>
              <ThemedText style={styles.brandSubtitle}>أشهى الوجبات والبيتزا الإيطالية</ThemedText>
            </View>

            <View style={styles.loginFormCard}>
              <ThemedText style={styles.welcomeText}>مرحباً بك 👋</ThemedText>
              <ThemedText style={styles.welcomeDesc}>
                سجل دخولك بحساب Google الآن لتتمتع بالطلب السريع لبيتزا ساخنة ومشروبات باردة أينما كنت.
              </ThemedText>

              <TouchableOpacity
                style={[styles.googleLoginBtn, loginLoading && { opacity: 0.8 }]}
                onPress={handleGoogleSignIn}
                disabled={loginLoading}
                activeOpacity={0.85}
              >
                {loginLoading ? (
                  <ActivityIndicator color={C.white} />
                ) : (
                  <>
                    <Feather name="chrome" size={20} color={C.white} style={{ marginLeft: 8 }} />
                    <ThemedText style={styles.googleLoginBtnText}>المتابعة باستخدام Google</ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {productsLoading && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.scrollList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Feather name="meh" size={36} color={C.textMuted} />
              <ThemedText style={styles.emptyListText}>لم نجد أي وجبات مطابقة لبحثك.</ThemedText>
            </View>
          }
        />
      )}

      {/* Absolute Translucent Header */}
      <View style={styles.blurHeader}>
        <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
          <View style={styles.headerTop}>
            <ThemedText style={styles.appName}>لييبر بيتزا</ThemedText>
            <View style={styles.welcomeUserRow}>
              <ThemedText style={styles.userGreet}>
                مرحباً، {user.displayName?.split(" ")[0] || "عميلنا"}
              </ThemedText>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <Feather name="search" size={16} color={C.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث عن وجبتك المفضلة..."
              placeholderTextColor={C.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Categories Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
            style={{ flexGrow: 0 }}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                  onPress={() => setSelectedCategory(cat.key)}
                >
                  <ThemedText
                    style={[styles.categoryText, isSelected && styles.categoryTextSelected]}
                  >
                    {cat.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
  );
}

const ProductCard = ({ product }: { product: ProductType }) => {
  const router = useRouter();
  const { cart, addToCart, updateQuantity } = useCart();
  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem?.p_qu || 0;

  const imageUrl =
    (product.p_imgs && product.p_imgs.length > 0 && product.p_imgs[0].url) ||
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300";
  const price = parseFloat(product.p_cost as string) || 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.cardContainer}
      onPress={() => router.push({ pathname: "/product", params: { id: product.id } })}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageUrl }} style={styles.productImage} contentFit="cover" />
        <View style={styles.categoryBadge}>
          <ThemedText style={styles.categoryBadgeText}>
            {LabelMap[product.p_cat] || product.p_cat}
          </ThemedText>
        </View>

        <View style={styles.cardActionFloating}>
          {quantity > 0 ? (
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={() => updateQuantity(product.id, quantity + 1)}
              >
                <Feather name="plus" size={14} color={C.primary} />
              </TouchableOpacity>
              <ThemedText style={styles.quantityLabel}>{quantity}</ThemedText>
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={() => updateQuantity(product.id, quantity - 1)}
              >
                <Feather name="minus" size={14} color={C.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addToCartCircularBtn}
              onPress={() => addToCart(product)}
            >
              <Feather name="shopping-cart" size={16} color={C.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.cardInfo}>
        <ThemedText style={styles.productName} numberOfLines={1}>
          {product.p_name}
        </ThemedText>
        <View style={styles.priceRow}>
          <ThemedText style={styles.productPrice}>
            {price.toLocaleString()}{" "}
            <ThemedText style={styles.currencyText}>SDG</ThemedText>
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};
