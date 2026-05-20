import { StyleSheet } from "react-native";
import { AppColors, FontFamily, FontSize, Spacing, MaxContentWidth } from "@/constants/theme";

const C = AppColors;

export const profileStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.lightBg },
  centered: { justifyContent: "center", alignItems: "center" },
  safeArea: { flex: 1, maxWidth: MaxContentWidth, width: "100%", alignSelf: "center" },
  header: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, alignItems: "flex-end" },
  headerTitle: { fontSize: FontSize.h3, fontFamily: FontFamily.bold, color: C.textDark },
  scrollContent: { paddingBottom: 110, gap: Spacing.four },
  bioCard: { marginHorizontal: Spacing.four, borderRadius: 16, paddingVertical: Spacing.four, alignItems: "center", borderWidth: 1, borderColor: C.border, backgroundColor: C.white, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: Spacing.two, borderWidth: 2, borderColor: C.border },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.border, justifyContent: "center", alignItems: "center", marginBottom: Spacing.two },
  avatarInitial: { fontSize: FontSize.h2, fontFamily: FontFamily.bold, color: C.textDark },
  userName: { fontSize: FontSize.xl, fontFamily: FontFamily.bold, color: C.textDark },
  userEmail: { fontSize: FontSize.xs, color: C.textMuted, marginTop: 2 },
  statsContainer: { flexDirection: "row-reverse", marginHorizontal: Spacing.four, gap: Spacing.two },
  statBox: { flex: 1, paddingVertical: Spacing.two + 2, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: C.border, backgroundColor: C.white, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1, gap: Spacing.half },
  statNumber: { fontSize: FontSize.xxl, fontFamily: FontFamily.bold, color: C.primary },
  statLabel: { fontSize: FontSize.xs, fontFamily: FontFamily.bold, color: C.textMuted },
  formCard: { marginHorizontal: Spacing.four, borderRadius: 16, padding: Spacing.three + 2, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  formTitle: { textAlign: "right", fontSize: FontSize.base, fontFamily: FontFamily.bold, color: C.textDark, marginBottom: Spacing.two },
  form: { gap: Spacing.two },
  label: { textAlign: "right", fontSize: FontSize.xs, fontFamily: FontFamily.semiBold, color: C.textDark, opacity: 0.8 },
  input: { height: 44, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: Spacing.two + 2, textAlign: "right", fontSize: FontSize.md, color: C.textDark, backgroundColor: C.lightBg },
  rowInputs: { flexDirection: "row-reverse" },
  saveBtn: { backgroundColor: C.primary, paddingVertical: Spacing.three, borderRadius: 12, alignItems: "center", marginTop: Spacing.two },
  saveBtnText: { color: C.white, fontSize: FontSize.md, fontFamily: FontFamily.bold },
  signOutBtn: { marginHorizontal: Spacing.four, borderWidth: 1.5, borderColor: C.danger, backgroundColor: "rgba(220, 38, 38, 0.04)", paddingVertical: Spacing.three, borderRadius: 12, alignItems: "center" },
  signOutText: { color: C.danger, fontSize: FontSize.md, fontFamily: FontFamily.bold },
});
