// app/onboarding/index.jsx
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useRouter } from "expo-router";
import Button from "../../components/Button";
import Typo from "../../components/Typo";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import "../../i18n";

const { width } = Dimensions.get("window");

const LANGUAGES = [
  { code: "en", name: "EN", flag: "🇬🇧" },
  { code: "ru", name: "RU", flag: "🇷🇺" },
];

const OnboardingScreen = () => {
  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

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
      setShowLanguageDropdown(false);
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  const currentSlideData = slides[activeSlide] || {};
  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header with language selector */}
      <View style={styles.header}>
        <View style={styles.headerSpace} />
        <View style={styles.languageSelector}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
          >
            <Text style={styles.flagText}>{currentLanguage.flag}</Text>
            <Text style={styles.languageButtonText}>{currentLanguage.name}</Text>
            <Ionicons 
              name={showLanguageDropdown ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#038565" 
            />
          </TouchableOpacity>
          
          {showLanguageDropdown && (
            <View style={styles.dropdown}>
              {LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={styles.dropdownItem}
                  onPress={() => changeLanguage(language.code)}
                >
                  <Text style={styles.flagText}>{language.flag}</Text>
                  <Text style={styles.dropdownItemText}>{language.name}</Text>
                  {i18n.language === language.code && (
                    <Ionicons name="checkmark" size={16} color="#038565" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Carousel */}
      <View style={styles.carouselContainer}>
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
        />
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        <View style={styles.badge}>
          <Typo fontWeight="600" size={14} style={styles.badgeText}>
            {t("onboarding.welcome.badge", "🌟 Welcome to OralCare")}
          </Typo>
        </View>

        <Typo fontWeight="600" size={32} style={styles.title}>
          {currentSlideData.title}
        </Typo>
        <Typo fontWeight="400" size={18} style={styles.subtitle}>
          {currentSlideData.subtitle}
        </Typo>

        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, activeSlide === index && styles.activeDot]}
            />
          ))}
        </View>
      </View>

      {/* Bottom Buttons */}
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
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 10,
    width: "100%",
    zIndex: 10,
  },
  headerSpace: {
    flex: 1,
  },
  languageSelector: {
    position: 'relative',
    zIndex: 10,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F5F7",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#038565",
    marginHorizontal: 6,
  },
  flagText: {
    fontSize: 16,
  },
  dropdown: {
    position: 'absolute',
    top: 35,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 8,
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginHorizontal: 8,
    flex: 1,
  },
  carouselContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
    paddingBottom: 20,
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
  },
  pagination: {
    flexDirection: "row",
    marginTop: 25,
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
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 20 : 30,
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