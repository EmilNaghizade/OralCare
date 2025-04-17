import { Animated,StyleSheet } from "react-native";
import React, { useRef, useEffect } from "react";

const AnimatedIcon = ({ iconSource }) => {
  const iconAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // First move down with a bounce effect
      Animated.spring(iconAnim, {
        toValue: 1,
        friction: 4, // Controls "bounciness"
        tension: 40, // Controls speed
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animatedIconStyle = {
    opacity: iconAnim,
    transform: [
      {
        translateY: iconAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-60, 0], // Start higher for more dramatic effect
        }),
      },
    ],
  };

  return (
    <Animated.Image
      source={iconSource}
      style={[styles.icon, animatedIconStyle]}
    />
  );
};

export default AnimatedIcon;

const styles = StyleSheet.create({
  icon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 30, // Space between icon and text
    // Adjust as needed for your design
  },
});
