import { StyleSheet, Dimensions } from "react-native";
import { AppColors, FontFamily, FontSize, Spacing } from "@/constants/theme";

const { width } = Dimensions.get("window");
export const cardWidth = 200; // Optimized card width for horizontal scrolling
export const featuredCardWidth = 280; // Larger card width for featured items

const C = AppColors;

export const indexStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6", // Cream/soft white premium background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF9F6",
  },
  
  // ─── Header Section ────────────────────────────────────────────────────────
  headerContainer: {
    paddingHorizontal: Spacing.three,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: C.white,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 3,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRightSide: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  appName: {
    fontSize: FontSize.h2,
    fontFamily: FontFamily.bold,
    color: C.primary,
  },
  headerLeftSide: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  headerSearchIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.bgElement,
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.primary,
  },
  headerSearchActiveRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  headerSearchActiveInputContainer: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: C.bgElement,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    marginRight: 10,
    marginLeft: 10,
  },
  headerSearchActiveInput: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    textAlign: "right",
    color: C.textDark,
    paddingVertical: 0,
  },

  // ─── Welcome Card ───────────────────────────────────────────────────────────
  welcomeCardContainer: {
    marginHorizontal: Spacing.three,
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  welcomeCardGradient: {
    padding: 16,
  },
  welcomeCardContent: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeTextColumn: {
    alignItems: "flex-end",
  },
  welcomeCardGreet: {
    fontSize: FontSize.xs,
    color: C.textMuted,
    fontFamily: FontFamily.medium,
  },
  welcomeCardName: {
    fontSize: FontSize.lg,
    color: C.textDark,
    fontFamily: FontFamily.bold,
    marginTop: 2,
  },
  welcomePointsColumn: {
    alignItems: "flex-start",
  },
  welcomePointsLabel: {
    fontSize: FontSize.xxs,
    color: "#D97706",
    fontFamily: FontFamily.medium,
    marginBottom: 4,
  },
  welcomePointsRow: {
    flexDirection: "row-reverse",
    alignItems: "baseline",
    gap: 4,
  },
  welcomePointsValue: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    color: "#D97706",
  },
  welcomePointsUnit: {
    fontSize: FontSize.xxs,
    fontFamily: FontFamily.medium,
    color: "#D97706",
  },

  // ─── Promotional Carousel ──────────────────────────────────────────────────
  promoContainer: {
    marginVertical: Spacing.three,
  },
  promoList: {
    flexDirection: "row-reverse",
    paddingHorizontal: Spacing.three,
    gap: 12,
  },
  promoCard: {
    width: width - 48,
    height: 120,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  promoGradient: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  promoInfo: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  promoBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  promoBadgeText: {
    color: C.white,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxs,
  },
  promoTitle: {
    color: C.white,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    textAlign: "right",
  },
  promoSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    textAlign: "right",
    marginTop: 2,
  },
  promoImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },

  // ─── Category Chips ────────────────────────────────────────────────────────
  categoriesContainer: {
    marginBottom: Spacing.two,
  },
  categoriesScroll: {
    flexDirection: "row-reverse",
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  categoryChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryChipSelected: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  categoryText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    color: C.textDark,
  },
  categoryTextSelected: {
    color: C.white,
  },

  // ─── Sections ──────────────────────────────────────────────────────────────
  sectionContainer: {
    marginBottom: Spacing.four,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    color: C.textDark,
  },
  sectionCount: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    color: C.textMuted,
  },
  sectionLink: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    color: C.primary,
  },
  horizontalList: {
    flexDirection: "row-reverse",
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    gap: 12,
  },

  // ─── Featured Cards ("الأكثر طلباً") ───────────────────────────
  featuredCard: {
    width: featuredCardWidth,
    backgroundColor: C.white,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredImageWrapper: {
    width: "100%",
    height: 160,
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  featuredBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredBadgeText: {
    fontSize: FontSize.xxs,
    fontFamily: FontFamily.bold,
    color: C.primary,
  },
  featuredMetaContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    flexDirection: "row-reverse",
    gap: 6,
  },
  featuredMetaItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 2,
  },
  featuredMetaText: {
    fontSize: 10,
    fontFamily: FontFamily.medium,
    color: C.white,
  },
  featuredInfo: {
    padding: 14,
    gap: 10,
  },
  featuredName: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    color: C.textDark,
    textAlign: "right",
  },
  featuredDesc: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: C.textMuted,
    textAlign: "right",
    lineHeight: 18,
  },
  featuredActionRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },

  // ─── Standard Product Cards ────────────────────────────────────────────────
  verticalListContainer: {
    paddingHorizontal: Spacing.three,
    gap: 16,
  },
  cardContainer: {
    width: "100%",
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressableArea: {
    flexDirection: "row-reverse",
    gap: 14,
    width: "100%",
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: C.bgElement,
    position: "relative",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontFamily: FontFamily.bold,
    color: C.primary,
  },
  cardInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: FontSize.base,
    fontFamily: FontFamily.bold,
    color: C.textDark,
    textAlign: "right",
  },
  cardMetaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    marginTop: 2,
  },
  cardMetaItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 3,
  },
  cardMetaText: {
    fontSize: 10,
    fontFamily: FontFamily.medium,
    color: C.textMuted,
  },
  productDescSnippet: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: C.textMuted,
    textAlign: "right",
    lineHeight: 16,
    marginTop: 4,
  },
  cardActionRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  productPrice: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    color: C.textDark,
  },
  currencyText: {
    fontSize: FontSize.xs,
    color: C.primary,
    fontFamily: FontFamily.bold,
  },

  // ─── Button & Counter Styling ──────────────────────────────────────────────
  inlineAddToCartBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
    paddingHorizontal: 16,
    borderRadius: 10,
    height: 38,
    gap: 4,
  },
  inlineAddToCartText: {
    fontSize: 12,
    fontFamily: FontFamily.bold,
    color: C.white,
  },
  inlineQuantitySelector: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: C.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    height: 38,
  },
  inlineActionBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  inlineQuantityLabel: {
    fontSize: FontSize.base,
    fontFamily: FontFamily.bold,
    color: C.primary,
    minWidth: 20,
    textAlign: "center",
    marginHorizontal: 4,
  },

  // ─── Empty & Error States ──────────────────────────────────────────────────
  emptyListContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: Spacing.two,
  },
  emptyListText: {
    color: C.textMuted,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    textAlign: "center",
  },

  // ─── Login Screen ──────────────────────────────────────────────────────────
  loginContainer: {
    flex: 1,
    backgroundColor: C.white,
  },
  loginSafeArea: {
    flex: 1,
  },
  loginContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.five,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing.six,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.two,
  },
  brandTitle: {
    fontSize: FontSize.h1,
    fontFamily: FontFamily.bold,
    color: C.primary,
  },
  brandSubtitle: {
    fontSize: FontSize.md,
    color: C.textMuted,
    fontFamily: FontFamily.medium,
    marginTop: 2,
  },
  loginFormCard: {
    width: "100%",
    backgroundColor: C.lightBg,
    borderRadius: 24,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 4,
  },
  welcomeText: {
    fontSize: FontSize.h2,
    fontFamily: FontFamily.bold,
    color: C.textDark,
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  welcomeDesc: {
    fontSize: FontSize.sm,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.five,
  },
  googleLoginBtn: {
    flexDirection: "row-reverse",
    backgroundColor: C.primary,
    width: "100%",
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  googleLoginBtnText: {
    color: C.white,
    fontSize: FontSize.base,
    fontFamily: FontFamily.bold,
  },
});
