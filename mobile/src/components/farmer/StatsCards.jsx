import { Text, View } from "react-native";
import { MotiView } from "moti";
import { FontAwesome5 } from "@expo/vector-icons";

function StatCard({ icon, label, value, accent, delay }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400, delay }}
      className="flex-1 min-w-[45%] rounded-2xl bg-white border border-gray-100 p-4 flex-row items-center gap-3.5"
    >
      <View
        className="h-11 w-11 rounded-xl items-center justify-center"
        style={{ backgroundColor: accent }}
      >
        <FontAwesome5 name={icon} size={16} color="white" />
      </View>
      <View className="flex-1">
        <Text className="text-xs font-medium text-gray-500" numberOfLines={1}>
          {label}
        </Text>
        <Text className="text-base font-bold text-gray-800" numberOfLines={1}>
          {value}
        </Text>
      </View>
    </MotiView>
  );
}

function StatsCards({ t, advisory }) {
  const weatherValue = advisory ? advisory.weather.temperature : "—";
  const marketValue = advisory ? advisory.market.modalPrice : "—";
  const aiValue = advisory ? t("aiReady") : "Standing by";

  return (
    <View className="flex-row flex-wrap gap-3">
      <StatCard
        icon="cloud-sun"
        label={t("weather")}
        value={weatherValue}
        accent="#0ea5e9"
        delay={0}
      />
      <StatCard
        icon="rupee-sign"
        label={t("marketPrice")}
        value={marketValue}
        accent="#f97316"
        delay={50}
      />
      <StatCard
        icon="robot"
        label={t("aiStatus")}
        value={aiValue}
        accent="#16a34a"
        delay={100}
      />
      <StatCard
        icon="map-marker-alt"
        label={t("selectedMarket")}
        value={advisory ? advisory.market.marketName : "—"}
        accent="#9333ea"
        delay={150}
      />
    </View>
  );
}

export default StatsCards;
