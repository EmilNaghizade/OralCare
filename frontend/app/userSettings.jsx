// app/(tabs)/settings/index.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Typo from "../components/Typo";
import { useAuth } from "./_layout";
import "../i18n"; // Import your i18n setup if needed
import { useTranslation } from "react-i18next";

// Custom Input Component
const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  editable = true,
}) => (
  <View style={styles.inputContainer}>
    <Typo style={styles.inputLabel}>{label}</Typo>
    <View style={[styles.inputWrapper, !editable && styles.disabledInput]}>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={secureTextEntry}
        editable={editable}
      />
    </View>
  </View>
);

export default function UserSettings() {
  const { t, i18n } = useTranslation();
  const { authToken } = useAuth();
  const router = useRouter();

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // load profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth/profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error("fetch");
        const { user } = await res.json();
        setName(user.name ?? "");
        setEmail(user.email ?? "");
      } catch {
        setErrorMessage(
          t("userSettings.fetchError", "Could not load profile.")
        );
      } finally {
        setInitialLoading(false);
      }
    };
    if (authToken) fetchProfile();
  }, [authToken]);

  const validateForm = () => {
    setErrorMessage("");
    setSuccessMessage("");
    if (!name.trim()) {
      setErrorMessage(
        t("userSettings.errors.nameEmpty", "Name cannot be empty")
      );
      return false;
    }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email)) {
      setErrorMessage(
        t("userSettings.errors.emailInvalid", "Please enter a valid email")
      );
      return false;
    }
    if (newPassword) {
      if (!currentPassword) {
        setErrorMessage(
          t(
            "userSettings.errors.currentPasswordRequired",
            "Current password is required"
          )
        );
        return false;
      }
      if (newPassword.length < 6) {
        setErrorMessage(
          t(
            "userSettings.errors.passwordShort",
            "New password must be at least 6 characters"
          )
        );
        return false;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage(
          t(
            "userSettings.errors.passwordMismatch",
            "New passwords do not match"
          )
        );
        return false;
      }
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      // update name/email
      const prRes = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email }),
        }
      );
      const prData = await prRes.json();
      if (!prRes.ok) throw new Error(prData.message || "profile");

      // if password change requested
      if (newPassword) {
        // verify
        const verifyRes = await fetch(
          `${
            process.env.EXPO_PUBLIC_API_BASE_URL
          }/api/auth/verify-password?password=${encodeURIComponent(
            currentPassword
          )}`,
          { method: "GET", headers: { Authorization: `Bearer ${authToken}` } }
        );
        if (!verifyRes.ok) {
          const err = await verifyRes.json();
          throw new Error(t("userSettings.errors.currentPasswordIncorrect"));
        }
        // update
        const pwRes = await fetch(
          `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth/update-password`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ currentPassword, newPassword }),
          }
        );
        const pwData = await pwRes.json();
        if (!pwRes.ok) throw new Error(pwData.message || "password");
        // clear fields + alert
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        Alert.alert(
          t("userSettings.passwordUpdatedTitle", "Password Updated"),
          t(
            "settings.passwordUpdatedMessage",
            "Your password has been changed. Please use the new one next time."
          ),
          [{ text: t("common.ok", "OK") }]
        );
        return;
      }

      setSuccessMessage(
        t("userSettings.profileUpdated", "Profile updated successfully")
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage(
        err.message || t("userSettings.updateFailed", "Update failed")
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#038565" />
          </TouchableOpacity>
          <Typo fontWeight="600" size={18}>
            {t("userSettings.profileSettings", "Profile Settings")}
          </Typo>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#038565" />
          <Typo style={styles.loadingText}>
            {t("userSettings.loadingProfile", "Loading profile...")}
          </Typo>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#038565" />
          </TouchableOpacity>
          <Typo fontWeight="600" size={18}>
            {t("userSettings.profileSettings")}
          </Typo>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.formContainer}>
            <Typo fontWeight="600" size={22} style={styles.sectionTitle}>
              {t("userSettings.personalInformation", "Personal Information")}
            </Typo>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color="#FF3B30"
                />
                <Typo style={styles.errorText}>{errorMessage}</Typo>
              </View>
            ) : null}

            {successMessage ? (
              <View style={styles.successContainer}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#34C759"
                />
                <Typo style={styles.successText}>{successMessage}</Typo>
              </View>
            ) : null}

            <FormInput
              label={t("userSettings.fullName", "Full Name")}
              value={name}
              onChangeText={setName}
              placeholder={t(
                "userSettings.fullNamePlaceholder",
                "Enter your full name"
              )}
            />

            <FormInput
              label={t("userSettings.emailAddress", "Email Address")}
              value={email}
              onChangeText={setEmail}
              placeholder={t(
                "userSettings.emailPlaceholder",
                "Enter your email address"
              )}
            />

            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => router.push("/language-selection")}
            >
              <Ionicons name="language-outline" size={20} color="#038565" />
              <Typo
                style={styles.languageButtonText}
                fontWeight="600"
                size={16}
              >
                {t("settings.selectLanguage")}
              </Typo>
              <Ionicons name="chevron-forward" size={20} color="#038565" />
            </TouchableOpacity>

            <Typo
              fontWeight="600"
              size={22}
              style={[styles.sectionTitle, styles.passwordTitle]}
            >
              {t("userSettings.changePassword", "Change Password")}
            </Typo>
            <Typo style={styles.passwordSubtitle}>
              {t(
                "userSettings.passwordNote",
                "Leave these fields empty if you don't want to change your password"
              )}
            </Typo>

            <FormInput
              label={t("userSettings.currentPassword", "Current Password")}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder={t(
                "userSettings.currentPasswordPlaceholder",
                "Enter your current password"
              )}
              secureTextEntry
            />

            <FormInput
              label={t("userSettings.newPassword", "New Password")}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t(
                "userSettings.newPasswordPlaceholder",
                "Enter new password"
              )}
              secureTextEntry
            />

            <FormInput
              label={t(
                "userSettings.confirmNewPassword",
                "Confirm New Password"
              )}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t(
                "userSettings.confirmPasswordPlaceholder",
                "Confirm new password"
              )}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.updateButton, loading && styles.disabledButton]}
              onPress={handleUpdate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Typo color="#fff" fontWeight="600">
                  {t("userSettings.updateProfile", "Update Profile")}
                </Typo>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 0 : 10,
    height: 55,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: { padding: 8 },
  contentContainer: { flexGrow: 1, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },

  languageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  languageOption: { flexDirection: "row", alignItems: "center" },

  formContainer: { padding: 20 },
  sectionTitle: { marginBottom: 20, color: "#1c1c1c" },
  passwordTitle: { marginTop: 30, marginBottom: 8 },
  passwordSubtitle: { fontSize: 14, color: "#666", marginBottom: 20 },

  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 16, color: "#333", marginBottom: 8 },
  inputWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
  },
  textInput: { fontSize: 16, color: "#333", paddingVertical: 4 },
  disabledInput: { backgroundColor: "#f0f0f0", borderColor: "#e0e0e0" },

  updateButton: {
    backgroundColor: "#038565",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 30,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F5F7",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  languageButtonText: {
    flex: 1,
    marginLeft: 12,
    color: "#0F172A",
  },
  disabledButton: { opacity: 0.7 },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBE9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: { color: "#FF3B30", fontSize: 14, marginLeft: 8, flex: 1 },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F9E9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  successText: { color: "#34C759", fontSize: 14, marginLeft: 8 },
});
