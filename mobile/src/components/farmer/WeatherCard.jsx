import { Text, View } from "react-native";
import { MotiView } from "moti";
import { FontAwesome5 } from "@expo/vector-icons";

const CONDITION_CONFIG = {
  sunny: { icon: "sun", color: "#facc15" },
  cloudy: { icon: "cloud-sun", color: "#0ea5e9" },
  rainy: { icon: "cloud-rain", color: "#2563eb" },
};

function ProgressRow({ icon, label, value, percent, barColor }) {
  return (
    <View className="flex-row items-center gap-3">
      <FontAwesome5 name={icon} size={14} color="#9ca3af" />
      <View className="flex-1">
        <View className="flex-row justify-between mb-1">
          <Text className="text-xs font-semibold text-gray-500">{label}</Text>
          <Text className="text-sm font-bold text-gray-800">{value}</Text>
        </View>
        <View className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <View
            style={{
              width: `${Math.min(100, percent)}%`,
              backgroundColor: barColor,
            }}
            className="h-full rounded-full"
          />
        </View>
      </View>
    </View>
  );
}

function WeatherCard({ t, data, empty }) {
  const condition = data?.condition || "sunny";
  const config = CONDITION_CONFIG[condition] || CONDITION_CONFIG.sunny;

  const humidityPercent = parseFloat(String(data?.humidity).replace(/[^\d.]/g, "")) || 0;
  const rainfallPercent = parseFloat(String(data?.rainfall).replace(/[^\d.]/g, "")) || 0;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400 }}
      className="rounded-2xl bg-sky-50 border border-sky-100 p-5 flex-1"
    >
      <View className="flex-row items-center gap-2 mb-4">
        <FontAwesome5 name="cloud-sun" size={18} color="#0ea5e9" />
        <Text className="text-base font-bold text-gray-800">{t("weatherForecast")}</Text>
      </View>

      {empty ? (
        <Text className="text-gray-500 text-sm">{t("fillFormPrompt")}</Text>
      ) : (
        <View className="gap-5">
          <View className="flex-row items-center gap-4">
            <FontAwesome5 name={config.icon} size={44} color={config.color} />
            <View>
              <Text className="text-3xl font-extrabold text-gray-800">
                {data.temperature}
              </Text>
              <Text className="text-sm text-gray-500 font-medium">{t("temperature")}</Text>
            </View>
          </View>

          <View className="gap-3">
            <ProgressRow
              icon="tint"
              label={t("humidity")}
              value={data.humidity}
              percent={humidityPercent}
              barColor="#60a5fa"
            />
            <ProgressRow
              icon="cloud-rain"
              label={t("rainfall")}
              value={data.rainfall}
              percent={rainfallPercent}
              barColor="#0ea5e9"
            />
            <ProgressRow
              icon="wind"
              label={t("windSpeed")}
              value={data.windSpeed}
              percent={40}
              barColor="#9ca3af"
            />
          </View>
        </View>
      )}
    </MotiView>
  );
}

export default WeatherCard;
