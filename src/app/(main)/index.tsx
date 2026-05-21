import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  FlatList,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import Animated, {
  SharedTransition,
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const customTransition = SharedTransition.duration(150);

const AnimatedImage = Animated.createAnimatedComponent(Image);

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

interface CategorySectionType {
  key: string;
  label: string;
  products: ProductType[];
}

export default function MenuScreen() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  const [products, setProducts] = useState<ProductType[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categoriesScrollRef = useRef<ScrollView>(null);
  const hasScrolledRef = useRef(false);
  const flatListRef = useRef<FlatList>(null);


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

  const sections: CategorySectionType[] = useMemo(() => {
    const activeCategories = CATEGORIES.filter((cat) => cat.key !== "all");
    return activeCategories
      .map((cat) => {
        const catProducts = products.filter((p) => {
          const name = p.p_name || "";
          const desc = p.p_details || "";
          const matchesSearch =
            name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            desc.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesCategory = p.p_cat === cat.key;
          return matchesSearch && matchesCategory;
        });
        return {
          key: cat.key,
          label: cat.label,
          products: catProducts,
        };
      })
      .filter((sec) => sec.products.length > 0);
  }, [products, searchQuery]);

  const totalProductsCount = useMemo(() => {
    return sections.reduce((sum, sec) => sum + sec.products.length, 0);
  }, [sections]);

  const handleCategoryPress = useCallback((categoryKey: string) => {
    setSelectedCategory(categoryKey);
    if (categoryKey === "all") {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } else {
      const idx = sections.findIndex((sec) => sec.key === categoryKey);
      if (idx !== -1) {
        flatListRef.current?.scrollToIndex({
          index: idx,
          animated: true,
          viewPosition: 0,
        });
      }
    }
  }, [sections]);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const renderItem = useCallback(({ item }: { item: CategorySectionType }) => {
    return <CategorySection section={item} />;
  }, []);

  const getItemLayout = useCallback((_data: any, index: number) => ({
    length: 320,
    offset: 320 * index,
    index,
  }), []);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const firstVisibleKey = viewableItems[0].item.key;
      setSelectedCategory(firstVisibleKey);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 40,
  }).current;

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 120],
      [0, -80],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }],
    };
  });

  const headerTopAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 60],
      [1, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
    };
  });

  const searchBarAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 80],
      [1, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
    };
  });

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
              <Image source={require("@/assets/images/logo.png")} style={styles.logoImage} />
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
        <Animated.FlatList
          ref={flatListRef}
          data={sections}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          contentContainerStyle={styles.scrollList}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={7}
          removeClippedSubviews={true}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Feather name="meh" size={36} color={C.textMuted} />
              <ThemedText style={styles.emptyListText}>لم نجد أي وجبات مطابقة لبحثك.</ThemedText>
            </View>
          }
        />
      )}

      {/* Absolute Opaque Header with Pastel Gradient */}
      <Animated.View
        style={[styles.headerContainer, headerAnimatedStyle]}
      >
        <LinearGradient
          colors={["#FFEBEB", "#FFF3E3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
          <Animated.View style={[styles.headerTop, headerTopAnimatedStyle]}>
            <View style={styles.headerTitleRow}>
              <ThemedText style={styles.appName}>لييبر بيتزا</ThemedText>
              <View style={styles.totalCountBadge}>
                <ThemedText style={styles.totalCountText}>{totalProductsCount} وجبة</ThemedText>
              </View>
            </View>
            <View style={styles.welcomeUserRow}>
              <ThemedText style={styles.userGreet}>
                مرحباً، {user.displayName?.split(" ")[0] || "عميلنا"}
              </ThemedText>
            </View>
          </Animated.View>

          {/* Search Bar */}
          <Animated.View style={[styles.searchBarContainer, searchBarAnimatedStyle]}>
            <Feather name="search" size={16} color={C.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث عن وجبتك المفضلة..."
              placeholderTextColor={C.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </Animated.View>

          {/* Categories Horizontal Scroll */}
          <ScrollView
            ref={categoriesScrollRef}
            onContentSizeChange={() => {
              if (!hasScrolledRef.current) {
                categoriesScrollRef.current?.scrollToEnd({ animated: false });
                hasScrolledRef.current = true;
              }
            }}
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
                  onPress={() => handleCategoryPress(cat.key)}
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
      </Animated.View>
    </View>
  );
}

const CategorySection = React.memo(({ section }: { section: CategorySectionType }) => {
  const renderProductItem = useCallback(({ item }: { item: ProductType }) => {
    return <ProductCardWrapper product={item} />;
  }, []);

  const reversedProducts = useMemo(() => {
    return [...section.products].reverse();
  }, [section.products]);

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>
          {section.label} <ThemedText style={styles.sectionCount}>({section.products.length})</ThemedText>
        </ThemedText>
      </View>
      <FlatList
        data={reversedProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        horizontal
        inverted
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
});

const getProductMeta = (id: string) => {
  let charSum = 0;
  for (let i = 0; i < id.length; i++) {
    charSum += id.charCodeAt(i);
  }
  const rating = (4.2 + (charSum % 8) / 10).toFixed(1);
  const calories = 280 + (charSum % 25) * 10;
  return { rating, calories };
};

interface ProductCardProps {
  product: ProductType;
  quantity: number;
  onAddToCart: () => void;
  onUpdateQuantity: (newQty: number) => void;
}

const ProductCardInner = React.memo(({ product, quantity, onAddToCart, onUpdateQuantity }: ProductCardProps) => {
  const router = useRouter();

  const imageUrl =
    (product.p_imgs && product.p_imgs.length > 0 && product.p_imgs[0].url) ||
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300";
  const price = useMemo(() => parseFloat(product.p_cost as string) || 0, [product.p_cost]);
  const { rating, calories } = useMemo(() => getProductMeta(product.id), [product.id]);

  return (
    <View style={{ width: cardWidth }}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.cardContainer}
        onPress={() => {
          console.log("Press registered on ProductCard with id:", product.id);
          router.push({ pathname: "/product", params: { id: product.id } });
        }}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.productImage}
            contentFit="cover"
          />
          <View style={styles.categoryBadge}>
            <ThemedText style={styles.categoryBadgeText}>
              {LabelMap[product.p_cat] || product.p_cat}
            </ThemedText>
          </View>
        </View>

        <View style={styles.cardInfo}>
          <View style={{ gap: 4 }}>
            <ThemedText style={styles.productName} numberOfLines={1}>
              {product.p_name}
            </ThemedText>
            <View style={styles.cardMetaRow}>
              <View style={styles.cardMetaItem}>
                <Feather name="star" size={11} color="#FFB800" />
                <ThemedText style={styles.cardMetaText}>{rating}</ThemedText>
              </View>
              <View style={styles.cardMetaItem}>
                <Feather name="zap" size={11} color="#FF9800" />
                <ThemedText style={styles.cardMetaText}>{calories} سعرة</ThemedText>
              </View>
            </View>
            
            <ThemedText style={styles.productDescSnippet} numberOfLines={1}>
              {product.p_details || "وجبة شهية ومحضرة بعناية من أفضل المكونات الطازجة."}
            </ThemedText>
          </View>

          <View style={styles.cardActionRow}>
            <ThemedText style={styles.productPrice}>
              {price.toLocaleString()}{" "}
              <ThemedText style={styles.currencyText}>SDG</ThemedText>
            </ThemedText>

            <View>
              {quantity > 0 ? (
                <View style={styles.inlineQuantitySelector}>
                  <TouchableOpacity
                    style={styles.inlineActionBtn}
                    onPress={() => onUpdateQuantity(quantity - 1)}
                  >
                    <Feather name="minus" size={12} color={C.primary} />
                  </TouchableOpacity>
                  <Text style={styles.inlineQuantityLabel}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.inlineActionBtn}
                    onPress={() => onUpdateQuantity(quantity + 1)}
                  >
                    <Feather name="plus" size={12} color={C.primary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.inlineAddToCartBtn}
                  onPress={onAddToCart}
                >
                  <Feather name="shopping-cart" size={12} color={C.white} style={{ marginLeft: 4 }} />
                  <ThemedText style={styles.inlineAddToCartText}>أضف</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.quantity === nextProps.quantity &&
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.p_name === nextProps.product.p_name &&
    prevProps.product.p_cost === nextProps.product.p_cost &&
    prevProps.product.p_imgs?.[0]?.url === nextProps.product.p_imgs?.[0]?.url
  );
});

const ProductCardWrapper = React.memo(({ product }: { product: ProductType }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem?.p_qu || 0;

  const handleAddToCart = useCallback(() => {
    addToCart(product);
  }, [product, addToCart]);

  const handleUpdateQuantity = useCallback((newQty: number) => {
    updateQuantity(product.id, newQty);
  }, [product.id, updateQuantity]);

  return (
    <ProductCardInner
      product={product}
      quantity={quantity}
      onAddToCart={handleAddToCart}
      onUpdateQuantity={handleUpdateQuantity}
    />
  );
});
