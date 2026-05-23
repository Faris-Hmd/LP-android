import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { AppColors, FontFamily, FontSize, Spacing } from "@/constants/theme";

const C = AppColors;
const { width } = Dimensions.get("window");

export type AlertType = "success" | "error" | "warning" | "info" | "confirm";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

export interface AlertOptions {
  title: string;
  message: string;
  type?: AlertType;
  buttons?: AlertButton[];
}

interface AlertContextData {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextData | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions | null>(null);

  // Animation values
  const scale = useRef(new Animated.Value(0.85)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const showAlert = (newOptions: AlertOptions) => {
    setOptions(newOptions);
    setVisible(true);
  };

  const hideAlert = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.85,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setOptions(null);
    });
  };

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleButtonPress = (btn: AlertButton) => {
    hideAlert();
    if (btn.onPress) {
      // Delay slightly to allow modal to close smoothly
      setTimeout(btn.onPress, 200);
    }
  };

  // Get icon and color based on alert type
  const getAlertIcon = (type: AlertType = "info") => {
    switch (type) {
      case "success":
        return {
          name: "check" as const,
          color: "#10B981",
          bgColor: "rgba(16, 185, 129, 0.1)",
        };
      case "error":
        return {
          name: "alert-triangle" as const,
          color: "#EF4444",
          bgColor: "rgba(239, 68, 68, 0.1)",
        };
      case "warning":
        return {
          name: "alert-circle" as const,
          color: "#F59E0B",
          bgColor: "rgba(245, 158, 11, 0.1)",
        };
      case "confirm":
        return {
          name: "help-circle" as const,
          color: C.primary,
          bgColor: "rgba(179, 17, 17, 0.1)",
        };
      case "info":
      default:
        return {
          name: "info" as const,
          color: "#3B82F6",
          bgColor: "rgba(59, 130, 246, 0.1)",
        };
    }
  };

  const currentType = options?.type || "info";
  const iconInfo = getAlertIcon(currentType);

  const buttons = options?.buttons || [{ text: "موافق", style: "default" }];

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={hideAlert}
      >
        <TouchableWithoutFeedback onPress={currentType !== "confirm" ? hideAlert : undefined}>
          <View style={styles.overlay}>
            <Animated.View
              style={[
                styles.backdrop,
                { opacity: backdropOpacity },
              ]}
            />
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.card,
                  {
                    transform: [{ scale }],
                    opacity: backdropOpacity,
                  },
                ]}
              >
                {/* Header Icon */}
                <View style={[styles.iconContainer, { backgroundColor: iconInfo.bgColor }]}>
                  <Feather name={iconInfo.name} size={28} color={iconInfo.color} />
                </View>

                {/* Title */}
                {options?.title ? (
                  <ThemedText style={styles.title}>{options.title}</ThemedText>
                ) : null}

                {/* Message */}
                {options?.message ? (
                  <ThemedText style={styles.message}>{options.message}</ThemedText>
                ) : null}

                {/* Buttons Container */}
                <View
                  style={[
                    styles.buttonContainer,
                    buttons.length > 2 ? styles.buttonContainerVertical : styles.buttonContainerHorizontal,
                  ]}
                >
                  {buttons.map((btn, index) => {
                    const isDestructive = btn.style === "destructive";
                    const isCancel = btn.style === "cancel";

                    let btnBg: string = C.primary;
                    let textColor: string = C.white;
                    let borderCol: string = "transparent";
                    let borderW = 0;

                    if (isDestructive) {
                      btnBg = "#EF4444";
                    } else if (isCancel) {
                      btnBg = C.white;
                      textColor = C.textMuted;
                      borderCol = C.border;
                      borderW = 1;
                    }

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.button,
                          {
                            backgroundColor: btnBg,
                            borderColor: borderCol,
                            borderWidth: borderW,
                            flex: buttons.length <= 2 ? 1 : undefined,
                          },
                        ]}
                        onPress={() => handleButtonPress(btn)}
                      >
                        <ThemedText style={[styles.buttonText, { color: textColor }]}>
                          {btn.text}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.45)", // Slate-900 transparent color for premium look
  },
  card: {
    width: width * 0.85,
    maxWidth: 340,
    backgroundColor: C.white,
    borderRadius: 24,
    padding: Spacing.four,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.02)",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    color: C.textDark,
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  message: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.four,
    paddingHorizontal: Spacing.one,
  },
  buttonContainer: {
    width: "100%",
    gap: Spacing.two,
  },
  buttonContainerHorizontal: {
    flexDirection: "row-reverse", // RTL visually for Arabic layout (OK on right/first, Cancel on left)
  },
  buttonContainerVertical: {
    flexDirection: "column",
  },
  button: {
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.two,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  buttonText: {
    fontSize: FontSize.md - 1,
    fontFamily: FontFamily.bold,
  },
});
