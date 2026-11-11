import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import Svg, { Circle, G, Path, Polyline, Rect } from "react-native-svg";
import {
  ZSBox,
  ZSPressable,
  ZSText,
  radiusStyle,
  useTheme,
  withOpacity,
} from "@0610studio/zs-ui";
import { GAP } from "../../kit/layout";
import { getCategory } from "../../../model/diary/categories";
import {
  DETAIL_TEXT,
  weatherInfo,
  type WeatherIcon,
} from "../../../model/diary/detail";
import type { DiaryRecord, RecordWeather } from "../../../model/diary/records";

const WEATHER_ICONS: Record<WeatherIcon, number> = {
  sun: require("../../../../assets/barabom/weather/weather_sun.png"),
  partly: require("../../../../assets/barabom/weather/weather_partly_cloudy.png"),
  overcast: require("../../../../assets/barabom/weather/weather_overcast_cloudy.png"),
  rain: require("../../../../assets/barabom/weather/weather_rain.png"),
  snow: require("../../../../assets/barabom/weather/weather_snow.png"),
};

/** 날씨 값 — 아이콘 · 이름 · 기온. 산책 시간·거리와 같은 목록 줄(InfoRow)의 값으로 쓴다 */
export function WeatherValue({ weather }: { weather: RecordWeather }) {
  const info = weatherInfo(weather);
  if (!info) return null;
  return (
    <View style={styles.weather}>
      <Image
        source={WEATHER_ICONS[info.icon]}
        style={styles.weatherIcon}
        resizeMode="contain"
      />
      <ZSText variant="subtitle1">
        {weather.tmp ? `${info.name} ${weather.tmp}°C` : info.name}
      </ZSText>
    </View>
  );
}

export function WalkRouteMap({
  route,
  stops,
  onPress,
}: {
  route: { x: number; y: number }[];
  stops: DiaryRecord[];
  onPress: () => void;
}) {
  const { colors, mode } = useTheme();
  const dark = mode === "dark";
  const [width, setWidth] = useState(0);
  const height = 150;
  const inset = 14;
  const px = (x: number) => inset + x * (width - inset * 2);
  const py = (y: number) => inset + y * (height - inset * 2);
  const ground = dark ? "#23262b" : "#eef1ec";
  const green = dark ? "#24372a" : "#d5ead2";
  const water = dark ? "#1d3140" : "#cfe5f3";
  const road = dark ? "#3a3f46" : "#ffffff";
  const points = route
    .map((point) => `${px(point.x)},${py(point.y)}`)
    .join(" ");
  const start = route[0];
  const end = route[route.length - 1];
  return (
    <ZSPressable
      onPress={onPress}
      radius="lg"
      accessibilityRole="button"
      accessibilityLabel={`${DETAIL_TEXT.walkRoute} 크게 보기`}
      testID="record-route"
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[styles.map, radiusStyle("lg"), { borderColor: colors.border }]}
    >
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Rect x={0} y={0} width={width} height={height} fill={ground} />
          <Path
            d={`M0 ${height * 0.82} C ${width * 0.35} ${height * 0.7}, ${width * 0.6} ${height * 1.02}, ${width} ${height * 0.86} L ${width} ${height} L 0 ${height} Z`}
            fill={water}
          />
          <Rect
            x={width * 0.18}
            y={height * 0.12}
            width={width * 0.3}
            height={height * 0.3}
            rx={14}
            fill={green}
          />
          <Rect
            x={width * 0.62}
            y={height * 0.5}
            width={width * 0.28}
            height={height * 0.24}
            rx={14}
            fill={green}
          />
          <Path
            d={`M0 ${height * 0.62} L ${width} ${height * 0.52}`}
            stroke={road}
            strokeWidth={9}
          />
          <Polyline
            points={points}
            fill="none"
            stroke={road}
            strokeWidth={8}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Polyline
            points={points}
            fill="none"
            stroke={colors.primaryMark}
            strokeWidth={5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {stops.map((stop) => (
            <Circle
              key={stop.id}
              cx={px(stop.footprint?.place.x ?? 0.5)}
              cy={py(stop.footprint?.place.y ?? 0.5)}
              r={7}
              fill={getCategory(stop.category).color}
              stroke={road}
              strokeWidth={2}
            />
          ))}
          {[
            { point: start, label: "출발", fill: colors.primaryMark },
            { point: end, label: "도착", fill: colors.text },
          ].map(({ point, fill, label }) => (
            <G key={label}>
              <Circle
                cx={px(point.x)}
                cy={py(point.y)}
                r={9}
                fill={fill}
                stroke={road}
                strokeWidth={2.5}
              />
            </G>
          ))}
        </Svg>
      ) : null}
    </ZSPressable>
  );
}

function Trophy({ color }: { color: string }) {
  return (
    <Svg width={48} height={48} viewBox="0 0 48 48">
      <Path d="M14 8h20v8a10 10 0 01-20 0V8z" fill={color} />
      <Path
        d="M14 11H8a6 6 0 006 8M34 11h6a6 6 0 01-6 8"
        stroke={color}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <Rect x={21} y={25} width={6} height={9} fill={color} />
      <Rect x={14} y={34} width={20} height={6} rx={2} fill={color} />
    </Svg>
  );
}

export function CertificateCard({
  minutesLeft,
  onPress,
}: {
  minutesLeft: number;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <ZSPressable
      onPress={onPress}
      radius="xl"
      accessibilityRole="button"
      accessibilityLabel={`${DETAIL_TEXT.certificate}, ${minutesLeft}분 ${DETAIL_TEXT.certificateLeftSuffix}`}
      testID="record-certificate"
    >
      <ZSBox
        backgroundColor="surface2"
        style={[styles.certificate, radiusStyle("xl")]}
      >
        <View
          style={[
            styles.trophy,
            { backgroundColor: withOpacity(colors.primaryMark, 0.14) },
          ]}
        >
          <Trophy color={colors.primaryMark} />
        </View>
        <View style={styles.grow}>
          <ZSText variant="subtitle1" emphasized>
            {DETAIL_TEXT.certificate}
          </ZSText>
          <ZSText variant="body2" color="textSecondary">
            {DETAIL_TEXT.certificateHint}
          </ZSText>
          <ZSText variant="body2" color="textSecondary">
            <ZSText variant="body2" emphasized color="error">
              {DETAIL_TEXT.certificateLeft(minutesLeft)}
            </ZSText>
            {DETAIL_TEXT.certificateLeftSuffix}
          </ZSText>
        </View>
      </ZSBox>
    </ZSPressable>
  );
}

const styles = StyleSheet.create({
  weather: { flexDirection: "row", alignItems: "center", gap: GAP.xs + 2 },
  weatherIcon: { width: 24, height: 24 },
  grow: { flexGrow: 1, flexShrink: 1, gap: GAP.xxs },
  map: {
    width: "100%",
    height: 150,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  certificate: {
    flexDirection: "row",
    alignItems: "center",
    gap: GAP.lg,
    padding: GAP.lg,
  },
  trophy: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
