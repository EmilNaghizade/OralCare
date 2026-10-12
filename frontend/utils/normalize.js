// utils/normalize.js
import { Dimensions, PixelRatio, Platform } from "react-native";

export const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const { height: SCREEN_HEIGHT } = Dimensions.get("window");
// Tasarımda baz aldığın genişlik (örn. 375)
const BASE_WIDTH = 375;

export default function normalize(size) {
  const scale = SCREEN_WIDTH / BASE_WIDTH;

  // Küçük ekranlarda ekstra shrink faktörü:
  const adjustedScale =
    scale < 1
      ? Math.pow(scale, 1.2)   // non-linear shrink
      : scale;

  const newSize = size * adjustedScale;

  return Platform.OS === "ios"
    ? Math.round(PixelRatio.roundToNearestPixel(newSize))
    : Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
}