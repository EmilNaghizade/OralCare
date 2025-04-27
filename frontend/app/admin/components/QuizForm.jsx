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
    title: "",
    description: "",
    category: "",
    colorScheme: "green",
    isPublished: true,
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
        setFormData({
          title: quizData.title || "",
          description: quizData.description || "",
          category: quizData.category || "",
          colorScheme: quizData.colorScheme || "green",
          isPublished: quizData.isPublished !== false, // Default to true if undefined
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
    if (!formData.title.trim()) {
      Alert.alert("Error", "Title is required");
      return false;
    }
    return true;
  };

  // Save the quiz
  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEditing) {
        await quizApi.updateQuiz(quizId, formData, authToken);
        Alert.alert("Success", "Quiz updated successfully", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        const result = await quizApi.createQuiz(formData, authToken);
        Alert.alert("Success", "Quiz created successfully", [
          { 
            text: "Add Questions Now", 
            onPress: () => navigation.navigate("ManageQuestions", { quizId: result._id }) 
          },
          { text: "Later", onPress: () => navigation.goBack() }
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
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => handleInputChange("title", text)}
          placeholder="Enter quiz title"
        />

        {/* Description Input */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => handleInputChange("description", text)}
          placeholder="Enter quiz description"
          multiline={true}
          numberOfLines={4}
        />

        {/* Category Input */}
        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          value={formData.category}
          onChangeText={(text) => handleInputChange("category", text)}
          placeholder="Enter quiz category"
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
                formData.colorScheme === scheme.name && styles.selectedColorOption
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
            style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
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