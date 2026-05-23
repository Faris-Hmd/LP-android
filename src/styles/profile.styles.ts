import { StyleSheet } from "react-native";
import { AppColors, FontFamily, FontSize, Spacing, MaxContentWidth } from "@/constants/theme";

const C = AppColors;

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA", // Light premium background grey
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  scrollContent: {
    paddingTop: Spacing.three,
    paddingBottom: 120,
    gap: Spacing.three,
  },
  
  // Page Header
  pageHeader: {
    flexDirection: "row", // LTR visually so edit button is left, title is right
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: FontFamily.bold,
    color: C.textDark,
  },
  editBtnPage: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(179, 17, 17, 0.06)", // Soft red/pink tint
    justifyContent: "center",
    alignItems: "center",
  },

  // Bio Card
  bioCard: {
    marginHorizontal: Spacing.four,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.one,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 14, // Rounded square avatar
    borderWidth: 2,
    borderColor: C.border,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 14, // Rounded square placeholder
    backgroundColor: C.border,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: FontSize.h1,
    fontFamily: FontFamily.bold,
    color: C.textDark,
  },
  cogContainer: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.primary, // Red settings badge
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: C.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userName: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    color: C.textDark,
    textAlign: "center",
  },
  userEmail: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.semiBold,
    color: C.textMuted,
    marginTop: 2,
    textAlign: "center",
  },
  
  // Card Logout Button
  logoutBtnCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two + 2,
    marginTop: Spacing.two,
    gap: Spacing.one,
  },
  logoutBtnText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    color: C.textDark,
  },

  // 2x2 Stats Grid
  statsGrid: {
    marginHorizontal: Spacing.four,
    gap: Spacing.one + 2,
  },
  gridRow: {
    flexDirection: "row-reverse", // Arabic alignment RTL
    gap: Spacing.one + 2,
  },
  gridBox: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: C.white,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.two,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 2,
    gap: Spacing.half,
  },
  gridIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.half,
  },
  gridNumber: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    color: C.textDark,
  },
  gridLabel: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.bold,
    color: C.textMuted,
  },

  // Primary Address Card
  addressCard: {
    marginHorizontal: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    padding: Spacing.three,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
    gap: Spacing.one + 2,
  },
  addressHeader: {
    flexDirection: "row-reverse", // RTL Header row
    justifyContent: "space-between",
    alignItems: "center",
  },
  addressTitle: {
    fontSize: FontSize.sm + 1,
    fontFamily: FontFamily.bold,
    color: C.textMuted,
  },
  addressEditBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  addressBody: {
    flexDirection: "row-reverse", // RTL layout
    alignItems: "center",
    gap: Spacing.three,
  },
  addressPinContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(59, 130, 246, 0.08)", // Light blue tint
    justifyContent: "center",
    alignItems: "center",
  },
  addressTextContainer: {
    flex: 1,
    alignItems: "flex-end", // Align text right
  },
  addressMainText: {
    fontSize: FontSize.md - 1,
    fontFamily: FontFamily.bold,
    color: C.textDark,
    textAlign: "right",
    lineHeight: 20,
  },
  addressSubText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: C.textMuted,
    textAlign: "right",
    marginTop: 4,
  },

  // Edit Profile Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: C.white,
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: FontSize.h3,
    fontFamily: FontFamily.bold,
    color: C.textDark,
    textAlign: "right",
    marginBottom: Spacing.one,
  },
  form: {
    gap: Spacing.two,
  },
  label: {
    textAlign: "right",
    fontSize: FontSize.xs,
    fontFamily: FontFamily.semiBold,
    color: C.textDark,
    opacity: 0.8,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: Spacing.two + 2,
    textAlign: "right",
    fontSize: FontSize.md,
    color: C.textDark,
    backgroundColor: C.lightBg,
  },
  rowInputs: {
    flexDirection: "row-reverse",
    gap: Spacing.two,
  },
  modalSaveBtn: {
    backgroundColor: C.primary,
    paddingVertical: Spacing.three,
    borderRadius: 12,
    alignItems: "center",
    marginTop: Spacing.two,
  },
  modalSaveBtnText: {
    color: C.white,
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
  },
  modalCancelBtn: {
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: Spacing.three,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancelBtnText: {
    color: C.textMuted,
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
  },
  addressInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  addressInput: {
    flex: 1,
    marginBottom: 0,
  },
  mapPickerBtn: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: C.lightBg,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  mapWrapper: {
    flex: 1,
    position: "relative",
  },
  mapView: {
    ...StyleSheet.absoluteFillObject,
  },
  markerFixed: {
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: -20,
    marginTop: -40,
    alignItems: "center",
    justifyContent: "center",
  },
  gpsBtn: {
    position: "absolute",
    right: Spacing.four,
    top: Spacing.four,
    backgroundColor: C.white,
    padding: Spacing.three,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  mapOverlayCard: {
    position: "absolute",
    left: Spacing.four,
    right: Spacing.four,
    bottom: Spacing.six,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: Spacing.four,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  mapOverlayTitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    color: C.textDark,
    textAlign: "right",
    marginBottom: Spacing.one,
  },
  mapOverlayAddress: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: C.textDark,
    textAlign: "right",
    marginBottom: Spacing.three,
    lineHeight: 20,
  },
  mapConfirmBtn: {
    backgroundColor: C.primary,
    paddingVertical: Spacing.three,
    borderRadius: 12,
    alignItems: "center",
  },
  mapConfirmText: {
    color: C.white,
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
  },
});
