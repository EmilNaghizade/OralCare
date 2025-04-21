import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "../components/BackButton";
import { VideoCard } from "../components/VideoCard";
import { dummyVideos } from "./data";

export default function Education() {

  const renderVideos = ({ item }) => <VideoCard item={item} style={{width: "47%"}} />;

  return (
    <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerButtons}>
            <BackButton />

          </View>
          <Text style={styles.headerTitle}>Watch & Learn</Text>
        </View>

        {/* Articles Grid */}

        <FlatList
          data={dummyVideos}
          renderItem={renderVideos}
          keyExtractor={(item) => item._id.toString()}
          numColumns={2}
          contentContainerStyle={styles.articleGrid}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: { paddingBottom: 30, backgroundColor: "#f0f2f5" },
  header: {
    height: 140, // Header yüksekliği
    justifyContent: "flex-end", // Başlığı dikeyde ortala
    backgroundColor: "#fff", // Beyaz header arka planı
    paddingBottom: 20, // Alt boşluk
    paddingHorizontal: 20, // Yan boşluklar
    // Alt köşeleri yuvarlatma
    borderBottomLeftRadius: 24, // <<< YUVARLAK KÖŞE
    borderBottomRightRadius: 24, // <<< YUVARLAK KÖŞE
  },
  headerButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    marginVertical: 16,
    fontWeight: "bold",
    marginHorizontal: 8,
    color: "#000",
  },
  shareButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: "row",
    paddingVertical: 12,
    marginHorizontal: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginRight: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#E3ECF0",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748B",
  },
  activeTabText: {
    color: "#000",
  },
  articleGrid: {
    padding: 8,
    marginTop: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
});
