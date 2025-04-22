import { ActivityIndicator, View } from "react-native";
import React from "react";

const Loading = ({ size = "large" }) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size={size} />
    </View>
  );
};

export default Loading;
