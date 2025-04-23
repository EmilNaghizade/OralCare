import React, { useState, useEffect } from 'react';
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
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Typo from '../components/Typo';
import { useAuth } from './_layout';

// Custom Input Component
const FormInput = ({ label, value, onChangeText, placeholder, secureTextEntry, editable = true }) => (
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

const UserSettings = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { authToken } = useAuth();
  const router = useRouter();
  
  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const userData = await response.json();
        setName(userData.user.name || '');
        setEmail(userData.user.email || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
        setErrorMessage('Could not load profile data. Please try again later.');
      } finally {
        setInitialLoading(false);
      }
    };
    
    if (authToken) {
      fetchUserProfile();
    }
  }, [authToken]);
  
  const validateForm = () => {
    // Reset previous messages
    setErrorMessage('');
    setSuccessMessage('');
    
    // Validate name
    if (name.trim() === '') {
      setErrorMessage('Name cannot be empty');
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    
    // If changing password, validate password fields
    if (newPassword) {
      if (!currentPassword) {
        setErrorMessage('Current password is required to set a new password');
        return false;
      }
      
      if (newPassword.length < 6) {
        setErrorMessage('New password must be at least 6 characters long');
        return false;
      }
      
      if (newPassword !== confirmPassword) {
        setErrorMessage('New passwords do not match');
        return false;
      }
    }
    
    return true;
  };
  
  const handleUpdateProfile = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Update profile info (name and email)
      const profilePayload = {
        name,
        email
      };
      
      const profileResponse = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profilePayload)
      });
      
      const profileData = await profileResponse.json();
      
      if (!profileResponse.ok) {
        throw new Error(profileData.message || 'Failed to update profile');
      }
      
      // If user is trying to update password, handle it separately
      if (newPassword) {
        // First verify current password
        const encodedPassword = encodeURIComponent(currentPassword);
        const verifyPasswordResponse = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth/verify-password?password=${encodedPassword}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!verifyPasswordResponse.ok) {
          const errorData = await verifyPasswordResponse.json();
          throw new Error(errorData.message || 'Current password is incorrect');
        }
        
        // Now update password with a separate endpoint
        const passwordResponse = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth/change-password`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        });
        
        const passwordData = await passwordResponse.json();
        
        if (!passwordResponse.ok) {
          throw new Error(passwordData.message || 'Failed to update password');
        }
        
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Show password update success
        Alert.alert(
          "Password Updated",
          "Your password has been successfully changed. Please use your new password next time you log in.",
          [{ text: "OK" }]
        );
      }
      
      setSuccessMessage('Profile updated successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#038565" />
          </TouchableOpacity>
          <Typo fontWeight="600" size={18}>Profile Settings</Typo>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#038565" />
          <Typo style={styles.loadingText}>Loading profile...</Typo>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#038565" />
          </TouchableOpacity>
          <Typo fontWeight="600" size={18}>Profile Settings</Typo>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.formContainer}>
            <Typo fontWeight="600" size={22} style={styles.sectionTitle}>Personal Information</Typo>
            
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={20} color="#FF3B30" />
                <Typo style={styles.errorText}>{errorMessage}</Typo>
              </View>
            ) : null}
            
            {successMessage ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#34C759" />
                <Typo style={styles.successText}>{successMessage}</Typo>
              </View>
            ) : null}
            
            <FormInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
            />
            
            <FormInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              editable={true}
            />
            
            <Typo fontWeight="600" size={22} style={[styles.sectionTitle, styles.passwordTitle]}>
              Change Password
            </Typo>
            <Typo style={styles.passwordSubtitle}>
              Leave these fields empty if you don't want to change your password
            </Typo>
            
            <FormInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter your current password"
              secureTextEntry={true}
            />
            
            <FormInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry={true}
            />
            
            <FormInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry={true}
            />
            
            <TouchableOpacity 
              style={[styles.updateButton, loading && styles.disabledButton]}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Typo color="#fff" fontWeight="600">Update Profile</Typo>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    height: 55,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 20,
    color: '#1c1c1c',
  },
  passwordTitle: {
    marginTop: 30,
    marginBottom: 8,
  },
  passwordSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  fieldNote: {
    fontSize: 12,
    color: '#666',
    marginTop: -12,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
  },
  updateButton: {
    backgroundColor: '#038565',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 30,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBE9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F9E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  successText: {
    color: '#34C759',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default UserSettings;