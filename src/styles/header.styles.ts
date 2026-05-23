import { StyleSheet } from "react-native";
import { AppColors, FontFamily, FontSize, Spacing } from "@/constants/theme";

const C = AppColors;

export const headerStyles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: Spacing.three,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: C.white,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 3,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
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
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    color: C.primary,
    lineHeight: 22,
  },
  headerTextGroup: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  appSubtitle: {
    fontSize: 9,
    fontFamily: FontFamily.medium,
    color: C.textMuted,
    lineHeight: 12,
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
});
