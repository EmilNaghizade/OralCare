import { StyleSheet, Text, TextStyle, View } from "react-native";
import React from "react";
import { verticalScale } from "../utils/styling";
import normalize from "../utils/normalize";

const Typo = ({
  size,
  color,
  fontWeight = "400",
  children,
  style,
  textProps = {},
}) => {
  const textStyle = {
    fontSize: normalize(size),
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
