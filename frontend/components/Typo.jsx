import { StyleSheet, Text, TextStyle, View } from "react-native";
import React from "react";
import { verticalScale } from "../utils/styling";

const Typo = ({
  size,
  color,
  fontWeight = "400",
  children,
  style,
  textProps = {},
}) => {
  const textStyle = {
    fontSize: size ? verticalScale(size) : verticalScale(18),
    color,
    fontWeight,
  };
  return (
    <Text {...textProps} style={[textStyle, style]} numberOfLines={3} ellipsizeMode="tail">
      {children}
    </Text>
  );
};

export default Typo;

const styles = StyleSheet.create({});
