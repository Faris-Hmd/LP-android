import React, { useEffect, useState, useRef } from "react";
import {
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";

import { ThemedText } from "@/components/themed-text";
import { AppColors } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { subscribeToAuthChanges } from "@/services/authService";
import { headerStyles as styles } from "@/styles/header.styles";

const C = AppColors;

export default function AppHeader() {
  const router = useRouter();
  const { searchQuery, setSearchQuery, isSearchActive, setIsSearchActive } = useCart();
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const searchInputRef = useRef<TextInput>(null);

  // Subscribe to auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((usr) => {
      setUser(usr);
    });
    return unsubscribe;
  }, []);

  // Autofocus input when search becomes active
  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchActive]);

  // Hide header if user is not logged in (e.g. login screen)
  if (!user) {
    return null;
  }

  const handleSearchPress = () => {
    setIsSearchActive(true);
    // Switch to Home screen where the filtered product list lives
    router.replace("/");
  };

  const handleCloseSearch = () => {
    setSearchQuery("");
    setIsSearchActive(false);
  };

  return (
    <View style={styles.headerContainer}>
      <SafeAreaView edges={["top"]} style={{ paddingBottom: 0 }}>
        {isSearchActive ? (
          <View style={styles.headerSearchActiveRow}>
            {/* Profile Avatar (Left) */}
            <TouchableOpacity
              onPress={() => {
                setIsSearchActive(false);
                router.navigate("/profile");
              }}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150" }}
                style={styles.userAvatar}
                contentFit="cover"
              />
            </TouchableOpacity>

            {/* Search input container (Center) */}
            <View style={styles.headerSearchActiveInputContainer}>
              <TextInput
                ref={searchInputRef}
                style={styles.headerSearchActiveInput}
                placeholder="ابحث عن وجبتك المفضلة..."
                placeholderTextColor={C.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
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
              onPress={handleCloseSearch}
              style={styles.headerSearchIconBtn}
            >
              <Feather name="arrow-right" size={20} color={C.textDark} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.headerTop}>
            {/* Profile Pic, Search & Theme toggle (Left) */}
            <View style={styles.headerLeftSide}>
              <TouchableOpacity
                onPress={() => router.navigate("/profile")}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150" }}
                  style={styles.userAvatar}
                  contentFit="cover"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerSearchIconBtn}
                onPress={handleSearchPress}
                activeOpacity={0.7}
              >
                <Feather name="search" size={18} color={C.textDark} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerSearchIconBtn}
                activeOpacity={0.7}
              >
                <Feather name="sun" size={18} color={C.textDark} />
              </TouchableOpacity>
            </View>

            {/* App Logo & App Name (Right) */}
            <View style={styles.headerRightSide}>
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.headerLogo}
                contentFit="contain"
              />
              <View style={styles.headerTextGroup}>
                <ThemedText style={styles.appName}>ليبير بيتزا</ThemedText>
                <ThemedText style={styles.appSubtitle}>مطعم بيتزا</ThemedText>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
