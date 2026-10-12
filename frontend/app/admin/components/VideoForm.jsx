// frontend/admin/components/VideoForm.jsx
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
import { videoApi } from "../../../services/api"; // Adjust the import path as needed

export default function VideoForm({ route, navigation }) {
  const { isEditing, videoId } = route.params;
  const { authToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  const [formData, setFormData] = useState({
    titleEn: "",
    titleRu: "",
    descriptionEn: "",
    descriptionRu: "",
    categoryEn: "",
    categoryRu: "",
    duration: "",
    tags: [],
    videoFile: null,
    thumbnailFile: null,
  });

  const [tagInput, setTagInput] = useState("");
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  useEffect(() => {
    if (isEditing && videoId) {
      fetchVideoDetails();
    }
  }, [isEditing, videoId]);

  const fetchVideoDetails = async () => {
    setLoading(true);
    try {
      const videoData = await videoApi.getVideoById(videoId, authToken);

      if (videoData) {
        setFormData({
          titleEn: videoData.titleTranslations?.en || videoData.title.en || "",
          titleRu: videoData.titleTranslations?.ru || videoData.title.ru || "",
          descriptionEn:
            videoData.descriptionTranslations?.en ||
            videoData.description.en ||
            "",
          descriptionRu:
            videoData.descriptionTranslations?.ru ||
            videoData.description.ru ||
            "",

          categoryEn:
            videoData.categoryTranslation?.en || videoData.category.en || "",
          categoryRu:
            videoData.categoryTranslation?.ru || videoData.category.ru || "",
          duration: videoData.duration ? videoData.duration.toString() : "",
          tags: Array.isArray(videoData.tags) ? videoData.tags : [],
          videoFile: null, // We don't reload the actual file
          thumbnailFile: null,
        });

        // Set previews if available
        if (videoData.thumbnailUrl) {
          setThumbnailPreview(`${API_URL}${videoData.thumbnailUrl}`);
        }
        // We can't display video preview easily, so we'll just note it exists
        if (videoData.videoUrl) {
          setVideoPreview(`${API_URL}${videoData.videoUrl}`);
        }
      }
    } catch (error) {
      console.error("Error fetching video details:", error);
      Alert.alert("Error", "Failed to load video details");
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
  const addTag = () => {
    if (!tagInput.trim()) {
      return; // Don't add empty tags
    }

    // Check if tag already exists (case-insensitive)
    const tagExists = formData.tags.some(
      (tag) => tag.toLowerCase() === tagInput.trim().toLowerCase()
    );

    if (!tagExists) {
      // Add the tag to our state
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      console.log(`Added tag: ${tagInput.trim()}`); // Debug log
      console.log(
        `Current tags: ${JSON.stringify([...formData.tags, tagInput.trim()])}`
      ); // Debug log

      // Clear the input
      setTagInput("");
    } else {
      // Optionally alert the user that the tag already exists
      console.log(`Tag "${tagInput.trim()}" already exists`);
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant media library permissions to upload a video."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const videoUri = result.assets[0].uri;

        // Get video duration if possible (optional)
        let duration = 0;
        try {
          // This is just a placeholder - in a real app you might use a video library
          // that can extract duration or ask the user to input it manually
          duration = 0; // Default to 0 seconds
        } catch (e) {
          console.log("Couldn't get video duration:", e);
        }

        setFormData({
          ...formData,
          videoFile: videoUri,
          duration: duration || formData.duration,
        });
        console.log("Form data 147:", formData);

        setVideoPreview(videoUri);
      }
    } catch (error) {
      console.error("Error picking video:", error);
    }
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

  const convertFileToBase64 = async (uri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error("Error converting file to base64:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (
      !formData.titleEn ||
      !formData.titleRu ||
      !formData.descriptionEn ||
      !formData.descriptionRu ||
      !formData.categoryEn ||
      !formData.categoryRu
    ) {
      Alert.alert(
        "Missing Information",
        "Please fill in all required fields (title, description, category)"
      );
      return;
    }

    if (!isEditing && !formData.videoFile) {
      Alert.alert("Missing Video", "Please upload a video file");
      return;
    }

    if (!isEditing && !formData.thumbnailFile) {
      Alert.alert("Missing Thumbnail", "Please upload a thumbnail image");
      return;
    }

    // Validate duration is a number
    if (formData.duration && isNaN(Number(formData.duration))) {
      Alert.alert("Invalid Duration", "Duration must be a number in seconds");
      return;
    }

    setSubmitting(true);

    try {
      // Create FormData object for file upload
      const formDataForUpload = new FormData();
      const titleObject = {
        en: formData.titleEn,
        ru: formData.titleRu,
      };

      const descriptionObject = {
        en: formData.descriptionEn,
        ru: formData.descriptionRu,
      };

      const categoryObject = {
        en: formData.categoryEn,
        ru: formData.categoryRu,
      };

      formDataForUpload.append("title", JSON.stringify(titleObject));
      formDataForUpload.append(
        "description",
        JSON.stringify(descriptionObject)
      );
      formDataForUpload.append("category", JSON.stringify(categoryObject));
      formDataForUpload.append("duration", formData.duration || 0);
      formDataForUpload.append("tags", JSON.stringify(formData.tags));

      // Append video file if we have one
      if (formData.videoFile) {
        const videoFileInfo = await FileSystem.getInfoAsync(formData.videoFile);
        if (!videoFileInfo.exists) {
          throw new Error("Video file does not exist at the specified path");
        }

        const videoFileName = formData.videoFile.split("/").pop();
        const videoFile = {
          uri: formData.videoFile,
          type: "video/mp4", // Set appropriate type based on file
          name: videoFileName,
        };

        formDataForUpload.append("video", videoFile);
      }

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
          type: "image/jpeg", // Set appropriate type based on file
          name: thumbnailFileName,
        };

        formDataForUpload.append("thumbnail", thumbnailFile);
      }

      // Make API call
      const url = isEditing
        ? `${API_URL}/api/videos/${videoId}`
        : `${API_URL}/api/videos`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`,
        },
        body: formDataForUpload,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      // Success message
      Alert.alert(
        "Success",
        isEditing ? "Video updated successfully" : "Video created successfully",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Error saving video:", error);
      Alert.alert("Error", `Failed to save video: ${error.message}`);
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

        <Text style={styles.label}>Category (English) *</Text>
        <TextInput
          style={styles.input}
          value={formData.categoryEn}
          onChangeText={(text) => handleInputChange("categoryEn", text)}
          placeholder="Enter video category"
        />

        <Text style={styles.label}>Category (Russian) *</Text>
        <TextInput
          style={styles.input}
          value={formData.categoryRu}
          onChangeText={(text) => handleInputChange("categoryRu", text)}
          placeholder="Введите категорию видео"
        />


        <Text style={styles.label}>Duration (in seconds) *</Text>
        <TextInput
          style={styles.input}
          value={formData.duration}
          onChangeText={(text) => handleInputChange("duration", text)}
          placeholder="Enter duration in seconds"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Tags</Text>
        <View style={styles.tagsContainer}>
          {formData.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity onPress={() => removeTag(tag)}>
                <Ionicons name="close-circle" size={16} color="#8E8E93" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.tagInputContainer}>
          <TextInput
            style={styles.tagInput}
            value={tagInput}
            onChangeText={setTagInput}
            placeholder="Add a tag"
          />
          <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
            <Text style={styles.addTagButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Video *</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={pickVideo}>
          <Ionicons name="cloud-upload-outline" size={24} color="#007AFF" />
          <Text style={styles.uploadButtonText}>
            {videoPreview ? "Change Video" : "Upload Video"}
          </Text>
        </TouchableOpacity>

        {videoPreview && (
          <View style={styles.previewContainer}>
            <Text style={styles.fileSelected}>Video selected</Text>
            {/* We can't easily preview videos, but we can show a confirmation */}
            <View style={styles.videoPreviewPlaceholder}>
              <Ionicons name="videocam" size={40} color="#007AFF" />
              <Text style={styles.previewText}>Video ready for upload</Text>
            </View>
          </View>
        )}

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
                {isEditing ? "Update Video" : "Save Video"}
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
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  tag: {
    backgroundColor: "#E5E5EA",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  tagText: {
    marginRight: 6,
  },
  tagInputContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tagInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
  },
  addTagButtonText: {
    color: "white",
    fontWeight: "bold",
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
  videoPreviewPlaceholder: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  previewText: {
    marginTop: 8,
    color: "#007AFF",
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
