import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  StyleSheet,
  Text,
  Dimensions,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/themed-text";
import { AppColors } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { ProductType } from "@/types";
import { getProducts, getCachedProducts } from "@/services/productService";
import { signInWithGoogle, subscribeToAuthChanges, statusCodes } from "@/services/authService";
import { indexStyles as styles, cardWidth, featuredCardWidth } from "@/styles/index.styles";

const { width } = Dimensions.get("window");
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
  { key: "all", label: "الكل", icon: "star" },
  { key: "PC", label: "بيتزا", icon: "pizza" },
  { key: "LAPTOP", label: "ساندوتشات", icon: "hamburger" },
  { key: "WEBCAMS", label: "مقبلات", icon: "french-fries" },
  { key: "HARD_DRIVES", label: "مشروبات", icon: "cup-water" },
  { key: "KEYBOARDS", label: "حلويات", icon: "cake-variant" },
  { key: "SPEAKERS", label: "سلطات", icon: "leaf" },
  { key: "SSD", label: "شرقي", icon: "food-variant" },
];

const PROMOTIONS = [
  {
    id: "promo-1",
    title: "العرض العائلي الكبير 🍕",
    subtitle: "اطلب بيتزا حجم عائلي واحصل على لتر بيبسي مجاناً!",
    badge: "الأكثر توفيراً",
    gradient: ["#E53E3E", "#F59E0B"] as [string, string],
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300",
  },
  {
    id: "promo-2",
    title: "ساعة التوفير ⏱️",
    subtitle: "خصم 30% على جميع أنواع السندوتشات من 4 إلى 6 مساءً.",
    badge: "عرض لفترة محدودة",
    gradient: ["#EC4899", "#8B5CF6"] as [string, string],
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=300",
  },
  {
    id: "promo-3",
    title: "نقاط الولاء 🎉",
    subtitle: "اجمع النقاط مع كل طلب واستبدلها بوجبات مجانية لجميع العائلة.",
    badge: "برنامج الولاء",
    gradient: ["#10B981", "#3B82F6"] as [string, string],
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=300",
  },
];

const getProductMeta = (id: string) => {
  let charSum = 0;
  for (let i = 0; i < id.length; i++) {
    charSum += id.charCodeAt(i);
  }
  const rating = (4.2 + (charSum % 8) / 10).toFixed(1);
  const calories = 220 + (charSum % 25) * 10;
  return { rating, calories };
};

