


import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAlert } from "@/context/AlertContext";
import { AppColors, Spacing } from "@/constants/theme";
import { getCurrentUser } from "@/services/authService";
import { getDriverById, getUserOrders } from "@/services/orderService";
import { ordersStyles as styles } from "@/styles/orders.styles";
import { DriverType, OrderType } from "@/types";

const C = AppColors;

// ─── Helper component: single order card ─────────────────────────────────────
const OrderCard = React.memo(({ order }: { order: OrderType }) => {
  const { showAlert } = useAlert();
  const [driver, setDriver] = useState<DriverType | null>(null);
  const [loadingDriver, setLoadingDriver] = useState(false);

  useEffect(() => {
    if (!order.driverId) {
      setDriver(null);
      return;
    }
    setLoadingDriver(true);
    getDriverById(order.driverId)
      .then(setDriver)
      .catch((e) => console.error("Error fetching driver info:", e))
      .finally(() => setLoadingDriver(false));
  }, [order.driverId]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Processing":
        return {
          bg: "rgba(245,158,11,0.1)",
          color: "#D97706",
          label: "قيد التحضير",
        };
      case "Shipped":
        return {
          bg: "rgba(59,130,246,0.1)",
          color: "#2563EB",
          label: "في الطريق",
        };
      case "Delivered":
        return {
          bg: "rgba(16,185,129,0.1)",
          color: "#059669",
          label: "تم التوصيل",
        };
      case "Cancelled":
        return { bg: "rgba(239,68,68,0.1)", color: "#DC2626", label: "ملغي" };
      default:
        return { bg: "rgba(107,114,128,0.1)", color: "#4B5563", label: status };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const formattedDate = new Date(order.createdAt).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleCall = (phone: string) =>
    Linking.openURL(`tel:${phone}`).catch(() =>
      showAlert({
        title: "خطأ",
        message: "لا يمكن إجراء الاتصال.",
        type: "error",
      }),
    );

  const handleWhatsApp = (phone: string) =>
    Linking.openURL(`https://wa.me/${phone.replace(/\+/g, "")}`).catch(() =>
      showAlert({
        title: "خطأ",
        message: "لا يمكن فتح تطبيق WhatsApp.",
        type: "error",
      }),
    );

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
        >
          <ThemedText
            style={[styles.statusText, { color: statusConfig.color }]}
          >
            {statusConfig.label}
          </ThemedText>
        </View>
        <ThemedText style={styles.orderId}>
          #{order.id.slice(-6).toUpperCase()}
        </ThemedText>
      </View>

      <ThemedText style={styles.orderDate}>{formattedDate}</ThemedText>
      <View style={styles.divider} />

      <View style={styles.productsList}>
        {order.productsList?.map((product: any, index: number) => (
          <View key={`${order.id}-prod-${index}`} style={styles.productRow}>
            <ThemedText style={styles.productPrice}>
              {(
                (parseFloat(product.p_cost) || 0) * (product.p_qu || 1)
              ).toLocaleString()}{" "}
              جنية
            </ThemedText>
            <ThemedText style={styles.productName}>
              {product.p_name} {product.p_qu > 1 ? `x${product.p_qu}` : ""}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.divider} />
      <View style={styles.totalRow}>
        <ThemedText style={styles.totalValue}>
          {order.totalAmount?.toLocaleString()} جنية
        </ThemedText>
        <ThemedText style={styles.totalLabel}>المجموع الكلي:</ThemedText>
      </View>

      {order.driverId && (
        <View style={styles.driverCard}>
          {loadingDriver ? (
            <ActivityIndicator size="small" color={C.primary} />
          ) : driver ? (
            <View style={styles.driverInfoContainer}>
              <View style={styles.driverActions}>
                <TouchableOpacity
                  style={[styles.driverBtn, styles.callBtn]}
                  onPress={() => handleCall(driver.phone)}
                >
                  <ThemedText style={styles.driverBtnText}>اتصال</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.driverBtn, styles.waBtn]}
                  onPress={() => handleWhatsApp(driver.phone)}
                >
                  <ThemedText style={styles.driverBtnText}>واتساب</ThemedText>
                </TouchableOpacity>
              </View>
              <View style={styles.driverTextContainer}>
                <ThemedText style={styles.driverName}>{driver.name}</ThemedText>
                <ThemedText style={styles.driverVehicle}>
                  المندوب • {driver.vehicle}
                </ThemedText>
              </View>
            </View>
          ) : (
            <ThemedText style={styles.driverWaiting}>
              تم تعيين المندوب (بانتظار التفاصيل)
            </ThemedText>
          )}
        </View>
      )}
    </View>
  );
});

// ─── Main Orders Screen ───────────────────────────────────────────────────────
export default function OrdersScreen() {
  const user = getCurrentUser();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<"active" | "completed">(
    "active",
  );

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getUserOrders(user.email!)
      .then(setOrders)
      .catch((e) => console.error("Error listing orders:", e))
      .finally(() => setLoading(false));
  }, [user]);

  const filteredOrders = orders.filter((order) =>
    selectedFilter === "active"
      ? order.status === "Processing" || order.status === "Shipped"
      : order.status === "Delivered" || order.status === "Cancelled",
  );

  const renderItem = useCallback(({ item }: { item: OrderType }) => (
    <OrderCard order={item} />
  ), []);

  const keyExtractor = useCallback((item: OrderType) => item.id, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={[styles.mainContent, styles.centered]}>
          <ActivityIndicator size="large" color={C.primary} />
          <ThemedText style={{ marginTop: Spacing.two, color: C.textMuted }}>
            جاري تحميل الطلبات...
          </ThemedText>
        </View>
      ) : (
        <View style={styles.mainContent}>
          <View style={styles.filterBar}>
            {(["active", "completed"] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterBtn,
                  {
                    backgroundColor:
                      selectedFilter === f ? C.primary : C.border,
                  },
                ]}
                onPress={() => setSelectedFilter(f)}
              >
                <ThemedText
                  style={[
                    styles.filterText,
                    { color: selectedFilter === f ? C.white : C.textDark },
                  ]}
                >
                  {f === "active" ? "الطلبات النشطة" : "المنتهية والملغاة"}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={filteredOrders}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  لا توجد طلبات في هذا القسم حالياً.
                </ThemedText>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
}
