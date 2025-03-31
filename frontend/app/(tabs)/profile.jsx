// app/(tabs)/profile.jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../_layout"; // Adjust path if needed

// Reusable List Item Component
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
  const { logout, user } = useAuth(); // Get logout function and maybe user data
  console.log(user);

  // --- Placeholder Data (Replace with actual data later) ---
  const profileData = {
    // Attempt to get name from context, fallback to placeholder
    name: user?.name,
    // Use user profile image from context/API if available, otherwise placeholder
    profilePicUrl: user?.profileImage || require("../../assets/images/pp.png"),
    videoCount: user?.watchedVideoCount || 12, // Fetch from profile API later
    quizCount: user?.readArticleCount || 8, // Fetch from profile API later (assuming quizzes = articles for now)
  };
  // --- End Placeholder Data ---

  const handleLogout = () => {
    console.log("ProfileScreen: Logging out...");
    logout(); // Call the logout function from context
    // Root layout's useEffect will handle navigation to auth screen
  };

  // Placeholder navigation functions
  const navigateToEditProfile = () => console.log("Navigate to Edit Profile");
  const navigateToRewards = () => console.log("Navigate to Rewards");
  const navigateToInvite = () => console.log("Navigate to Invite");
  const navigateToNotifications = () =>
    console.log("Navigate to Notifications");
  const navigateToAppSettings = () => console.log("Navigate to App Settings");
  const navigateToFAQ = () => console.log("Navigate to FAQ");
  const navigateToContact = () => console.log("Navigate to Contact Support");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* User Info Section */}
        <View style={styles.userInfoSection}>
          <Image source={profileData.profilePicUrl} style={styles.profilePic} />
          <Text style={styles.userName}>{profileData.name}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={navigateToEditProfile}
          >
            <Text style={styles.editButtonText}>Edit profile</Text>
          </TouchableOpacity>

          {/* Get Rewarded Card */}
          <TouchableOpacity
            style={styles.rewardCard}
            onPress={navigateToRewards}
          >
            {/* Add background image/gradient if needed */}
            <View style={styles.rewardTextContainer}>
              <Text style={styles.rewardCardTitle}>Get rewarded</Text>
              <Text style={styles.rewardCardSubText}>
                Invite your friends and get various rewards
              </Text>
            </View>
            {/* Add image overlay graphic if needed */}
            <Image
              source={require("../../assets/images/banner2.png")} // Placeholder - CREATE OR REPLACE
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
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff", // Light gray background
  },
  scrollContainer: {
    paddingBottom: 30,
    backgroundColor: "#f0f2f5", // Light gray background
  },
  // --- User Info ---
  userInfoSection: {
    alignItems: "center",
    paddingTop: 20, // Space from top
    paddingBottom: 20,
    backgroundColor: "#fff", // White background for this section only? Or whole screen white? Assuming card sections on gray bg.
    marginBottom: 15, // Space before reward card
    borderBottomLeftRadius: 16, // Rounded corners
    borderBottomRightRadius: 16, // Rounded corners
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50, // Circular
    backgroundColor: "#e0e0e0", // Placeholder bg
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: "#038565", // Light teal background
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  editButtonText: {
    color: "#fff", // Theme green text
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
  },
  // --- Reward Card ---
  rewardCard: {
    backgroundColor: "#049472", // ADJUST this green to match Figma exactly
    borderRadius: 20, // More rounded corners
    paddingVertical: 20, // Adjust vertical padding
    paddingLeft: 20, // Left padding for text
    paddingRight: 10, // Less padding on the right where image is
    marginHorizontal: 15,
    marginBottom: 15,
    flexDirection: "row", // Keep content and image side-by-side
    // Removed justifyContent: 'space-between'
    alignItems: "center", // Vertically center items if card height allows
    overflow: "hidden", // Clip content/image to rounded corners
    // Add shadow/elevation if needed
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    
  },
  rewardTextContainer: {
    flex: 1, // Allow text container to take available width
    paddingRight: 10, // Add space between text and image
  },
  rewardCardTitle: {
    color: "#fff",
    fontSize: 20, // Larger title font size
    fontWeight: "bold", // Bold title
    marginBottom: 5, // Adjust space below title
  },
  rewardCardSubText: {
    color: "#fff",
    fontSize: 14,
    // Removed maxWidth/flexShrink - flex:1 on container handles width
    lineHeight: 18, // Adjust line height
  },
  rewardCardImage: {
    width: 170, // Adjust width of the graphic
    height: 80, // Adjust height of the graphic
    resizeMode: "", // Keep aspect ratio
    // Removed marginLeft - spacing handled by text container's paddingRight
    // Opacity can be removed unless desired
    // opacity: 0.8,
  },
  // --- Stats Section ---
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginBottom: 15,
  },
  statCard: {
    flex: 1, // Take half width approx
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5, // Spacing between cards
    alignItems: "flex-start", // Align text left
    position: "relative", // For icon positioning
    // Add shadow/elevation
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
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  statIcon: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -12 }], // Center icon vertically approx
  },
  // --- List Section ---
  listCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 10, // Reduce top/bottom padding
    // Add shadow/elevation
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
    marginTop: 5, // Space above header text
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15, // Vertical padding for each item
  },
  listItemIcon: {
    marginRight: 15,
    width: 24, // Allocate space for icon
    textAlign: "center",
  },
  listItemText: {
    flex: 1, // Allow text to take remaining space
    fontSize: 16,
    color: "#1F2937",
  },
  logoutText: {
    color: "#DC2626", // Red color for logout
    fontWeight: "500",
  },
  separator: {
    // Simple line separator
    height: 1,
    backgroundColor: "#f0f2f5", // Light gray line
    marginVertical: 0, // Remove vertical margin if padding handles spacing
  },
});