export default function MenuScreen() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  const [products, setProducts] = useState<ProductType[]>(() => {
    const cached = getCachedProducts();
    return cached || [];
  });
  const [productsLoading, setProductsLoading] = useState(() => {
    return getCachedProducts() === null;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const promoScrollRef = useRef<ScrollView>(null);
  const categoriesScrollRef = useRef<ScrollView>(null);
  const featuredScrollRef = useRef<ScrollView>(null);

  const { cart, addToCart, updateQuantity } = useCart();

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
    const hasCache = getCachedProducts() !== null;
    if (!hasCache) {
      setProductsLoading(true);
    }
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
        // User cancelled
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

  // Filtered Products for Main Menu List
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const name = p.p_name || "";
      const desc = p.p_details || "";
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || p.p_cat === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Featured Products (rating based or isFeatured tag, capped at 6 items)
  const featuredProducts = useMemo(() => {
    return products
      .filter((p) => p.isFeatured || getProductMeta(p.id).rating >= "4.7")
      .slice(0, 6);
  }, [products]);

  const handleCategoryPress = useCallback((categoryKey: string) => {
    setSelectedCategory(categoryKey);
  }, []);

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
              <Image 
                source={require("@/assets/images/logo.png")} 
                style={styles.logoImage} 
                contentFit="cover"
              />
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
                    <Feather name="chrome" size={20} color={C.white} />
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
      {/* Fixed top navigation bar */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={["top"]} style={{ paddingBottom: 0 }}>
          {isSearchActive ? (
            <View style={styles.headerSearchActiveRow}>
              {/* Profile Avatar (Left) */}
              <Image
                source={{ uri: user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150" }}
                style={styles.userAvatar}
                contentFit="cover"
              />

              {/* Search input container (Center) */}
              <View style={styles.headerSearchActiveInputContainer}>
                <TextInput
                  ref={searchInputRef}
                  style={styles.headerSearchActiveInput}
                  placeholder="ابحث عن وجبتك المفضلة..."
                  placeholderTextColor={C.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {searchQuery.length > 0 ? (
                  <TouchableOpacity onPress={() => setSearchQuery("")} style={{ padding: 4 }}>
                    <Feather name="x" size={16} color={C.textMuted} />
                  </TouchableOpacity>
                ) : (
                  <Feather name="search" size={16} color={C.textMuted} />
                )}
              </View>

              {/* Close Search Button (Right) */}
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setIsSearchActive(false);
                }}
                style={styles.headerSearchIconBtn}
              >
                <Feather name="arrow-right" size={20} color={C.textDark} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.headerTop}>
              {/* Profile Pic & Search Button (Left) */}
              <View style={styles.headerLeftSide}>
                <Image
                  source={{ uri: user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150" }}
                  style={styles.userAvatar}
                  contentFit="cover"
                />
                <TouchableOpacity
                  style={styles.headerSearchIconBtn}
                  onPress={() => setIsSearchActive(true)}
                  activeOpacity={0.7}
                >
                  <Feather name="search" size={18} color={C.textDark} />
                </TouchableOpacity>
              </View>

              {/* App Logo & App Name (Right) */}
              <View style={styles.headerRightSide}>
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={styles.headerLogo}
                  contentFit="contain"
                />
                <ThemedText style={styles.appName}>لييبر بيتزا</ThemedText>
              </View>
            </View>
          )}
        </SafeAreaView>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => `product-${item.id}`}
        renderItem={({ item }) => {
          const cartItem = cart.find((c) => c.id === item.id);
          const quantity = cartItem?.p_qu || 0;
          return (
            <View style={{ paddingHorizontal: 16 }}>
              <StandardProductCard 
                product={item} 
                quantity={quantity}
                onAddToCart={addToCart}
                onUpdateQuantity={updateQuantity}
              />
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        ListHeaderComponent={
          <>
            {/* Promotion Offers Banner */}
            <View style={styles.promoContainer}>
              <ScrollView
                ref={promoScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.promoList}
                pagingEnabled
                snapToInterval={width - 36}
                decelerationRate="fast"
                onContentSizeChange={(w) => {
                  promoScrollRef.current?.scrollTo({ x: w, animated: false });
                }}
              >
                {PROMOTIONS.map((promo) => (
                  <View key={promo.id} style={styles.promoCard}>
                    <LinearGradient
                      colors={promo.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.promoGradient}
                    >
                      <View style={styles.promoInfo}>
                        <View style={styles.promoBadge}>
                          <Text style={styles.promoBadgeText}>{promo.badge}</Text>
                        </View>
                        <Text style={styles.promoTitle}>{promo.title}</Text>
                        <Text style={styles.promoSubtitle} numberOfLines={2}>{promo.subtitle}</Text>
                      </View>
                      <Image source={{ uri: promo.image }} style={styles.promoImage} contentFit="cover" />
                    </LinearGradient>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Featured Items ("الأكثر طلباً") - Pinned (always visible above categories) */}
            {!searchQuery && featuredProducts.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <ThemedText style={styles.sectionTitle}>الأكثر طلباً 🔥</ThemedText>
                  </View>
                  <ThemedText style={styles.sectionLink}>عرض الكل</ThemedText>
                </View>
                <ScrollView
                  ref={featuredScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                  style={{ flexGrow: 0 }}
                  onContentSizeChange={(w) => {
                    featuredScrollRef.current?.scrollTo({ x: w, animated: false });
                  }}
                >
                  {featuredProducts.map((item) => {
                    const cartItem = cart.find((c) => c.id === item.id);
                    const quantity = cartItem?.p_qu || 0;
                    return (
                      <View key={`featured-${item.id}`}>
                        <FeaturedProductCard 
                          product={item} 
                          quantity={quantity}
                          onAddToCart={addToCart}
                          onUpdateQuantity={updateQuantity}
                        />
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Categories Selector */}
            <View style={styles.categoriesContainer}>
              <ScrollView
                ref={categoriesScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
                onContentSizeChange={(w) => {
                  categoriesScrollRef.current?.scrollTo({ x: w, animated: false });
                }}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.categoryChip, 
                        isSelected && styles.categoryChipSelected,
                      ]}
                      onPress={() => handleCategoryPress(cat.key)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons 
                        name={cat.icon as any} 
                        size={16} 
                        color={isSelected ? C.white : C.primary} 
                      />
                      <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Main Menu Section Header */}
            <View style={[styles.sectionContainer, { marginBottom: 12 }]}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <ThemedText style={styles.sectionTitle}>قائمة المأكولات</ThemedText>
                  <ThemedText style={styles.sectionCount}>({filteredProducts.length})</ThemedText>
                </View>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          productsLoading ? (
            <View style={{ paddingVertical: 40 }}>
              <ActivityIndicator size="small" color={C.primary} />
            </View>
          ) : (
            <View style={styles.emptyListContainer}>
              <Feather name="meh" size={32} color={C.textMuted} />
              <ThemedText style={styles.emptyListText}>لم نجد أي وجبات تطابقة لبحثك.</ThemedText>
            </View>
          )
        }
      />
    </View>
  );
}

// ─── Featured Card Component ────────────────────────────────────────────────
interface ProductCardProps {
  product: ProductType;
  quantity: number;
  onAddToCart: (product: ProductType) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
}

const FeaturedProductCard = React.memo(({ product, quantity, onAddToCart, onUpdateQuantity }: ProductCardProps) => {
  const router = useRouter();
  const imageUrl =
    (product.p_imgs && product.p_imgs.length > 0 && product.p_imgs[0].url) ||
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300";
  const price = useMemo(() => parseFloat(product.p_cost as string) || 0, [product.p_cost]);
  const { rating, calories } = useMemo(() => getProductMeta(product.id), [product.id]);

  // Local state for instant optimistic updates
  const [localQty, setLocalQty] = useState(quantity);

  useEffect(() => {
    setLocalQty(quantity);
  }, [quantity]);

  const handleAddToCart = useCallback(() => {
    setLocalQty(1);
    onAddToCart(product);
  }, [product, onAddToCart]);

  const handleIncrement = useCallback(() => {
    const next = localQty + 1;
    setLocalQty(next);
    onUpdateQuantity(product.id, next);
  }, [product.id, localQty, onUpdateQuantity]);

  const handleDecrement = useCallback(() => {
    const next = Math.max(0, localQty - 1);
    setLocalQty(next);
    onUpdateQuantity(product.id, next);
  }, [product.id, localQty, onUpdateQuantity]);

  return (
    <View style={styles.featuredCard}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: "/product", params: { id: product.id } })}
      >
        <View style={styles.featuredImageWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.featuredImage} contentFit="cover" />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.65)"]}
            style={styles.featuredGradient}
          />
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>الأكثر طلباً 🔥</Text>
          </View>
          <View style={styles.featuredMetaContainer}>
            <View style={styles.featuredMetaItem}>
              <Feather name="zap" size={10} color="#FFB800" />
              <Text style={styles.featuredMetaText}>{calories} سعرة</Text>
            </View>
            <View style={styles.featuredMetaItem}>
              <Feather name="star" size={10} color="#FFB800" />
              <Text style={styles.featuredMetaText}>{rating}</Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 14, paddingTop: 14, gap: 10 }}>
          <Text style={styles.featuredName} numberOfLines={1}>{product.p_name}</Text>
          <Text style={styles.featuredDesc} numberOfLines={1}>
            {product.p_details || "وجبة مميزة ومحضرة من أجود المكونات الطازجة."}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={{ paddingHorizontal: 14, paddingBottom: 14, paddingTop: 6 }}>
        <View style={styles.featuredActionRow}>
          <Text style={styles.productPrice}>
            {price.toLocaleString()} <Text style={styles.currencyText}>SDG</Text>
          </Text>
          
          <View>
            {localQty > 0 ? (
              <View style={styles.inlineQuantitySelector}>
                <TouchableOpacity
                  style={styles.inlineActionBtn}
                  onPress={handleDecrement}
                >
                  <Feather name="minus" size={14} color={C.primary} />
                </TouchableOpacity>
                <Text style={styles.inlineQuantityLabel}>{localQty}</Text>
                <TouchableOpacity
                  style={styles.inlineActionBtn}
                  onPress={handleIncrement}
                >
                  <Feather name="plus" size={14} color={C.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.inlineAddToCartBtn} onPress={handleAddToCart}>
                <Feather name="shopping-cart" size={14} color={C.white} />
                <Text style={styles.inlineAddToCartText}>أضف</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
});

// ─── Standard Card Component ────────────────────────────────────────────────
const StandardProductCard = React.memo(({ product, quantity, onAddToCart, onUpdateQuantity }: ProductCardProps) => {
  const router = useRouter();
  const imageUrl =
    (product.p_imgs && product.p_imgs.length > 0 && product.p_imgs[0].url) ||
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300";
  const price = useMemo(() => parseFloat(product.p_cost as string) || 0, [product.p_cost]);
  const { rating, calories } = useMemo(() => getProductMeta(product.id), [product.id]);

  // Local state for instant optimistic updates
  const [localQty, setLocalQty] = useState(quantity);

  useEffect(() => {
    setLocalQty(quantity);
  }, [quantity]);

  const handleAddToCart = useCallback(() => {
    setLocalQty(1);
    onAddToCart(product);
  }, [product, onAddToCart]);

  const handleIncrement = useCallback(() => {
    const next = localQty + 1;
    setLocalQty(next);
    onUpdateQuantity(product.id, next);
  }, [product.id, localQty, onUpdateQuantity]);

  const handleDecrement = useCallback(() => {
    const next = Math.max(0, localQty - 1);
    setLocalQty(next);
    onUpdateQuantity(product.id, next);
  }, [product.id, localQty, onUpdateQuantity]);

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.cardPressableArea}
        onPress={() => router.push({ pathname: "/product", params: { id: product.id } })}
      >
        <View style={styles.imageWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.productImage} contentFit="cover" />
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {LabelMap[product.p_cat] || product.p_cat}
            </Text>
          </View>
        </View>

        <View style={styles.cardInfo}>
          <View style={{ gap: 2 }}>
            <Text style={styles.productName} numberOfLines={1}>{product.p_name}</Text>
            <View style={styles.cardMetaRow}>
              <View style={styles.cardMetaItem}>
                <Feather name="star" size={10} color="#FFB800" />
                <Text style={styles.cardMetaText}>{rating}</Text>
              </View>
              <View style={styles.cardMetaItem}>
                <Feather name="zap" size={10} color="#FF9800" />
                <Text style={styles.cardMetaText}>{calories} سعرة</Text>
              </View>
            </View>
            <Text style={styles.productDescSnippet} numberOfLines={2}>
              {product.p_details || "وجبة شهية ومحضرة بعناية من أفضل المكونات."}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.cardActionRow}>
        <Text style={styles.productPrice}>
          {price.toLocaleString()} <Text style={styles.currencyText}>SDG</Text>
        </Text>

        <View>
          {localQty > 0 ? (
            <View style={styles.inlineQuantitySelector}>
              <TouchableOpacity
                style={styles.inlineActionBtn}
                onPress={handleDecrement}
              >
                <Feather name="minus" size={14} color={C.primary} />
              </TouchableOpacity>
              <Text style={styles.inlineQuantityLabel}>{localQty}</Text>
              <TouchableOpacity
                style={styles.inlineActionBtn}
                onPress={handleIncrement}
              >
                <Feather name="plus" size={14} color={C.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.inlineAddToCartBtn} onPress={handleAddToCart}>
              <Feather name="shopping-cart" size={14} color={C.white} />
              <Text style={styles.inlineAddToCartText}>أضف</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
});
