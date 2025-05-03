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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../_layout";
import BackButton from "../../../components/BackButton";
import { quizApi } from "../../../services/api";

export default function QuestionForm({ route, navigation }) {
  const { quizId, questionId, isEditing } = route.params;
  const { authToken } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [questionText, setQuestionText] = useState({ en: "", ru: "" });
  const [options, setOptions] = useState({ en: ["", ""], ru: ["", ""] });
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  // Load quiz and question data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const quizData = await quizApi.getQuizById(quizId, authToken);
        setQuiz(quizData);

        if (isEditing && questionId) {
          const q = quizData.questions.find((q) => q._id === questionId);
          if (!q) {
            Alert.alert("Error", "Question not found");
            return navigation.goBack();
          }
          setQuestionText({ en: q.question.en, ru: q.question.ru });
          setOptions({ en: [...q.options.en], ru: [...q.options.ru] });
          setCorrectAnswerIndex(q.correctAnswer);
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load quiz data");
        navigation.goBack();
      } finally {
        setInitialLoading(false);
      }
    };
    if (quizId) fetchData();
  }, [quizId, questionId, isEditing, authToken]);

  // Handlers
  const handleQuestionChange = (lang, text) => {
    setQuestionText((prev) => ({ ...prev, [lang]: text }));
  };
  const handleOptionChange = (lang, text, idx) => {
    setOptions((prev) => {
      const updated = { ...prev };
      updated[lang][idx] = text;
      return updated;
    });
  };
  const addOption = () => {
    if (options.en.length < 8) {
      setOptions((prev) => ({ en: [...prev.en, ""], ru: [...prev.ru, ""] }));
    } else {
      Alert.alert("Limit Reached", "Max 8 options allowed");
    }
  };
  const removeOption = (idx) => {
    if (options.en.length <= 2) {
      Alert.alert("Error", "At least 2 options required");
      return;
    }
    setOptions((prev) => ({
      en: prev.en.filter((_, i) => i !== idx),
      ru: prev.ru.filter((_, i) => i !== idx),
    }));
    if (correctAnswerIndex === idx) setCorrectAnswerIndex(0);
    else if (correctAnswerIndex > idx) setCorrectAnswerIndex((i) => i - 1);
  };

  const validateForm = () => {
    if (!questionText.en.trim() || !questionText.ru.trim()) {
      Alert.alert("Error", "Question text required in both languages");
      return false;
    }
    if (options.en.length < 2) {
      Alert.alert("Error", "At least 2 options required");
      return false;
    }
    for (let i = 0; i < options.en.length; i++) {
      if (!options.en[i].trim() || !options.ru[i].trim()) {
        Alert.alert("Error", `Option ${i + 1} required in both languages`);
        return false;
      }
    }
    if (correctAnswerIndex < 0 || correctAnswerIndex >= options.en.length) {
      Alert.alert("Error", "Select valid correct answer");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        question: questionText,
        options,
        correctAnswer: correctAnswerIndex,
      };
      if (isEditing) {
        await quizApi.updateQuestion(quizId, questionId, payload, authToken);
        Alert.alert("Success", "Question updated", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        await quizApi.addQuestion(quizId, payload, authToken);
        Alert.alert("Success", "Question added", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Determine display title safely
  const displayTitle = quiz
    ? typeof quiz.title === "string"
      ? quiz.title
      : quiz.title.en || Object.values(quiz.title)[0]
    : "";

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.formTitle}>
          {isEditing ? "Edit Question" : "Add Question"}
        </Text>
        {quiz && <Text style={styles.quizTitle}>Quiz: {displayTitle}</Text>}

        <Text style={styles.label}>Question (EN) *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={questionText.en}
          onChangeText={(t) => handleQuestionChange("en", t)}
          placeholder="Question in English"
          multiline
        />

        <Text style={styles.label}>Question (RU) *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={questionText.ru}
          onChangeText={(t) => handleQuestionChange("ru", t)}
          placeholder="Вопрос на русском"
          multiline
        />

        <View style={styles.optionsSection}>
          <Text style={styles.label}>Options *</Text>
          <Text style={styles.helperText}>
            Tap circle to mark correct answer
          </Text>
          {options.en.map((_, idx) => (
            <View key={idx} style={styles.optionContainer}>
              <TouchableOpacity
                onPress={() => setCorrectAnswerIndex(idx)}
                style={styles.correctToggle}
              >
                <Ionicons
                  name={
                    correctAnswerIndex === idx
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={24}
                  color={correctAnswerIndex === idx ? "#4CD964" : "#8E8E93"}
                />
              </TouchableOpacity>
              <View style={styles.optionInputsWrapper}>
                <TextInput
                  style={styles.optionInput}
                  value={options.en[idx]}
                  onChangeText={(t) => handleOptionChange("en", t, idx)}
                  placeholder={`Option ${idx + 1} (EN)`}
                />
                <TextInput
                  style={styles.optionInput}
                  value={options.ru[idx]}
                  onChangeText={(t) => handleOptionChange("ru", t, idx)}
                  placeholder={`Вариант ${idx + 1} (RU)`}
                />
              </View>
              <TouchableOpacity
                onPress={() => removeOption(idx)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={addOption} style={styles.addOptionButton}>
            <Ionicons name="add-circle-outline" size={24} />
            <Text style={styles.addOptionText}>Add Another Option</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.button, styles.cancelButton]}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            style={[
              styles.button,
              styles.saveButton,
              loading && styles.disabledButton,
            ]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? "Update" : "Add"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  formContainer: { padding: 16 },
  formTitle: { fontSize: 24, fontWeight: "bold", marginVertical: 16 },
  quizTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF",
    marginBottom: 24,
  },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 8, marginTop: 16 },
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
  textArea: { minHeight: 80, textAlignVertical: "top" },
  optionsSection: { marginTop: 16 },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  correctToggle: { padding: 8 },
  optionInputsWrapper: { flex: 1 },
  optionInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    marginBottom: 8,
  },
  deleteButton: { padding: 8 },
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
  button: { borderRadius: 8, padding: 16, width: "48%", alignItems: "center" },
  saveButton: { backgroundColor: "#007AFF" },
  cancelButton: { backgroundColor: "#E5EEA" },
  saveButtonText: { fontSize: 16, fontWeight: "bold", color: "white" },
  cancelButtonText: { fontSize: 16, fontWeight: "bold", color: "#8E8E93" },
  disabledButton: { opacity: 0.7 },
});
