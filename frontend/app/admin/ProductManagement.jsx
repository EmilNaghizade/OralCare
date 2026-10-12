// frontend/admin/ProductManagement.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  Image,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../_layout";
import ProductForm from "./components/ProductForm";
import axios from "axios";

const Stack = createStackNavigator();
const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

function ProductListScreen({ navigation }) {
  const { authToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Add a listener to refresh the list when we navigate back to it
    const unsubscribe = navigation.addListener("focus", () => {
      fetchProducts();
    });

    // Clean up the listener
    return unsubscribe;
  }, [navigation]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.data && response.data.products) {
        setProducts(response.data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert("Error", "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await axios.delete(`${API_URL}/api/products/${id}`, {
                headers: { Authorization: `Bearer ${authToken}` },
              });

              // Update local state to remove deleted product
              setProducts(products.filter((product) => product._id !== id));
              Alert.alert("Success", "Product deleted successfully");
            } catch (error) {
              console.error("Error deleting product:", error);
              Alert.alert("Error", "Failed to delete product");
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

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddProduct")}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.buttonText}>Add New Product</Text>
      </TouchableOpacity>

      {products.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.productItem}>
              <View style={styles.productInfo}>
                {item.imageUrl ? (
                  <Image
                    source={{ uri: `${API_URL}${item.imageUrl}` }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.thumbnailPlaceholder} />
                )}
                <View style={styles.textContainer}>
                  <Text style={styles.productName} numberOfLines={3} ellipsizeMode="tail">{item.name}</Text>
                  <Text
                    style={styles.productLink}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.link}
                  </Text>

                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate("EditProduct", { productId: item._id })
                  }
                >
                  <Ionicons name="create-outline" size={24} color="#007AFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(item._id)}
                >
                  <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={
            products.length === 0 ? styles.fullContainer : null
          }
        />
      )}
    </View>
  );
}

export default function ProductManagement() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddProduct"
        component={ProductForm}
        options={{ title: "Add New Product", headerShown: false }}
        initialParams={{ isEditing: false }}
      />
      <Stack.Screen
        name="EditProduct"
        component={ProductForm}

        options={{ title: "Edit Product", headerShown: false }}
        initialParams={{ isEditing: true }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F2F2F7",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
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
  productItem: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: "#E5E5EA",
    borderRadius: 6,
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: "#E5E5EA",
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  productName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  productLink: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 4,
    maxWidth: "90%",
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productCategory: {
    fontSize: 14,
    color: "#8E8E93",
  },
  stockStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  inStock: {
    color: "#34C759",
  },
  outOfStock: {
    color: "#FF3B30",
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
});
