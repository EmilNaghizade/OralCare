// frontend/app/admin/UserManagement.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../_layout";
import axios from "axios";

export default function UserManagement() {
  const { authToken, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/auth/all`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.data) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const toggleAdminRole = async (userId, currentRole) => {
    try {
      const newRole = currentRole === "admin" ? "user" : "admin";

      // Confirm before making the change
      Alert.alert(
        "Confirm Role Change",
        `Are you sure you want to change this user's role to ${newRole}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Change",
            onPress: async () => {
              setLoading(true);
              try {
                // Use the user update API to change the role
                await axios.put(
                  `${API_URL}/api/auth/profile/${userId}`,
                  { role: newRole },
                  {
                    headers: { Authorization: `Bearer ${authToken}` },
                  }
                );

                // Update local state
                setUsers(
                  users.map((user) =>
                    user._id === userId ? { ...user, role: newRole } : user
                  )
                );

                Alert.alert("Success", `User role updated to ${newRole}`);
              } catch (error) {
                console.error("Error updating user role:", error);
                Alert.alert("Error", "Failed to update user role");
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error in toggleAdminRole:", error);
      Alert.alert("Error", "Failed to process role change");
    }
  };

  const handleDeleteUser = (userId, userName) => {
    // Additional safeguard checks
    if (userId === currentUser?.id) {
      Alert.alert(
        "Action Not Allowed",
        "You cannot delete your own account from the admin panel."
      );
      return;
    }

    // Get the user object to check role
    const userToDelete = users.find((u) => u._id === userId);
    if (userToDelete?.role === "admin") {
      Alert.alert(
        "Action Not Allowed",
        "Admin accounts cannot be deleted. Change the user's role to regular user first."
      );
      return;
    }

    // Confirm before deleting
    Alert.alert(
      "Delete User",
      `Are you sure you want to permanently delete ${userName}?\nThis action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              // Call API to delete user
              await axios.delete(
                `${API_URL}/api/auth/delete-user/${userId}`,
                {
                  headers: { Authorization: `Bearer ${authToken}` },
                }
              );
              // Update local state
              setUsers(users.filter((user) => user._id !== userId));

              Alert.alert("Success", "User deleted successfully");
            } catch (error) {
              console.error("Error deleting user:", error);
              Alert.alert("Error", "Failed to delete user");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {users.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No users found</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <View style={styles.userInfo}>
                <View style={styles.userInitial}>
                  <Text style={styles.initialText}>
                    {item.name ? item.name.charAt(0).toUpperCase() : "U"}
                  </Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  <View style={styles.roleContainer}>
                    <Text
                      style={[
                        styles.roleText,
                        item.role === "admin"
                          ? styles.adminRole
                          : styles.userRole,
                      ]}
                    >
                      {item.role === "admin" ? "Admin" : "User"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Admin</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={item.role === "admin" ? "#007AFF" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => toggleAdminRole(item._id, item.role)}
                  value={item.role === "admin"}
                />
              </View>
              {item.role !== "admin" && item._id !== currentUser?.id && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteUser(item._id, item.name)}
                >
                  <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                </TouchableOpacity>
              )}
            </View>
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  listContainer: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93",
  },
  userItem: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currentUserItem: {
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "#F0F8FF",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userInitial: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  currentUserInitial: {
    backgroundColor: "#0056b3",
  },
  initialText: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
  },
  currentUserBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "white",
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
  youLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#007AFF",
    marginLeft: 6,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  adminRole: {
    backgroundColor: "#E1F5FE",
    color: "#0288D1",
  },
  userRole: {
    backgroundColor: "#F0F0F0",
    color: "#616161",
  },
  actionsContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
  switchContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  switchLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 4,
  },
  deleteButton: {
    backgroundColor: "#FFEBEE",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    marginTop: 12,
  },
});
