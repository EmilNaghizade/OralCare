// frontend/app/admin/components/QuestionForm.jsx
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
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../_layout";
import BackButton from "../../../components/BackButton";
import { quizApi } from "../../../services/api";

export default function QuestionForm({ route, navigation }) {
  const { quizId, questionId, isEditing } = route.params;
  const { authToken } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  // Fetch quiz and question data if editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the quiz first
        const quizData = await quizApi.getQuizById(quizId, authToken);
        setQuiz(quizData);

        // If editing, find the specific question
        if (isEditing && questionId) {
          const question = quizData.questions.find((q) => q._id === questionId);

          if (question) {
            setQuestionText(question.question);
            setOptions([...question.options]);
            setCorrectAnswerIndex(question.correctAnswer);
          } else {
            Alert.alert("Error", "Question not found");
            navigation.goBack();
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load quiz data");
        navigation.goBack();
      } finally {
        setInitialLoading(false);
      }
    };

    if (quizId) {
      fetchData();
    }
  }, [quizId, questionId, isEditing, authToken]);

  // Handle option text changes
  const handleOptionChange = (text, index) => {
    const newOptions = [...options];
    newOptions[index] = text;
    setOptions(newOptions);
  };

  // Add a new option
  const addOption = () => {
    if (options.length < 8) {
      setOptions([...options, ""]);
    } else {
      Alert.alert("Limit Reached", "Maximum 8 options allowed per question");
    }
  };

  // Remove an option
  const removeOption = (index) => {
    if (options.length <= 2) {
      Alert.alert("Error", "A question must have at least 2 options");
      return;
    }

    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);

    // Adjust correctAnswerIndex if needed
    if (correctAnswerIndex === index) {
      setCorrectAnswerIndex(0);
    } else if (correctAnswerIndex > index) {
      setCorrectAnswerIndex(correctAnswerIndex - 1);
    }
  };

  // Set correct answer
  const setCorrectAnswer = (index) => {
    setCorrectAnswerIndex(index);
  };

  // Validate the form
  const validateForm = () => {
    if (!questionText.trim()) {
      Alert.alert("Error", "Question text is required");
      return false;
    }

    if (options.length < 2) {
      Alert.alert("Error", "At least 2 options are required");
      return false;
    }

    for (let i = 0; i < options.length; i++) {
      if (!options[i].trim()) {
        Alert.alert("Error", `Option ${i + 1} cannot be empty`);
        return false;
      }
    }

    if (correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
      Alert.alert("Error", "Please select a valid correct answer");
      return false;
    }

    return true;
  };

  // Save the question
  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const questionData = {
        question: questionText,
        options: options,
        correctAnswer: correctAnswerIndex,
      };

      if (isEditing) {
        await quizApi.updateQuestion(
          quizId,
          questionId,
          questionData,
          authToken
        );
        Alert.alert("Success", "Question updated successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        await quizApi.addQuestion(quizId, questionData, authToken);
        Alert.alert("Success", "Question added successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error("Error saving question:", error);
      Alert.alert("Error", "Failed to save question");
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
          {isEditing ? "Edit Question" : "Add New Question"}
        </Text>

        {quiz && <Text style={styles.quizTitle}>Quiz: {quiz.title}</Text>}

        {/* Question Text Input */}
        <Text style={styles.label}>Question Text *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={questionText}
          onChangeText={setQuestionText}
          placeholder="Enter the question here"
          multiline={true}
          numberOfLines={2}
        />

        {/* Options Section */}
        <View style={styles.optionsSection}>
          <Text style={styles.label}>Options *</Text>
          <Text style={styles.helperText}>
            Tap an option to mark it as the correct answer
          </Text>

          {options.map((option, index) => (
            <View key={index} style={styles.optionContainer}>
              <TouchableOpacity
                style={[
                  styles.correctToggle,
                  correctAnswerIndex === index && styles.correctToggleSelected,
                ]}
                onPress={() => setCorrectAnswer(index)}
              >
                <Ionicons
                  name={
                    correctAnswerIndex === index
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={24}
                  color={correctAnswerIndex === index ? "#4CD964" : "#8E8E93"}
                />
              </TouchableOpacity>

              <TextInput
                style={styles.optionInput}
                value={option}
                onChangeText={(text) => handleOptionChange(text, index)}
                placeholder={`Option ${index + 1}`}
              />

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeOption(index)}
              >
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addOptionButton} onPress={addOption}>
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.addOptionText}>Add Another Option</Text>
          </TouchableOpacity>
        </View>

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
                {isEditing ? "Update Question" : "Add Question"}
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
  quizTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 16,
    color: "#000",
  },
  helperText: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 12,
    fontStyle: "italic",
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
    minHeight: 80,
    textAlignVertical: "top",
  },
  optionsSection: {
    marginTop: 16,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  correctToggle: {
    padding: 8,
  },
  correctToggleSelected: {
    // Style for the selected correct answer toggle
  },
  optionInput: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    marginHorizontal: 8,
  },
  deleteButton: {
    padding: 8,
  },
  addOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#007AFF",
    marginTop: 12,
  },
  addOptionText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
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
