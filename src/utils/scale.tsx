// src/utils/scale.ts
import { Dimensions, PixelRatio, ScaledSize } from 'react-native';

type ScaleFns = {
  /** scale by screen width vs a "design" base width */
  mWidth: (size: number) => number;
  /** scale by screen height vs a "design" base height */
  mHeight: (size: number) => number;
  /** tween between original size and scaled size */
  ms: (size: number, factor?: number) => number;
  // /** moderate vertical scale */
  // mvs: (size: number, factor?: number) => number;
  /** responsive font size (pixel-rounded) */
  font: (size: number, factor?: number) => number;
  /** update guideline base (if you want a different design baseline) */
  setGuideline: (w: number, h: number) => void;
  /** current window metrics */
  metrics: () => { width: number; height: number; isPortrait: boolean };
};

// Default “design baseline” (change to your Figma artboard size)
let GUIDELINE_BASE_WIDTH = 440; // iPhone 17 Pro Max width
let GUIDELINE_BASE_HEIGHT = 956; // iPhone 17 Pro Max height

let { width, height } = Dimensions.get('window');

const updateMetrics = ({
  window,
}: {
  window: ScaledSize;
  screen: ScaledSize;
}) => {
  width = window.width;
  height = window.height;
};

// listen for rotation / split-screen changes
Dimensions.addEventListener('change', updateMetrics);

// core helpers
const _scale = (size: number) => (width / GUIDELINE_BASE_WIDTH) * size;
const _verticalScale = (size: number) =>
  (height / GUIDELINE_BASE_HEIGHT) * size;
/**
 * moderateScale: interpolate between original size and scaled size
 * factor 0.0 => no scale, 1.0 => full scale
 */
const _moderate = (size: number, factor = 0.5) =>
  size + (_scale(size) - size) * factor;

/** responsive font (moderateScale + pixel round) */
const _rf = (size: number, factor = 0.5) =>
  PixelRatio.roundToNearestPixel(_moderate(size, factor));

const scale: ScaleFns = {
  mWidth: _scale,
  mHeight: _verticalScale,
  ms: _moderate,
  // mvs: _moderateV,
  font: _rf,
  setGuideline: (w: number, h: number) => {
    GUIDELINE_BASE_WIDTH = w;
    GUIDELINE_BASE_HEIGHT = h;
  },
  metrics: () => ({
    width,
    height,
    isPortrait: height >= width,
  }),
};

export default scale;
