// frontend/app/admin/components/ArticleForm.jsx
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
  Image,
  Platform,
} from "react-native";
import { useAuth } from "../../_layout";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "../../../components/BackButton";
import * as FileSystem from "expo-file-system";
import axios from "axios";

export default function ArticleForm({ route, navigation }) {
  const { isEditing, articleId } = route.params;
  const { authToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  const [formData, setFormData] = useState({
    titleEn: "",
    titleRu: "",
    descriptionEn: "",
    descriptionRu: "",
    readingTime: "",
    thumbnailFile: null,
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  useEffect(() => {
    if (isEditing && articleId) {
      fetchArticleDetails();
    }
  }, [isEditing, articleId]);

  const fetchArticleDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/articles/${articleId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const articleData = response.data;
      if (articleData) {
        setFormData({
          titleEn:
            articleData.titleTranslations?.en || articleData.title.en || "",
          titleRu:
            articleData.titleTranslations?.ru || articleData.title.ru || "",
          descriptionEn:
            articleData.descriptionTranslations?.en ||
            articleData.description.en ||
            "",
          descriptionRu:
            articleData.descriptionTranslations?.ru ||
            articleData.description.ru ||
            "",
          readingTime: articleData.readingTime
            ? articleData.readingTime.toString()
            : "",
          thumbnailFile: null,
        });

        // Set preview if available
        if (articleData.thumbnail) {
          setThumbnailPreview(`${API_URL}${articleData.thumbnail}`);
        }
      }
    } catch (error) {
      console.error("Error fetching article details:", error);
      Alert.alert("Error", "Failed to load article details");
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

  const pickThumbnail = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant media library permissions to upload a thumbnail."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setFormData({
          ...formData,
          thumbnailFile: imageUri,
        });

        setThumbnailPreview(imageUri);
      }
    } catch (error) {
      console.error("Error picking thumbnail:", error);
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (
      !formData.titleEn ||
      !formData.titleRu ||
      !formData.descriptionEn ||
      !formData.descriptionRu ||
      !formData.readingTime
    ) {
      Alert.alert(
        "Missing Information",
        "Please fill in all required fields (title and description in both languages, and reading time)"
      );
      return;
    }

    if (!isEditing && !formData.thumbnailFile) {
      Alert.alert("Missing Thumbnail", "Please upload a thumbnail image");
      return;
    }

    // Validate reading time is a number
    if (formData.readingTime && isNaN(Number(formData.readingTime))) {
      Alert.alert("Invalid Reading Time", "Reading time must be a number");
      return;
    }

    setSubmitting(true);

    try {
      // Create FormData object for file upload
      const formDataForUpload = new FormData();

      // Create multi-language objects
      const titleObject = {
        en: formData.titleEn,
        ru: formData.titleRu,
      };

      const descriptionObject = {
        en: formData.descriptionEn,
        ru: formData.descriptionRu,
      };

      formDataForUpload.append("title", JSON.stringify(titleObject));
      formDataForUpload.append(
        "description",
        JSON.stringify(descriptionObject)
      );
      formDataForUpload.append("readingTime", formData.readingTime || 5);

      // Append thumbnail file if we have one
      if (formData.thumbnailFile) {
        const thumbnailFileInfo = await FileSystem.getInfoAsync(
          formData.thumbnailFile
        );
        if (!thumbnailFileInfo.exists) {
          throw new Error(
            "Thumbnail file does not exist at the specified path"
          );
        }

        const thumbnailFileName = formData.thumbnailFile.split("/").pop();
        const thumbnailFile = {
          uri: formData.thumbnailFile,
          type: "image/jpeg",
          name: thumbnailFileName,
        };

        formDataForUpload.append("thumbnail", thumbnailFile);
      }

      // Make API call
      const url = isEditing
        ? `${API_URL}/api/articles/${articleId}`
        : `${API_URL}/api/articles`;
      const method = isEditing ? "PUT" : "POST";

      const response = await axios({
        method: method,
        url: url,
        data: formDataForUpload,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Success message
      Alert.alert(
        "Success",
        isEditing
          ? "Article updated successfully"
          : "Article created successfully",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Error saving article:", error);
      Alert.alert("Error", `Failed to save article: ${error.message}`);
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
        <Text style={styles.formTitle}>
          {isEditing ? "Edit Article" : "Add New Article"}
        </Text>

        <Text style={styles.label}>Title (English) *</Text>
        <TextInput
          style={styles.input}
          value={formData.titleEn}
          onChangeText={(text) => handleInputChange("titleEn", text)}
          placeholder="Enter article title in English"
        />

        <Text style={styles.label}>Title (Russian) *</Text>
        <TextInput
          style={styles.input}
          value={formData.titleRu}
          onChangeText={(text) => handleInputChange("titleRu", text)}
          placeholder="Введите заголовок статьи на русском"
        />

        <Text style={styles.label}>Description (English) *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.descriptionEn}
          onChangeText={(text) => handleInputChange("descriptionEn", text)}
          placeholder="Enter article description in English"
          multiline={true}
          numberOfLines={4}
        />

        <Text style={styles.label}>Description (Russian) *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.descriptionRu}
          onChangeText={(text) => handleInputChange("descriptionRu", text)}
          placeholder="Введите описание статьи на русском"
          multiline={true}
          numberOfLines={4}
        />

        <Text style={styles.label}>Reading Time (minutes) *</Text>
        <TextInput
          style={styles.input}
          value={formData.readingTime}
          onChangeText={(text) => handleInputChange("readingTime", text)}
          placeholder="Enter reading time in minutes"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Thumbnail *</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={pickThumbnail}>
          <Ionicons name="image-outline" size={24} color="#007AFF" />
          <Text style={styles.uploadButtonText}>
            {thumbnailPreview ? "Change Thumbnail" : "Upload Thumbnail"}
          </Text>
        </TouchableOpacity>

        {thumbnailPreview && (
          <View style={styles.previewContainer}>
            <Text style={styles.fileSelected}>Thumbnail selected</Text>
            <Image
              source={{ uri: thumbnailPreview }}
              style={styles.thumbnailPreview}
              resizeMode="cover"
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
                {isEditing ? "Update Article" : "Save Article"}
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
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
    color: "#000",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 16,
    color: "#000",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#007AFF",
  },
  fileSelected: {
    marginTop: 8,
    fontSize: 14,
    color: "#8E8E93",
  },
  previewContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  thumbnailPreview: {
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
