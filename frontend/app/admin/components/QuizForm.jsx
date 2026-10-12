// frontend/app/admin/components/QuizForm.jsx
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
  Platform,
} from "react-native";
import { useAuth } from "../../_layout";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "../../../components/BackButton";
import { quizApi } from "../../../services/api";

export default function QuizForm({ route, navigation }) {
  const { isEditing, quizId } = route.params;
  const { authToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const [formData, setFormData] = useState({
    titleEn: "",
    titleRu: "",
    descriptionEn: "",
    descriptionRu: "",
    categoryEn: "",
    categoryRu: "",
    colorScheme: "green",
    isPublished: true,
    time: 2,
  });

  const colorSchemes = [
    { name: "green", label: "Green", color: "#2E8B57" },
    { name: "purple", label: "Purple", color: "#8A2BE2" },
    { name: "blue", label: "Blue", color: "#1E90FF" },
    { name: "orange", label: "Orange", color: "#FF8C00" },
  ];

  // Fetch quiz data if editing
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const quizData = await quizApi.getQuizById(quizId, authToken);
        console.log("Fetched quiz data:", quizData.time);
        setFormData({
          titleEn: quizData.titleTranslations?.en || quizData.title.en || "",
          titleRu: quizData.titleTranslations?.ru || quizData.title.ru || "",
          descriptionEn:
            quizData.descriptionTranslations?.en ||
            quizData.description.en ||
            "",
          descriptionRu:
            quizData.descriptionTranslations?.ru ||
            quizData.description.ru ||
            "",

          categoryEn:
            quizData.categoryTranslation?.en || quizData.category.en || "",
          categoryRu:
            quizData.categoryTranslation?.ru || quizData.category.ru || "",
          colorScheme: quizData.colorScheme || "green",
          isPublished: quizData.isPublished !== false, // Default to true if undefined
          time: quizData.time || 2,
        });
      } catch (error) {
        console.error("Error fetching quiz:", error);
        Alert.alert("Error", "Failed to load quiz");
        navigation.goBack();
      } finally {
        setInitialLoading(false);
      }
    };

    if (isEditing && quizId) {
      fetchQuizData();
    } else {
      setInitialLoading(false);
    }
  }, [isEditing, quizId, authToken]);

  // Handle input changes
  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle color scheme selection
  const selectColorScheme = (scheme) => {
    setFormData({
      ...formData,
      colorScheme: scheme,
    });
  };

  // Validate form
  const validateForm = () => {
    if (
      !formData.titleEn.trim() ||
      !formData.titleRu.trim() ||
      !formData.descriptionEn.trim() ||
      !formData.descriptionRu.trim() ||
      !formData.categoryEn.trim() ||
      !formData.categoryRu.trim()
    ) {
      Alert.alert("Error", "Title, description and caregory is required");
      return false;
    }
    return true;
  };

  // Save the quiz
  const handleSave = async () => {
    if (!validateForm()) return;

    const time = Number(formData.time);
    if (isNaN(time) || time <= 0) {
      Alert.alert("Invalid Time", "Time must be a positive number of minutes");
      return;
    }

    setLoading(true);
    try {
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
      formDataForUpload.append("colorScheme", formData.colorScheme || 0);
      formDataForUpload.append("time", formData.time);
      formDataForUpload.append("isPublished", formData.isPublished);

      if (isEditing) {
        await quizApi.updateQuiz(quizId, formDataForUpload, authToken);
        Alert.alert("Success", "Quiz updated successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        const result = await quizApi.createQuiz(formDataForUpload, authToken);
        Alert.alert("Success", "Quiz created successfully", [
          {
            text: "Add Questions Now",
            onPress: () =>
              navigation.navigate("ManageQuestions", { quizId: result._id }),
          },
          { text: "Later", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
      Alert.alert("Error", "Failed to save quiz");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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
          {isEditing ? "Edit Quiz" : "Create New Quiz"}
        </Text>

        {/* Title Input */}
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

        {/* Time Input */}
        <Text style={styles.label}>Time (in minutes) *</Text>
        <TextInput
          style={styles.input}
          value={String(formData.time)}
          onChangeText={(text) => handleInputChange("time", text)}
          placeholder="Enter time in minutes"
          keyboardType="numeric"
        />

        {/* Color Scheme Selection */}
        <Text style={styles.label}>Color Scheme</Text>
        <View style={styles.colorSchemeContainer}>
          {colorSchemes.map((scheme) => (
            <TouchableOpacity
              key={scheme.name}
              style={[
                styles.colorOption,
                { backgroundColor: scheme.color },
                formData.colorScheme === scheme.name &&
                  styles.selectedColorOption,
              ]}
              onPress={() => selectColorScheme(scheme.name)}
            >
              {formData.colorScheme === scheme.name && (
                <Ionicons name="checkmark" size={24} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.colorLabelsContainer}>
          {colorSchemes.map((scheme) => (
            <Text key={scheme.name} style={styles.colorLabel}>
              {scheme.label}
            </Text>
          ))}
        </View>

        {/* Published Switch */}

        {/* Save and Cancel Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.saveButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? "Update Quiz" : "Create Quiz"}
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
  colorSchemeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  colorOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  colorLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  colorLabel: {
    fontSize: 12,
    width: 60,
    textAlign: "center",
    color: "#8E8E93",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  helperText: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
    fontStyle: "italic",
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
  saveButton: {
    backgroundColor: "#007AFF",
  },
  cancelButton: {
    backgroundColor: "#E5E5EA",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8E8E93",
  },
  disabledButton: {
    opacity: 0.7,
  },
});
