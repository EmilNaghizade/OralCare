// frontend/app/notifications.jsx (update your existing notifications screen)
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Typo from "../components/Typo";
import BackButton from "../components/BackButton";
import { useAuth } from "./_layout";
import { notificationApi } from "../services/api";

export default function NotificationsScreen() {
  const router = useRouter();
  const { authToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fetch notifications function
  const fetchNotifications = async (pageNum = 1, shouldRefresh = false) => {
    if (shouldRefresh) setRefreshing(true);
    if (pageNum === 1) setLoading(true);

    try {
      const data = await notificationApi.getNotifications(authToken, pageNum);

      const notificationsList = data.notifications || [];

      if (pageNum === 1) {
        setNotifications(notificationsList);
      } else {
        setNotifications((prev) => [...prev, ...notificationsList]);
      }

      setUnreadCount(data.unreadCount || 0);
      setHasMore(notificationsList.length > 0 && pageNum < data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      if (shouldRefresh) setRefreshing(false);
    }
  };

  // Mark as read function
  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(authToken, id);

      // Update local state to mark notification as read
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead(authToken);

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Handle notification click - navigate to appropriate content
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    if (notification.contentId) {
      switch (notification.type) {
        case "video":
          router.push(`/(modal)/video/${notification.contentId}`); // Navigate to specific video
          break;
        case "article":
          router.push({
            pathname: `/(modal)/article/${notification.contentId}`,
            params: { type: "article", activeTab: "Articles" },
          });
          break;
        case "news":
          router.push({
            pathname: `/(modal)/article/${notification.contentId}`,
            params: { type: "news", activeTab: "News" },
          });
          break;
        case "product":
          // For products, we'll still go to the products page as there may not be a detail view
          router.push("/(tabs)/products");
          break;
        case "quiz":
          router.push({
            pathname: `/quiz`,
            params: { id: notification.contentId }
          });
          break;
        default:
          router.push("/(tabs)/home");
          break;
      }
    } else {
      // Fallback to section pages if no contentId (for backward compatibility)
      switch (notification.type) {
        case "video":
          router.push("/education");
          break;
        case "article":
          router.push({
            pathname: "/knowledge",
            params: { activeTab: "Articles" },
          });
          break;
        case "news":
          router.push({
            pathname: "/knowledge",
            params: { activeTab: "News" },
          });
          break;
        case "product":
          router.push("/(tabs)/products");
          break;
        case "quiz":
          router.push({
            pathname: "/(tabs)/home",
          });
          break;
        default:
          router.push("/(tabs)/home");
          break;
      }
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "video":
        return "videocam-outline";
      case "article":
        return "document-text-outline";
      case "news":
        return "newspaper-outline";
      case "product":
        return "cube-outline";
      case "quiz":
        return "help-circle-outline";
      default:
        return "notifications-outline";
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffMs = now - notifDate;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    return notifDate.toLocaleDateString();
  };

  // Render each notification item
  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => handleNotificationClick(item)}
    >
      {/* Unread dot indicator */}
      {!item.read && <View style={styles.unreadDot} />}

      <Ionicons
        name={getNotificationIcon(item.type)}
        size={28}
        color={!item.read ? "#038565" : "#555"}
        style={styles.notificationIcon}
      />

      <View style={styles.notificationTextContainer}>
        <Typo
          style={[styles.notificationTitle, !item.read && styles.unreadText]}
        >
          {item.message}
        </Typo>
        <Typo style={styles.notificationTimestamp}>
          {formatTimestamp(item.createdAt)}
        </Typo>
      </View>

      <Ionicons
        name="chevron-forward-outline"
        size={18}
        color="#aaa"
        style={styles.chevronIcon}
      />
    </TouchableOpacity>
  );

  // Empty notifications view
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
      <Typo style={styles.emptyText}>You have no notifications yet.</Typo>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackButton />

      <Stack.Screen
        options={{
          title: "Notifications",
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />

      <StatusBar barStyle="dark-content" />

      {unreadCount > 0 && (
        <TouchableOpacity
          style={styles.markAllReadButton}
          onPress={markAllAsRead}
        >
          <Typo style={styles.markAllReadText}>Mark all as read</Typo>
        </TouchableOpacity>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={!loading && renderEmptyList()}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchNotifications(1, true)}
            colors={["#038565"]}
          />
        }
        onEndReached={() => {
          if (hasMore && !loading && !refreshing) {
            fetchNotifications(page + 1);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && !refreshing ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#038565" />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  unreadItem: {
    backgroundColor: "#f0f8ff",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#038565",
    marginRight: 10,
    position: "absolute",
    left: 15,
    top: "50%",
    transform: [{ translateY: -4 }],
  },
  notificationIcon: {
    marginRight: 15,
    marginLeft: 15,
  },
  notificationTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  notificationTitle: {
    fontSize: 15,
    color: "#333",
    marginBottom: 3,
  },
  unreadText: {
    fontWeight: "600",
    color: "#000",
  },
  notificationTimestamp: {
    fontSize: 12,
    color: "#888",
  },
  chevronIcon: {
    // Style for forward chevron
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginLeft: 65,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#aaa",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  markAllReadButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  markAllReadText: {
    color: "#038565",
    fontSize: 14,
    fontWeight: "500",
  },
});
