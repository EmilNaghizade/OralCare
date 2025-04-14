// frontned/app/(tabs)/profile.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../_layout";
import { fetchWithAuth } from "../../services/fetchWithAuth";
import { useRouter } from "expo-router";
import { profileApi } from "../../services/profileApi";
import * as ImagePicker from "expo-image-picker";
import { quizApi, videoApi } from "../../services/api";

const getProfile = (token) => fetchWithAuth("/api/profile/profile", token);

const ProfileListItem = ({ iconName, label, onPress, isLogout = false }) => (
  <TouchableOpacity style={styles.listItem} onPress={onPress}>
    <Ionicons
      name={iconName}
      size={22}
      color={isLogout ? "#DC2626" : "#6B7280"}
      style={styles.listItemIcon}
    />
    <Text style={[styles.listItemText, isLogout && styles.logoutText]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { authToken, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [quizCount, setQuizCount] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [videoCount, setVideoCount] = useState(0);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [galleryPermission, setGalleryPermission] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!authToken) {
        console.log("Home: No auth token, cannot fetch profile.");
        setIsLoadingProfile(false);
        return;
      }
      setIsLoadingProfile(true);
      try {
        const profileData = await getProfile(authToken);
        if (profileData?.user) {
          setUser(profileData.user);
          if (
            profileData.user.profileImage &&
            profileData.user.profileImage !== ""
          ) {
            const imageUri = profileData.user.profileImage.startsWith("http")
              ? profileData.user.profileImage
              : `${process.env.EXPO_PUBLIC_API_BASE_URL}${profileData.user.profileImage}`;
            console.log("Setting profile image from API:", imageUri);
            setProfileImage({ uri: imageUri });
          } else {
            setProfileImage(null);
          }
        } else {
          console.warn(
            "Home: Profile data received, but unexpected structure:",
            profileData
          );
          setProfileImage(null);
        }
      } catch (error) {
        console.error("Home: Failed to fetch profile:", error);
        setUser(null);
        setProfileImage(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    // (Other data fetching functions for quizzes/videos remain unchanged)
    loadProfile();
  }, [authToken]);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status: cameraStatus } =
          await ImagePicker.requestCameraPermissionsAsync();
        setCameraPermission(cameraStatus === "granted");
        console.log("Camera permission status:", cameraStatus);

        const { status: libraryStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        setGalleryPermission(libraryStatus === "granted");
        console.log("Media library permission status:", libraryStatus);
      }
    })();
  }, []);

  const defaultProfilePic = require("../../assets/images/pp.png");

  const profileData = {
    name: user?.name,
    profilePicUrl: profileImage ? { uri: profileImage.uri } : defaultProfilePic,
    videoCount: videoCount,
    quizCount: quizCount,
  };

  const takePhoto = async () => {
    if (cameraPermission !== true) {
      console.log("No camera permission, requesting again...");
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera access is needed to take a profile photo. Please enable it in your device settings.",
          [{ text: "OK" }]
        );
        setPhotoModalVisible(false);
        return;
      }
      setCameraPermission(true);
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        base64: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage = result.assets[0];
        setProfileImage({ uri: newImage.uri });
        await profileApi.uploadProfileImage(
          authToken,
          newImage.uri,
          newImage.base64
        );
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setPhotoModalVisible(false);
    }
  };

  const pickImage = async () => {
    if (galleryPermission !== true) {
      console.log("No gallery permission, requesting again...");
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Photo library access is needed to select a profile photo. Please enable it in your device settings.",
          [{ text: "OK" }]
        );
        setPhotoModalVisible(false);
        return;
      }
      setGalleryPermission(true);
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        base64: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage = result.assets[0];
        setProfileImage({ uri: newImage.uri });
        await profileApi.uploadProfileImage(
          authToken,
          newImage.uri,
          newImage.base64
        );
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select photo. Please try again.");
    } finally {
      setPhotoModalVisible(false);
    }
  };

  const deletePhoto = async () => {
    try {
      setProfileImage(null);
      if (authToken) {
        await profileApi.deleteProfileImage(authToken);
        if (user) {
          setUser({ ...user, profileImage: null });
        }
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      Alert.alert("Error", "Failed to delete profile photo. Please try again.");
      if (user?.profileImage) {
        setProfileImage({ uri: user.profileImage });
      }
    } finally {
      setPhotoModalVisible(false);
    }
  };

  const handleLogout = () => {
    console.log("ProfileScreen: Logging out...");
    logout();
  };

  // Navigation functions remain unchanged...
  const navigateToEditProfile = () => console.log("Navigate to Edit Profile");
  const navigateToRewards = () => console.log("Navigate to Rewards");
  const navigateToInvite = () => console.log("Navigate to Invite");
  const navigateToNotifications = () => router.push("/notifications");
  const navigateToAppSettings = () => console.log("Navigate to App Settings");
  const navigateToFAQ = () => console.log("Navigate to FAQ");
  const navigateToContact = () => console.log("Navigate to Contact Support");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* User Info Section */}
        <View style={styles.userInfoSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={profileData.profilePicUrl}
              style={styles.profilePic}
              onError={(e) => {
                console.log("Error loading image:", e.nativeEvent.error);
                setProfileImage(null);
              }}
            />
            <TouchableOpacity
              style={styles.editPhotoButton}
              onPress={() => setPhotoModalVisible(true)}
            >
              <Ionicons name="pencil" size={18} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{profileData.name}</Text>

          {/* Reward Card */}
          <TouchableOpacity
            style={styles.rewardCard}
            onPress={navigateToRewards}
          >
            <View style={styles.rewardTextContainer}>
              <Text style={styles.rewardCardTitle}>Get rewarded</Text>
              <Text style={styles.rewardCardSubText}>
                Invite your friends and get various rewards
              </Text>
            </View>
            <Image
              source={require("../../assets/images/banner2.png")}
              style={styles.rewardCardImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{profileData.videoCount}</Text>
            <Text style={styles.statLabel}>Videos</Text>
            <Ionicons
              name="videocam-outline"
              size={24}
              color="#6B7280"
              style={styles.statIcon}
            />
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{profileData.quizCount}</Text>
            <Text style={styles.statLabel}>Quizzes</Text>
            <Ionicons
              name="book-outline"
              size={24}
              color="#6B7280"
              style={styles.statIcon}
            />
          </View>
        </View>

        {/* Profile List Section */}
        <View style={styles.listCard}>
          <Text style={styles.listHeader}>Profile</Text>
          <ProfileListItem
            iconName="person-add-outline"
            label="Invite a friend"
            onPress={navigateToInvite}
          />
          <View style={styles.separator} />
          <ProfileListItem
            iconName="notifications-outline"
            label="Notifications"
            onPress={navigateToNotifications}
          />
          <View style={styles.separator} />
          <ProfileListItem
            iconName="settings-outline"
            label="App settings"
            onPress={navigateToAppSettings}
          />
        </View>

        {/* Support List Section */}
        <View style={styles.listCard}>
          <Text style={styles.listHeader}>Support & Feedback</Text>
          <ProfileListItem
            iconName="help-circle-outline"
            label="FAQ"
            onPress={navigateToFAQ}
          />
          <View style={styles.separator} />
          <ProfileListItem
            iconName="call-outline"
            label="Contact support"
            onPress={navigateToContact}
          />
          <View style={styles.separator} />
          <ProfileListItem
            iconName="log-out-outline"
            label="Log out"
            onPress={handleLogout}
            isLogout={true}
          />
        </View>
      </ScrollView>

      {/* Photo Options Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={photoModalVisible}
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPhotoModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalOption} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color="#038565" />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color="#038565" />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={deletePhoto}>
              <Ionicons name="trash-outline" size={24} color="#DC2626" />
              <Text style={[styles.modalOptionText, styles.deleteText]}>
                Remove Current Photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setPhotoModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// --- Styles (unchanged) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { paddingBottom: 30, backgroundColor: "#f0f2f5" },
  userInfoSection: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
    marginBottom: 15,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  profileImageContainer: { position: "relative", marginBottom: 12 },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#f0f0f0",
    borderRadius: 50,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: "#038565",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
  },
  rewardCard: {
    backgroundColor: "#049472",
    borderRadius: 20,
    paddingVertical: 20,
    paddingLeft: 20,
    paddingRight: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  rewardTextContainer: { flex: 1, paddingRight: 10 },
  rewardCardTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  rewardCardSubText: { color: "#fff", fontSize: 14, lineHeight: 18 },
  rewardCardImage: { width: 170, height: 80, resizeMode: "" },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: "flex-start",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: { fontSize: 14, color: "#6B7280" },
  statIcon: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  listCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
    marginTop: 5,
  },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 15 },
  listItemIcon: { marginRight: 15, width: 24, textAlign: "center" },
  listItemText: { flex: 1, fontSize: 16, color: "#1F2937" },
  logoutText: { color: "#DC2626", fontWeight: "500" },
  separator: { height: 1, backgroundColor: "#f0f2f5", marginVertical: 0 },
  achievement: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F5F7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  achievementText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#1c1c1c",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f2f5",
  },
  modalOptionText: { fontSize: 16, color: "#1F2937", marginLeft: 15 },
  deleteText: { color: "#DC2626" },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    borderRadius: 10,
  },
  cancelButtonText: { fontSize: 16, fontWeight: "500", color: "#1F2937" },
});
