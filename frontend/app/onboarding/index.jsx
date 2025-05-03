import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
  SafeAreaView,
  Platform,
  TouchableOpacity,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useRouter } from "expo-router";
import Button from "../../components/Button";
import Typo from "../../components/Typo";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import LanguageModal from "../../components/LanguageModal";
import "../../i18n"; // Import the i18n configuration

const { width } = Dimensions.get("window");

const OnboardingScreen = () => {
  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const slides = [
    {
      image: require("../../assets/images/Graduation.png"),
      title: t("onboarding.slide1.title", "Learn with Video Tutorials !"),
      subtitle: t("onboarding.slide1.subtitle", "Follow video guides for effective oral care practices."),
    },
    {
      image: require("../../assets/images/Trophy.png"),
      title: t("onboarding.slide2.title", "Quiz your knowledge!"),
      subtitle: t("onboarding.slide2.subtitle", "Take quizzes to test and improve your oral health knowledge."),
    },
    {
      image: require("../../assets/images/Globe.png"),
      title: t("onboarding.slide3.title", "Get Instant Support"),
      subtitle: t("onboarding.slide3.subtitle", "Chat with our managers or connect via your preferred messenger."),
    },
  ];

  const changeLanguage = async (lng) => {
    try {
      await i18n.changeLanguage(lng);
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };
  
  const currentSlideData = slides[activeSlide] || {}; // Handle potential undefined slide

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={{ flex: 0.1 }} />

      {/* Language selection modal */}
      <LanguageModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onSelectLanguage={changeLanguage}
        statusBarTranslucent={true} 
      />

      {/* Language button in top-right corner */}
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setShowLanguageModal(true)}
      >
        <Ionicons name="language-outline" size={20} color="#038565" />
        <Text style={styles.languageButtonText}>
          {t("onboarding.buttons.language", "Language")}
        </Text>
      </TouchableOpacity>

      {/* Carousel */}
      <Carousel
        ref={carouselRef}
        width={width}
        height={width * 0.7}
        data={slides}
        loop={false}
        onSnapToItem={(index) => setActiveSlide(index)}
        renderItem={({ item }) =>
          item ? (
            <View style={styles.imageContainer}>
              <Image source={item.image} style={styles.image} />
            </View>
          ) : null
        }
        style={styles.carousel}
      />

      {/* Content Area below Carousel */}
      <View style={styles.contentArea}>
        {/* Welcome Badge */}
        <View style={styles.badge}>
          <Typo fontWeight="600" size={14} style={styles.badgeText}>
            {t("onboarding.welcome.badge", "🌟 Welcome to OralCare")}
          </Typo>
        </View>

        {/* Title & Subtitle */}
        <Typo fontWeight="600" size={32} style={styles.title}>
          {currentSlideData.title}
        </Typo>
        <Typo fontWeight="400" size={18} style={styles.subtitle}>
          {currentSlideData.subtitle}
        </Typo>

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
          style={styles.getStartedButton}
          onPress={() => router.push("/(auth)/register")}
        >
          <Typo color={"#fff"} fontWeight="600" size={16}>
            {t("onboarding.buttons.getStarted", "Get started")}
          </Typo>
        </Button>

        <Button
          style={styles.loginButton}
          onPress={() => router.push("/(auth)/login")}
        >
          <Typo color={"#0F172A"} fontWeight="600" size={16}>
            {t("onboarding.buttons.login", "Log in")}
          </Typo>
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingBottom: 30,
    paddingTop: 20,
  },
  languageButton: {
    position: "absolute",
    top: Platform.OS === "ios"? 75: 30,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F5F7",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#038565",
    marginLeft: 4,
  },
  carousel: {},
  imageContainer: {
    width: width,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    maxWidth: "85%",
    maxHeight: "100%",
    resizeMode: "contain",
  },
  contentArea: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  badge: {
    backgroundColor: "#EDFAF7",
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: {
    fontWeight: "500",
    marginLeft: 4,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "600",
    textAlign: "center",
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "400",
    textAlign: "center",
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 22,
  },
  pagination: {
    flexDirection: "row",
    marginTop: 25,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#047857",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    width: "90%",
    alignItems: "center",
    marginBottom: 20,
  },
  getStartedButton: {
    backgroundColor: "#038565",
    width: "100%",
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButton: {
    backgroundColor: "#F0F5F7",
    width: "100%",
    marginTop: 12,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default OnboardingScreen;