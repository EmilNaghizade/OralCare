// frontend/app/admin/components/ProductForm.jsx
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
  Image,
  Platform,
} from "react-native";
import { useAuth } from "../../_layout";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "../../../components/BackButton";
import axios from "axios";
import * as FileSystem from "expo-file-system";

export default function ProductForm({ route, navigation }) {
  const { isEditing, productId } = route.params;
  const { authToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  const [formData, setFormData] = useState({
    nameEn: "",
    nameRu: "",
    link: "",
    imageFile: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (isEditing && productId) {
      fetchProductDetails();
    }
  }, [isEditing, productId]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const product = response.data;
      setFormData({
        nameEn: product.nameTranslations?.en || product.name.en || "",
        nameRu: product.nameTranslations?.ru || product.name.ru || "",
        link: product.link || "",
        imageFile: null, // We don't reload the actual file
      });

      // Set image preview if available
      if (product.imageUrl) {
        setImagePreview(`${API_URL}${product.imageUrl}`);
      }
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
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setFormData({
          ...formData,
          imageFile: imageUri,
        });
        setImagePreview(imageUri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.nameEn || !formData.nameRu || !formData.link) {
      Alert.alert(
        "Missing Information",
        "Please fill in all required fields (name in both languages and link)"
      );
      return;
    }

    if (!isEditing && !formData.imageFile) {
      Alert.alert("Missing Image", "Please upload a product image");
      return;
    }

    setSubmitting(true);

    try {
      // Create FormData object for file upload
      const formDataForUpload = new FormData();

      // Create multilingual name object
      const nameObject = {
        en: formData.nameEn,
        ru: formData.nameRu,
      };

      formDataForUpload.append("name", JSON.stringify(nameObject));
      formDataForUpload.append("link", formData.link);

      // Append image file if we have one
      if (formData.imageFile) {
        const imageFileInfo = await FileSystem.getInfoAsync(formData.imageFile);
        if (!imageFileInfo.exists) {
          throw new Error("Image file does not exist at the specified path");
        }

        const imageFileName = formData.imageFile.split("/").pop();
        const imageFile = {
          uri: formData.imageFile,
          type: "image/jpeg",
          name: imageFileName,
        };

        formDataForUpload.append("image", imageFile);
      }

      // Make API call
      let response;
      if (isEditing) {
        response = await axios.put(
          `${API_URL}/api/products/${productId}`,
          formDataForUpload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
      } else {
        response = await axios.post(
          `${API_URL}/api/products`,
          formDataForUpload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
      }

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
      let errorMessage = "Failed to save product";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      Alert.alert("Error", errorMessage);
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
        <BackButton onPress={() => navigation.goBack()} />

        <Text style={styles.label}>Product Name (English) *</Text>
        <TextInput
          style={styles.input}
          value={formData.nameEn}
          onChangeText={(text) => handleInputChange("nameEn", text)}
          placeholder="Enter product name in English"
        />

        <Text style={styles.label}>Product Name (Russian) *</Text>
        <TextInput
          style={styles.input}
          value={formData.nameRu}
          onChangeText={(text) => handleInputChange("nameRu", text)}
          placeholder="Введите название продукта на русском"
        />

        <Text style={styles.label}>Product Link *</Text>
        <TextInput
          style={styles.input}
          value={formData.link}
          onChangeText={(text) => handleInputChange("link", text)}
          placeholder="Enter product link (URL)"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Product Image *</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Ionicons name="image-outline" size={24} color="#007AFF" />
          <Text style={styles.uploadButtonText}>
            {imagePreview ? "Change Image" : "Upload Image"}
          </Text>
        </TouchableOpacity>

        {imagePreview && (
          <View style={styles.previewContainer}>
            <Text style={styles.fileSelected}>Image selected</Text>
            <Image
              source={{ uri: imagePreview }}
              style={styles.imagePreview}
              resizeMode="contain"
            />
          </View>
        )}

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
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#007AFF",
  },
  previewContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  fileSelected: {
    marginTop: 8,
    fontSize: 14,
    color: "#8E8E93",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: "#f0f0f0",
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
