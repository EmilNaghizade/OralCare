// frontend/admin/components/ProductForm.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useAuth } from "../../_layout";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

export default function ProductForm({ route, navigation }) {
  const { isEditing, productId } = route.params;
  const { authToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    inStock: true,
    images: [],
  });

  useEffect(() => {
    if (isEditing && productId) {
      fetchProductDetails();
    }
  }, [isEditing, productId]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      // Replace with your actual API call
      // const response = await fetch(`your-api-endpoint/${productId}`, {
      //   headers: { Authorization: `Bearer ${authToken}` }
      // });
      // const data = await response.json();

      // Dummy data for now
      const dummyData = {
        name: "Electric Toothbrush",
        description:
          "High-quality electric toothbrush with multiple brushing modes.",
        price: "89.99",
        category: "Toothbrushes",
        inStock: true,
        images: ["url1", "url2"],
      };

      setFormData(dummyData);
    } catch (error) {
      console.error("Error fetching product details:", error);
      Alert.alert("Error", "Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant media library permissions to upload images."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setFormData({
          ...formData,
          images: [...formData.images, imageUri],
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const removeImage = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      images: updatedImages,
    });
  };

  const handleSubmit = async () => {
    // Validate form
    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.category
    ) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }
    if (formData.images.length === 0) {
      Alert.alert("Missing Images", "Please upload at least one product image");
      return;
    }

    // Validate price format
    if (isNaN(parseFloat(formData.price))) {
      Alert.alert("Invalid Price", "Please enter a valid price");
      return;
    }

    setSubmitting(true);

    try {
      // Replace with your actual API call
      // For new product
      // if (!isEditing) {
      //   await fetch('your-api-endpoint', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       Authorization: `Bearer ${authToken}`
      //     },
      //     body: JSON.stringify(formData)
      //   });
      // } else {
      //   // For updating existing product
      //   await fetch(`your-api-endpoint/${productId}`, {
      //     method: 'PUT',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       Authorization: `Bearer ${authToken}`
      //     },
      //     body: JSON.stringify(formData)
      //   });
      // }

      // Success message
      Alert.alert(
        "Success",
        isEditing
          ? "Product updated successfully"
          : "Product created successfully",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Error saving product:", error);
      Alert.alert("Error", "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Product Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => handleInputChange("name", text)}
          placeholder="Enter product name"
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => handleInputChange("description", text)}
          placeholder="Enter product description"
          multiline={true}
          numberOfLines={4}
        />

        <Text style={styles.label}>Price *</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.priceInput}
            value={formData.price}
            onChangeText={(text) => handleInputChange("price", text)}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>

        <Text style={styles.label}>Category *</Text>
        <TextInput
          style={styles.input}
          value={formData.category}
          onChangeText={(text) => handleInputChange("category", text)}
          placeholder="Enter product category"
        />

        <View style={styles.stockContainer}>
          <Text style={styles.label}>In Stock</Text>
          <Switch
            value={formData.inStock}
            onValueChange={(value) => handleInputChange("inStock", value)}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={formData.inStock ? "#007AFF" : "#f4f3f4"}
          />
        </View>

        <Text style={styles.label}>Product Images *</Text>
        <View style={styles.imagesContainer}>
          {formData.images.map((image, index) => (
            <View key={index} style={styles.imagePreviewContainer}>
              <View style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={22} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
            <Ionicons name="add" size={30} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={submitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditing ? "Update Product" : "Save Product"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: "#8E8E93",
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  imagePreviewContainer: {
    position: "relative",
    width: 100,
    height: 100,
    margin: 4,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E5EA",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: "white",
    borderRadius: 8,
    margin: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderStyle: "dashed",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
    marginBottom: 40,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    width: "48%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E5E5EA",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8E8E93",
  },
  submitButton: {
    backgroundColor: "#007AFF",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});
