// app/(tabs)/products.jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList, // Use FlatList for grid
  Image,
  TouchableOpacity, // Make cards touchable
  Dimensions, // To calculate item width
} from "react-native";
import { useRouter } from "expo-router";

// --- Dummy Data ---
const dummyProducts = [
  { id: "p1", name: "OroCare™ Mini toothbrush" },
  { id: "p2", name: "OroCare™ Mini toothbrush" },
  { id: "p3", name: "OroCare™ Mini toothbrush" },
  { id: "p4", name: "OroCare™ Mini toothbrush" },
  // Add more products as needed
];

const productImg = require("../../assets/images/Product1.png");

// Calculate item width for two columns with spacing
const PADDING = 15;
const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - PADDING * 3) / 2; // (Screen width - total horizontal padding) / num columns

// --- Product Card Component ---
const ProductCard = ({ item }) => {
  return (
    <TouchableOpacity style={styles.productCard} >
      <View style={styles.productImageContainer}>
        <Image
          source={productImg}
          style={styles.productImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.productName} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

// --- Main Products Screen Component ---
export default function ProductsScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={dummyProducts}
        renderItem={({ item }) => <ProductCard item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2} // Crucial for grid layout
        contentContainerStyle={styles.listContainer}
        // Optional: Add styling to space out columns if needed
        // columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5", // Light gray background for the list area
  },
  listContainer: {
    paddingHorizontal: PADDING, // Overall horizontal padding for the grid
    paddingTop: 20, // Space below header
    paddingBottom: 20, // Space at bottom
  },
  // Optional: If extra space needed between columns besides item margin
  // columnWrapper: {
  //   justifyContent: 'space-between',
  // },
  productCard: {
    width: ITEM_WIDTH, // Calculated width
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: PADDING, // Vertical spacing between rows
    // Add horizontal spacing implicitly via FlatList padding and item width calculation
    // Or add marginHorizontal if not using columnWrapper style adjustments
    marginHorizontal: PADDING / 2, // Distribute spacing between items
    padding: 10, // Internal padding
    alignItems: "center", // Center content
    // Shadow/Elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    // Container for the image background color/padding
    width: "100%",
    aspectRatio: 1, // Make it square (adjust if needed)
    backgroundColor: "#f8fafd", // Very light background for image area
    borderRadius: 8, // Slightly rounded corners inside card
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  productImage: {
    width: "80%", // Make image smaller than its container
    height: "80%", // Make image smaller than its container
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
    marginTop: 5,
  },
});
