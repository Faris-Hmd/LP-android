import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { useAlert } from "@/context/AlertContext";
import { AppColors } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import {
  signInWithGoogle,
  statusCodes,
  subscribeToAuthChanges,
} from "@/services/authService";
import { getCachedProducts, getProducts } from "@/services/productService";
import { getUserOrders } from "@/services/orderService";
import { indexStyles as styles } from "@/styles/index.styles";
import { OrderType, ProductType } from "@/types";

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
    title: "اليوم علينا",
    subtitle: "شرح العرض",
    price: "540",
    originalPrice: "640",
    savings: "وفر 100 جنية",
    tag: "محدود",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400",
  },
  {
    id: "promo-2",
    title: "وجبة التوفير السوبر",
    subtitle: "بيتزا وسط + ساندوتش + بيبسي",
    price: "720",
    originalPrice: "900",
    savings: "وفر 180 جنية",
    tag: "مميز",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400",
  },
  {
    id: "promo-3",
    title: "مكس النكهات",
    subtitle: "اثنين بيتزا وسط من اختيارك",
    price: "990",
    originalPrice: "1200",
    savings: "وفر 210 جنية",
    tag: "لفترة محدودة",
    image:
      "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=400",
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
  const { showAlert } = useAlert();
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [recentOrders, setRecentOrders] = useState<OrderType[]>([]);
  const promoScrollRef = useRef<ScrollView>(null);
  const categoriesScrollRef = useRef<ScrollView>(null);
  const featuredScrollRef = useRef<ScrollView>(null);
  const reorderScrollRef = useRef<ScrollView>(null);

  const {
    cart,
    addToCart,
    updateQuantity,
    searchQuery,
    setSearchQuery,
    isSearchActive,
    setIsSearchActive,
  } = useCart();

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

  // Fetch user orders to enable quick reordering
  useEffect(() => {
    if (!user || !user.email) {
      setRecentOrders([]);
      return;
    }
    getUserOrders(user.email)
      .then(setRecentOrders)
      .catch((e) => console.error("Error loading user orders for reorder:", e));
  }, [user]);

  // Extract unique products from user's previous orders
  const reorderProducts = useMemo(() => {
    if (!recentOrders || recentOrders.length === 0) return [];
    const productsMap = new Map<string, ProductType>();
    recentOrders.forEach((order) => {
      if (order.productsList) {
        order.productsList.forEach((item) => {
          if (item && item.id && !productsMap.has(item.id)) {
            // Match with active product details to keep price/images updated
            const activeProduct = products.find((p) => p.id === item.id);
            productsMap.set(item.id, activeProduct || item);
          }
        });
      }
    });
    return Array.from(productsMap.values()).slice(0, 5); // Limit to top 5 items
  }, [recentOrders, products]);

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoginLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled
      } else if (error.code === statusCodes.IN_PROGRESS) {
        showAlert({
          title: "تنبيه",
          message: "عملية تسجيل الدخول جارية بالفعل.",
          type: "warning",
        });
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showAlert({
          title: "خطأ",
          message: "خدمات Google Play غير متوفرة.",
          type: "error",
        });
      } else {
        showAlert({
          title: "خطأ في تسجيل الدخول",
          message: error.message || "حدث خطأ غير متوقع.",
          type: "error",
        });
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

      const matchesCategory =
        selectedCategory === "all" || p.p_cat === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Featured Products (rating based or isFeatured tag, capped at 6 items)
  const featuredProducts = useMemo(() => {
    return products
      .filter((p) => p.isFeatured || getProductMeta(p.id).rating >= "4.7")
      .slice(0, 6);
  }, [products]);

  const renderItem = useCallback(
    ({ item }: { item: ProductType }) => {
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
    },
    [cart, addToCart, updateQuantity],
  );

  const keyExtractor = useCallback((item: ProductType) => `product-${item.id}`, []);
  const ItemSeparator = useCallback(() => <View style={{ height: 16 }} />, []);

  const listHeader = useMemo(() => {
    if (searchQuery) {
      return (
        <>
          {/* Stylized Menu Header */}
          <View style={styles.stylizedSectionHeader}>
            <View style={styles.stylizedTitleLine} />
            <Text style={styles.stylizedTitleText}>
              نتائج <Text style={{ color: C.primary }}>البحث</Text>
            </Text>
            <Text style={styles.stylizedSubtitleText}>
              نتائج البحث عن "{searchQuery}"
            </Text>
          </View>

          {/* Main Menu Section Header */}
          <View style={[styles.sectionContainer, { marginBottom: 12 }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <ThemedText style={styles.sectionTitle}>
                  {selectedCategory === "all" ? "كل الأصناف" : (LabelMap[selectedCategory] || selectedCategory)}
                </ThemedText>
                <ThemedText style={styles.sectionCount}>
                  ({filteredProducts.length} وجبة)
                </ThemedText>
              </View>
            </View>
          </View>
        </>
      );
    }

    return (
      <>
        {/* Welcome & Announcement Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>
              {user?.displayName
                ? `أهلاً بك، ${user.displayName} 👋`
                : "مرحباً بك في ليبر بيتزا 👋"}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              جاهز لطلب وجبتك المفضلة اليوم؟
            </Text>
          </View>
          <View style={styles.announcementBadge}>
            <Feather name="truck" size={15} color={C.primary} />
            <Text style={styles.announcementText}>
              توصيل مجاني للطلبات فوق ٢٠٠ جنية 🍕
            </Text>
          </View>
        </View>

        {/* Custom Offers Section */}
        <View style={styles.stylizedSectionHeader}>
          <View style={styles.stylizedTitleLine} />
          <Text style={styles.stylizedTitleText}>
            عروضنا <Text style={{ color: C.primary }}>الحصرية</Text>
          </Text>
          <Text style={styles.stylizedSubtitleText}>
            وفر أكثر مع باقاتنا العائلية والوجبات المختارة بعناية فائقة
          </Text>
        </View>

        <View style={styles.promoContainer}>
          <ScrollView
            ref={promoScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promoList}
            decelerationRate="fast"
            snapToInterval={292} // Card width 280 + gap 12
            snapToAlignment="center"
            onContentSizeChange={(w) => {
              promoScrollRef.current?.scrollTo({
                x: w,
                animated: false,
              });
            }}
          >
            {PROMOTIONS.map((promo) => (
              <View key={promo.id} style={styles.offerCard}>
                <Image
                   source={{ uri: promo.image }}
                   style={styles.offerCardImage}
                   contentFit="cover"
                />
                <View style={styles.offerCardOverlay} />

                {/* Top Left Tags */}
                <View style={styles.offerTagsContainer}>
                  <View style={styles.offerTagRed}>
                    <Text style={styles.offerTagText}>{promo.tag}</Text>
                  </View>
                  <View style={styles.offerTagGreen}>
                    <Text style={styles.offerTagText}>
                      {promo.savings}
                    </Text>
                  </View>
                </View>

                {/* Bottom Row */}
                <View style={styles.offerBottomRow}>
                  <TouchableOpacity
                    style={styles.offerArrowBtn}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name="arrow-left"
                      size={16}
                      color={C.white}
                    />
                  </TouchableOpacity>
                  <View style={styles.offerTextGroup}>
                    <Text style={styles.offerTitle}>{promo.title}</Text>
                    <Text style={styles.offerSubtitle}>
                      {promo.subtitle}
                    </Text>
                    <View style={styles.offerPriceRow}>
                      <Text style={styles.offerPrice}>
                        {promo.price} جنية
                      </Text>
                      {promo.originalPrice && (
                        <Text style={styles.offerOriginalPrice}>
                          {promo.originalPrice} جنية
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Quick Reorder Section */}
        {reorderProducts.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <View style={styles.stylizedSectionHeader}>
              <View style={styles.stylizedTitleLine} />
              <Text style={styles.stylizedTitleText}>
                أطلبها <Text style={{ color: C.primary }}>مجدداً</Text>
              </Text>
              <Text style={styles.stylizedSubtitleText}>
                أعد طلب وجباتك المفضلة من طلباتك السابقة بلمسة واحدة
              </Text>
            </View>
            <ScrollView
              ref={reorderScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              style={{ flexGrow: 0 }}
              onContentSizeChange={(w) => {
                reorderScrollRef.current?.scrollTo({
                  x: w,
                  animated: false,
                });
              }}
            >
              {reorderProducts.map((item) => {
                const cartItem = cart.find((c) => c.id === item.id);
                const quantity = cartItem?.p_qu || 0;
                return (
                  <View key={`reorder-${item.id}`}>
                    <ReorderProductCard
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

        {/* Stylized Popular Items ("الأكثر طلباً") Header & Horizontal Scroll */}
        {featuredProducts.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <View style={styles.stylizedSectionHeader}>
              <View style={styles.stylizedTitleLine} />
              <Text style={styles.stylizedTitleText}>
                الأصناف الأكثر{" "}
                <Text style={{ color: C.primary }}>طلباً</Text>
              </Text>
              <Text style={styles.stylizedSubtitleText}>
                استكشف قائمتنا المختارة من ألذ أنواع البيتزا والوجبات
                المحضرة بعناية فائقة
              </Text>
            </View>
            <ScrollView
              ref={featuredScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              style={{ flexGrow: 0 }}
              onContentSizeChange={(w) => {
                featuredScrollRef.current?.scrollTo({
                  x: w,
                  animated: false,
                });
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

        {/* Stylized Menu Header */}
        <View style={styles.stylizedSectionHeader}>
          <View style={styles.stylizedTitleLine} />
          <Text style={styles.stylizedTitleText}>
            قائمة <Text style={{ color: C.primary }}>المأكولات</Text>
          </Text>
          <Text style={styles.stylizedSubtitleText}>
            اختر وجبتك المفضلة من تشكيلتنا المميزة واللذيذة
          </Text>
        </View>

        {/* Categories Selector */}
        <View style={styles.categoriesContainer}>
          <ScrollView
            ref={categoriesScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
            onContentSizeChange={(w) => {
              categoriesScrollRef.current?.scrollTo({
                x: w,
                animated: false,
              });
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
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && styles.categoryTextSelected,
                    ]}
                  >
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
              <ThemedText style={styles.sectionTitle}>
                {selectedCategory === "all" ? "كل الأصناف" : (LabelMap[selectedCategory] || selectedCategory)}
              </ThemedText>
              <ThemedText style={styles.sectionCount}>
                ({filteredProducts.length} وجبة)
              </ThemedText>
            </View>
          </View>
        </View>
      </>
    );
  }, [
    searchQuery,
    user,
    reorderProducts,
    featuredProducts,
    cart,
    selectedCategory,
    filteredProducts.length,
    addToCart,
    updateQuantity,
  ]);

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
              <ThemedText style={styles.brandSubtitle}>
                أشهى الوجبات والبيتزا الإيطالية
              </ThemedText>
            </View>

            <View style={styles.loginFormCard}>
              <ThemedText style={styles.welcomeText}>مرحباً بك 👋</ThemedText>
              <ThemedText style={styles.welcomeDesc}>
                سجل دخولك بحساب Google الآن لتتمتع بالطلب السريع لبيتزا ساخنة
                ومشروبات باردة أينما كنت.
              </ThemedText>

              <TouchableOpacity
                style={[
                  styles.googleLoginBtn,
                  loginLoading && { opacity: 0.8 },
                ]}
                onPress={handleGoogleSignIn}
                disabled={loginLoading}
                activeOpacity={0.85}
              >
                {loginLoading ? (
                  <ActivityIndicator color={C.white} />
                ) : (
                  <>
                    <Feather name="chrome" size={20} color={C.white} />
                    <ThemedText style={styles.googleLoginBtnText}>
                      المتابعة باستخدام Google
                    </ThemedText>
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
      <FlatList
        data={filteredProducts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={3}
        removeClippedSubviews={true}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          productsLoading ? (
            <View style={{ paddingVertical: 40 }}>
              <ActivityIndicator size="small" color={C.primary} />
            </View>
          ) : (
            <View style={styles.emptyListContainer}>
              <Feather name="meh" size={32} color={C.textMuted} />
              <ThemedText style={styles.emptyListText}>
                لم نجد أي وجبات تطابقة لبحثك.
              </ThemedText>
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

const FeaturedProductCard = React.memo(
  ({ product, quantity, onAddToCart, onUpdateQuantity }: ProductCardProps) => {
    const router = useRouter();
    const imageUrl =
      (product.p_imgs && product.p_imgs.length > 0 && product.p_imgs[0].url) ||
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300";
    const price = useMemo(
      () => parseFloat(product.p_cost as string) || 0,
      [product.p_cost],
    );
    const { rating, calories } = useMemo(
      () => getProductMeta(product.id),
      [product.id],
    );

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
          onPress={() =>
            router.push({ pathname: "/product", params: { id: product.id } })
          }
        >
          <View style={styles.featuredImageWrapper}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.featuredImage}
              contentFit="cover"
            />
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
            <Text style={styles.featuredName} numberOfLines={1}>
              {product.p_name}
            </Text>
            <Text style={styles.featuredDesc} numberOfLines={1}>
              {product.p_details ||
                "وجبة مميزة ومحضرة من أجود المكونات الطازجة."}
            </Text>
          </View>
        </TouchableOpacity>

        <View
          style={{ paddingHorizontal: 14, paddingBottom: 14, paddingTop: 6 }}
        >
          <View style={styles.featuredActionRow}>
            <Text style={styles.productPrice}>
              {price.toLocaleString()}{" "}
              <Text style={styles.currencyText}>جنية</Text>
            </Text>

            <View>
              {localQty > 0 ? (
                <View style={styles.inlineQuantitySelector}>
                  <TouchableOpacity
                    style={styles.inlineActionBtn}
                    onPress={handleIncrement}
                  >
                    <Feather name="plus" size={12} color={C.primary} />
                  </TouchableOpacity>
                  <Text style={styles.inlineQuantityLabel}>{localQty}</Text>
                  <TouchableOpacity
                    style={styles.inlineActionBtn}
                    onPress={handleDecrement}
                  >
                    <Feather name="minus" size={12} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.inlineAddToCartBtn}
                  onPress={handleAddToCart}
                >
                  <Feather name="shopping-cart" size={14} color={C.white} />
                  <Text style={styles.inlineAddToCartText}>أضف</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  },
);

// ─── Standard Card Component ────────────────────────────────────────────────
const StandardProductCard = React.memo(
  ({ product, quantity, onAddToCart, onUpdateQuantity }: ProductCardProps) => {
    const router = useRouter();
    const imageUrl =
      (product.p_imgs && product.p_imgs.length > 0 && product.p_imgs[0].url) ||
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300";
    const price = useMemo(
      () => parseFloat(product.p_cost as string) || 0,
      [product.p_cost],
    );
    const { rating, calories } = useMemo(
      () => getProductMeta(product.id),
      [product.id],
    );

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
          onPress={() =>
            router.push({ pathname: "/product", params: { id: product.id } })
          }
        >
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.productImage}
              contentFit="cover"
            />
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {LabelMap[product.p_cat] || product.p_cat}
              </Text>
            </View>
          </View>

          <View style={styles.cardInfo}>
            <View style={{ gap: 2 }}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.p_name}
              </Text>
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
                {product.p_details ||
                  "وجبة شهية ومحضرة بعناية من أفضل المكونات."}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.cardActionRow}>
          <Text style={styles.productPrice}>
            {price.toLocaleString()}{" "}
            <Text style={styles.currencyText}>جنية</Text>
          </Text>

          <View>
            {localQty > 0 ? (
              <View style={styles.inlineQuantitySelector}>
                <TouchableOpacity
                  style={styles.inlineActionBtn}
                  onPress={handleIncrement}
                >
                  <Feather name="plus" size={12} color={C.primary} />
                </TouchableOpacity>
                <Text style={styles.inlineQuantityLabel}>{localQty}</Text>
                <TouchableOpacity
                  style={styles.inlineActionBtn}
                  onPress={handleDecrement}
                >
                  <Feather name="minus" size={12} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.inlineAddToCartBtn}
                onPress={handleAddToCart}
              >
                <Feather name="shopping-cart" size={14} color={C.white} />
                <Text style={styles.inlineAddToCartText}>أضف</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  },
);

// ─── Reorder Card Component ──────────────────────────────────────────────────
const ReorderProductCard = React.memo(
  ({ product, quantity, onAddToCart, onUpdateQuantity }: ProductCardProps) => {
    const router = useRouter();
    const imageUrl =
      (product.p_imgs && product.p_imgs.length > 0 && product.p_imgs[0].url) ||
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300";
    const price = useMemo(
      () => parseFloat(product.p_cost as string) || 0,
      [product.p_cost],
    );

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
      <View style={styles.reorderCard}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            router.push({ pathname: "/product", params: { id: product.id } })
          }
        >
          <View style={styles.reorderImageWrapper}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.reorderImage}
              contentFit="cover"
            />
          </View>

          <View style={styles.reorderInfo}>
            <Text style={styles.reorderName} numberOfLines={1}>
              {product.p_name}
            </Text>
            <Text style={styles.reorderCategory} numberOfLines={1}>
              {LabelMap[product.p_cat] || product.p_cat}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.reorderActionRow}>
          <Text style={styles.reorderPrice}>
            {price.toLocaleString()} <Text style={{ fontSize: 10 }}>جنية</Text>
          </Text>

          <View>
            {localQty > 0 ? (
              <View style={styles.reorderQuantitySelector}>
                <TouchableOpacity
                  style={styles.reorderActionBtn}
                  onPress={handleIncrement}
                >
                  <Feather name="plus" size={12} color={C.primary} />
                </TouchableOpacity>
                <Text style={styles.reorderQuantityLabel}>{localQty}</Text>
                <TouchableOpacity
                  style={styles.reorderActionBtn}
                  onPress={handleDecrement}
                >
                  <Feather name="minus" size={12} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.reorderBtn}
                onPress={handleAddToCart}
              >
                <Feather name="plus" size={14} color={C.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  },
);

