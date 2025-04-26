import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
  SafeAreaView,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useRouter } from "expo-router";
import Button from "../../components/Button";
import Typo from "../../components/Typo";
import { useAuth } from "../_layout";

const { width } = Dimensions.get("window");

const slides = [
  {
    image: require("../../assets/images/Graduation.png"),
    title: "Learn with Video Tutorials !",
    subtitle: "Follow video guides for effective oral care practices.",
  },
  {
    image: require("../../assets/images/Trophy.png"),
    title: "Quiz your knowledge!",
    subtitle: "Take quizzes to test and improve your oral health knowledge.",
  },
  {
    image: require("../../assets/images/Globe.png"),
    title: "Get Instant Support",
    subtitle: "Chat with our managers or connect via your preferred messenger.",
  },
];

const OnboardingScreen = () => {
  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const router = useRouter();
  const auth = useAuth();
  const markOnboardingComplete = auth?.markOnboardingComplete;
  // Ensure this is correctly imported from your context
  const handleGetStarted = async () => {
    if (typeof markOnboardingComplete !== "function") {
      console.error(
        "Onboarding Error: markOnboardingComplete function not found. Check useAuth import and AuthProvider export."
      );
      Alert.alert("Error", "An internal setup error occurred [Auth Context].");
      return;
    }
    try {
      console.log("Onboarding: Calling markOnboardingComplete...");
      await markOnboardingComplete();
      console.log("Onboarding: markOnboardingComplete finished.");

      const targetRoute = "/(auth)/register"; // Or '/(auth)/login'
      console.log(`Onboarding: Attempting navigation to ${targetRoute}...`);
      router.push(targetRoute);
      console.log("Onboarding: Navigation push initiated.");
    } catch (error) {
      console.error("--- Onboarding: ERROR in handleGetStarted ---", error);
      Alert.alert("Error", `Could not proceed: ${error.message}`);
    }
  };
  const currentSlideData = slides[activeSlide] || {}; // Handle potential undefined slide

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={{ flex: 0.1 }} />

      {/* Carousel */}
      <Carousel
        ref={carouselRef}
        width={width}
        // Adjusted height slightly, tune this value (0.7, 0.75, etc.) to match Figma
        height={width * 0.7}
        data={slides}
        loop={false}
        onSnapToItem={(index) => setActiveSlide(index)}
        renderItem={({ item }) =>
          item ? ( // Ensure item exists before rendering
            // Use flex: 1 to allow imageContainer to fill Carousel item height
            <View style={styles.imageContainer}>
              <Image source={item.image} style={styles.image} />
            </View>
          ) : null
        }
        style={styles.carousel} // Added style for potential margin
      />

      {/* Content Area below Carousel */}
      <View style={styles.contentArea}>
        {/* Welcome Badge */}
        <View style={styles.badge}>
          {/* Assuming Typo can replace Text here if desired */}
          <Typo fontWeight="600" size={14} style={styles.badgeText}>
            🌟 Welcome to OralCare
          </Typo>
        </View>

        {/* Title & Subtitle */}
        {/* Use Typo component if it provides the styling */}
        <Typo fontWeight="600" size={32} style={styles.title}>
          {currentSlideData.title}
        </Typo>
        <Typo fontWeight="400" size={18} style={styles.subtitle}>
          {currentSlideData.subtitle}
        </Typo>

        {/* Optional Description from Figma */}
        {/* <Typo style={styles.description}>{currentSlideData.description}</Typo> */}

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, activeSlide === index && styles.activeDot]}
            />
          ))}
        </View>
      </View>

      {/* Bottom Button Container */}
      <View style={styles.buttonContainer}>
        <Button
          style={styles.getStartedButton} // Renamed style for clarity
          onPress={() => router.push("/(auth)/register")} // Use the new function
        >
          <Typo color={"#fff"} fontWeight="600" size={16}>
            Get started
          </Typo>
        </Button>

        <Button
          style={styles.loginButton}
          onPress={() => router.push("/(auth)/login")}
        >
          <Typo color={"#0F172A"} fontWeight="600" size={16}>
            Log in
          </Typo>
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Use space-between to push buttons to bottom, or flex-start and control spacing manually
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingBottom: 30, // Add padding at the bottom for buttons
    paddingTop: 20, // Add some padding at the top
  },
  carousel: {
    // Add vertical margin if needed, e.g., marginBottom: 20
  },
  imageContainer: {
    // flex: 1, // Let container fill the height provided by Carousel
    width: width, // Takes full width from Carousel prop
    height: "100%", // Takes full height from Carousel prop
    alignItems: "center", // Center image horizontally
    justifyContent: "center", // Center image vertically
    // backgroundColor: 'lightblue', // uncomment to visualize container
  },
  image: {
    // Let the image determine its own size based on contain, up to container bounds
    maxWidth: "85%", // Prevent image from touching edges, adjust as needed
    maxHeight: "100%",
    resizeMode: "contain",
    // Removed marginBottom
  },
  contentArea: {
    alignItems: "center", // Center badge, text, dots
    paddingHorizontal: 20, // Add horizontal padding to text content
    // backgroundColor: 'lightyellow', // uncomment to visualize container
    marginTop: 10, // Add space below carousel
  },
  badge: {
    backgroundColor: "#EDFAF7",
    // gap: 8, // Use margin/padding instead of gap for wider compatibility
    borderRadius: 100,
    paddingVertical: 8, // Adjusted padding
    paddingHorizontal: 16, // Adjusted padding
    marginBottom: 20, // Space below badge (was marginTop before)
    flexDirection: "row", // Needed if you have an icon and text inside
    alignItems: "center",
  },
  badgeText: {
    fontWeight: "500",
    marginLeft: 4, // Space if an icon is present before text
  },
  title: {
    fontSize: 32,
    lineHeight: 40, // Adjusted for better readability
    fontWeight: "600",
    textAlign: "center",
    color: "#1F2937", // Darker text color
    // Removed marginTop, spacing controlled by contentArea/badge margin
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24, // Adjusted for better readability
    fontWeight: "400",
    textAlign: "center",
    color: "#6B7280", // Slightly darker gray
    marginTop: 8, // Reduced space
    lineHeight: 22, // Improve readability
  },
  description: {
    // Optional style for the description text
    fontSize: 14,
    textAlign: "center",
    color: "#6B7280",
    marginTop: 15,
    paddingHorizontal: 20, // Keep description lines shorter
  },
  pagination: {
    flexDirection: "row",
    marginTop: 25, // Increased space before dots
    marginBottom: 20, // Add space after dots before buttons are positioned
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB", // Lighter gray for inactive dots
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#047857", // Match Figma's darker green dot
    width: 10, // Slightly wider active dot? (Optional)
    height: 10, // Slightly taller active dot? (Optional)
    borderRadius: 5, // Adjust if size changes
  },
  buttonContainer: {
    width: "90%",
    alignItems: "center",
    marginBottom: 20,
  },
  getStartedButton: {
    // Renamed from getStarted
    backgroundColor: "#038565", // This green seems okay
    width: "100%", // Take full width of buttonContainer
    // paddingVertical: 4, // Padding likely handled within your Button component?
    // gap: 8, // Use margin/padding within Button component
    borderRadius: 100, // Make fully rounded like Figma
    paddingVertical: 14, // Increase vertical padding for better touch area
    alignItems: "center", // Ensure text is centered if Button component doesn't
    justifyContent: "center", // Ensure text is centered if Button component doesn't
  },
  loginButton: {
    backgroundColor: "#F0F5F7", // This light bg seems okay
    width: "100%", // Take full width of buttonContainer
    // paddingVertical: 4,
    // gap: 8,
    marginTop: 12, // Space between buttons
    borderRadius: 100, // Make fully rounded
    paddingVertical: 14, // Increase vertical padding
    alignItems: "center",
    justifyContent: "center",
  },
  // Removed unused styles: login, loginText
});

export default OnboardingScreen;
