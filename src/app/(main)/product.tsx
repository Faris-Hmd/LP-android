import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import Animated, { FadeInDown, FadeIn, SharedTransition } from "react-native-reanimated";

const customTransition = SharedTransition.duration(150);

const AnimatedImage = Animated.createAnimatedComponent(Image);
import { Spacing, AppColors } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { getProducts, getCachedProductById } from "@/services/productService";

const { width } = Dimensions.get("window");

const LIGHT_BG = "#F9FAFB";
const PRIMARY = AppColors.primary;
const WHITE = "#FFFFFF";
const TEXT_DARK = "#1F2937";
const TEXT_MUTED = "#6B7280";
const BORDER_COLOR = "#E5E7EB";
const BG_ELEMENT = "#F3F4F6";

const LabelMap: Record<string, string> = {
  PC: "بيتزا",
  BG: "برجر",
  DN: "دونات",
};

const getDummyDetails = (cat: string, name: string) => {
  switch (cat) {
    case "PC":
      return {
        time: "15-20 دقيقة",
        calories: "380 سعرة",
        rating: "4.8",
        reviews: "112 تقييم",
        description: `بيتزا ${name} محضرة على الطريقة الإيطالية الأصيلة بعجينة هشة وصلصة الطماطم الغنية مع طبقة سخية من جبنة الموزاريلا الفاخرة المخبوزة في فرن الحطب الحار.`,
        ingredients: ["عجين طازج", "جبنة موزاريلا", "صلصة طماطم", "ريحان طازج", "زيت زيتون"],
      };
    case "BG":
      return {
        time: "10-15 دقيقة",
        calories: "450 سعرة",
        rating: "4.9",
        reviews: "84 تقييم",
        description: `برجر ${name} محضر من لحم البقر الطازج والمشوي ببطء، يقدم في خبز البريوش الطري مع الجبن السائل الذائب، الخس المقرمش، شرائح الطماطم الطازجة، وصلصتنا السرية المميزة.`,
        ingredients: ["لحم بقري طازج", "خبز بريوش", "جبنة شيدر ذائبة", "خس وطماطم", "صلصة سرية"],
      };
    case "DN":
      return {
        time: "5-10 دقيقة",
        calories: "280 سعرة",
        rating: "4.7",
        reviews: "63 تقييم",
        description: `حلوى ${name} الهشة واللذيذة، مغطاة بطبقة غنية من الشوكولاتة الفاخرة أو الكريمة الطازجة مع حبيبات السكر الملونة، مثالية مع قهوتك الصباحية أو كتحلية خفيفة.`,
        ingredients: ["دقيق فاخر", "سكر بلوري", "شوكولاتة بلجيكية", "كريمة طازجة", "فانيليا طبيعية"],
      };
    default:
      return {
        time: "12-18 دقيقة",
        calories: "320 سعرة",
        rating: "4.8",
        reviews: "45 تقييم",
        description: `وجبة ${name} الشهية والمحضرة بعناية فائقة من أفضل المكونات الطازجة لتقديم مذاق لا ينسى وتجربة طعام استثنائية تناسب ذوقك الرفيع.`,
        ingredients: ["مكونات طازجة", "بهارات خاصة", "أعشاب عطرية", "زيت نباتي"],
      };
  }
};

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { cart, addToCart, updateQuantity } = useCart();
  const insets = useSafeAreaInsets();

  const targetId = Array.isArray(id) ? id[0] : id;
  
  // Try to retrieve the product synchronously from memory cache
  const cachedProduct = targetId ? getCachedProductById(targetId) : undefined;

  const [fetchedProduct, setFetchedProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(!cachedProduct);

  // Derive the active product. Prioritize the cached version for instantaneous updates,
  // falling back to fetchedProduct when loading from network.
  const product = cachedProduct || fetchedProduct;

  useEffect(() => {
    // If the ID changed, make sure we clear any previous fetched product state
    setFetchedProduct(null);

    if (!targetId) {
      setLoading(false);
      return;
    }

    // If the product is already loaded from cache, we don't need to fetch it
    if (cachedProduct) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getProducts()
      .then((items) => {
        const found = items.find((p) => p.id === targetId);
        if (found) {
          setFetchedProduct(found);
        } else {
          console.warn("Product not found for ID:", targetId);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading product detail:", error);
        setLoading(false);
      });
  }, [targetId, cachedProduct]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <ThemedText style={styles.loaderText}>جاري تحميل التفاصيل...</ThemedText>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loaderContainer}>
        <ThemedText style={styles.loaderText}>المنتج غير متوفر أو غير موجود.</ThemedText>
        <TouchableOpacity 
          style={{
            marginTop: 16,
            paddingVertical: 10,
            paddingHorizontal: 20,
            backgroundColor: PRIMARY,
            borderRadius: 8,
          }} 
          onPress={() => router.back()}
        >
          <ThemedText style={{ color: WHITE, fontFamily: "Cairo-Bold" }}>العودة</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const cartItem = cart.find((c) => c.id === product.id);
  const quantityInCart = cartItem?.p_qu || 0;
  const price = parseFloat(product.p_cost as string) || 0;
  const imageUrl =
    (product.p_imgs && product.p_imgs.length > 0 && product.p_imgs[0].url) ||
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600";

  const details = getDummyDetails(product.p_cat, product.p_name);

  return (
    <View style={styles.container}>
      {/* Dynamic Header overlays at the very top */}
      <SafeAreaView style={styles.headerSafeArea} pointerEvents="box-none">
        <View style={styles.topHeaderActionRow}>
          <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
            <Feather name="arrow-right" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.backIconButton}>
            <Feather name="heart" size={22} color={PRIMARY} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Cover Image */}
        <View style={[styles.imageContainer, { backgroundColor: LIGHT_BG }]}>
          <AnimatedImage
            sharedTransitionTag={`img-${product.id}`}
            sharedTransitionStyle={customTransition}
            source={{ uri: imageUrl }}
            style={styles.coverImage}
            contentFit="cover"
          />
          <View style={styles.imageOverlay} />
        </View>

        {/* Details Content Overlapping Card */}
        <Animated.View
          key={product.id}
          style={styles.detailsCard}
          entering={FadeInDown.duration(150)}
        >
          {/* Category Indicator */}
          <View style={styles.badgeRow}>
            <View style={styles.categoryChip}>
              <ThemedText style={styles.categoryChipText}>
                {LabelMap[product.p_cat] || product.p_cat}
              </ThemedText>
            </View>
            {/* Rating */}
            <View style={styles.ratingBox}>
              <Feather name="star" size={14} color="#F59E0B" />
              <ThemedText style={styles.ratingText}>{details.rating}</ThemedText>
              <ThemedText style={styles.reviewsText}>({details.reviews})</ThemedText>
            </View>
          </View>

          {/* Title & Price */}
          <View style={styles.titlePriceRow}>
            <ThemedText style={styles.productName}>{product.p_name}</ThemedText>
            <ThemedText style={styles.productPrice}>{price.toLocaleString()} جنية</ThemedText>
          </View>


          {/* Preparation Details Badges */}
          <View style={styles.specificationsRow}>
            <View style={styles.specBadge}>
              <Feather name="clock" size={14} color={TEXT_MUTED} />
              <ThemedText style={styles.specText}>{details.time}</ThemedText>
            </View>
            <View style={styles.specBadge}>
              <Feather name="zap" size={14} color={TEXT_MUTED} />
              <ThemedText style={styles.specText}>{details.calories}</ThemedText>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>الوصف</ThemedText>
            <ThemedText style={styles.descriptionText}>{details.description}</ThemedText>
          </View>

          {/* Ingredients */}
          <View style={[styles.section, { marginBottom: 120 }]}>
            <ThemedText style={styles.sectionTitle}>المكونات الأساسية</ThemedText>
            <View style={styles.ingredientsContainer}>
              {details.ingredients.map((ing, i) => (
                <View key={i} style={styles.ingredientBadge}>
                  <ThemedText style={styles.ingredientText}>{ing}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Cart Action Bar */}
      <Animated.View
        key={`bottom-${product.id}`}
        style={[styles.bottomBarContainer, { paddingBottom: 16 }]}
        entering={FadeInDown.delay(30).duration(150)}
      >
        {quantityInCart > 0 ? (
          <View style={styles.bottomBarRow}>
            {/* Remove Button */}
            <TouchableOpacity
              style={styles.removeCartBtn}
              onPress={() => updateQuantity(product.id, 0)}
            >
              <Feather name="trash-2" size={16} color={PRIMARY} />
              <ThemedText style={styles.removeCartBtnText}>إزالة</ThemedText>
            </TouchableOpacity>

            {/* Quantity Selector */}
            <View style={styles.actionQuantityWrapper}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => updateQuantity(product.id, quantityInCart + 1)}
              >
                <Feather name="plus" size={12} color={PRIMARY} />
              </TouchableOpacity>
              <ThemedText style={styles.quantityLabel}>{quantityInCart}</ThemedText>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => updateQuantity(product.id, quantityInCart - 1)}
              >
                <Feather name="minus" size={12} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={() => addToCart(product)}
          >
            <ThemedText style={styles.addToCartBtnText}>
              إضافة إلى السلة <Feather name="shopping-bag" size={16} />
            </ThemedText>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: WHITE,
  },
  loaderText: {
    marginTop: Spacing.two,
    fontFamily: "Cairo-Medium",
    color: TEXT_MUTED,
  },
  headerSafeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  topHeaderActionRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: LIGHT_BG,
  },
  imageContainer: {
    width: "100%",
    height: 320,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  detailsCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -30,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 5,
  },
  badgeRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryChip: {
    backgroundColor: "rgba(229, 62, 98, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryChipText: {
    color: PRIMARY,
    fontFamily: "Cairo-Bold",
    fontSize: 12,
  },
  ratingBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontFamily: "Cairo-Bold",
    fontSize: 13,
    color: TEXT_DARK,
  },
  reviewsText: {
    fontSize: 10,
    color: TEXT_MUTED,
  },
  titlePriceRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productName: {
    fontSize: 22,
    fontFamily: "Cairo-Bold",
    color: TEXT_DARK,
    textAlign: "right",
    flex: 1,
    marginLeft: 12,
  },
  productPrice: {
    fontSize: 20,
    fontFamily: "Cairo-Bold",
    color: PRIMARY,
  },
  specificationsRow: {
    flexDirection: "row-reverse",
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    paddingBottom: 16,
  },
  specBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: BG_ELEMENT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  specText: {
    fontSize: 12,
    fontFamily: "Cairo-SemiBold",
    color: TEXT_DARK,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Cairo-Bold",
    color: TEXT_DARK,
    textAlign: "right",
  },
  descriptionText: {
    fontSize: 13,
    fontFamily: "Cairo-Regular",
    color: TEXT_MUTED,
    lineHeight: 22,
    textAlign: "right",
  },
  ingredientsContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  ingredientBadge: {
    backgroundColor: BG_ELEMENT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ingredientText: {
    fontSize: 11,
    fontFamily: "Cairo-Medium",
    color: TEXT_DARK,
  },
  bottomBarRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  removeCartBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  removeCartBtnText: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    color: PRIMARY,
  },
  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: WHITE,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  addToCartBtn: {
    backgroundColor: PRIMARY,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addToCartBtnText: {
    color: WHITE,
    fontSize: 16,
    fontFamily: "Cairo-Bold",
  },
  actionQuantityWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_ELEMENT,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    gap: 8,
    height: 36,
  },
  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: WHITE,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  quantityLabel: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    color: TEXT_DARK,
    marginHorizontal: 10,
    minWidth: 20,
    textAlign: "center",
  },
});
