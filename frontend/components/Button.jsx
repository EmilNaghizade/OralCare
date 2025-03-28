import { StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import Loading from "./Loading";

const Button = ({ style, onPress, loading = false, children }) => {
  if (loading) {
    return (
      <View style={[style, styles.button, { backgroundColor: "transparent" }]}>
        <Loading />
      </View>
    );
  }
  return (
    <TouchableOpacity
      style={[style, styles.button]}
      onPress={onPress}
      disabled={loading}
    >
      {children}
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 8,
    paddingVertical: 16,
    gap: 8,
    borderRadius: 39,
    alignItems: "center",
  },
});
