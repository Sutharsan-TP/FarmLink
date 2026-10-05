import { Text, View } from "react-native";
import { MotiView } from "moti";
import { FontAwesome5 } from "@expo/vector-icons";
import PriceRangeBar from "./PriceRangeBar";

function TrendBadge({ trend }) {
  const map = {
    Increasing: { icon: "arrow-up", cls: "bg-green-100", color: "#15803d" },
    Decreasing: { icon: "arrow-down", cls: "bg-red-100", color: "#b91c1c" },
    Stable: { icon: "minus", cls: "bg-gray-100", color: "#4b5563" },
  };
  const conf = map[trend] || map.Stable;
  return (
    <View className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full ${conf.cls}`}>
      <FontAwesome5 name={conf.icon} size={10} color={conf.color} />
      <Text style={{ color: conf.color }} className="text-xs font-bold">
        {trend}
      </Text>
    </View>
  );
}

function PriceStat({ label, value, highlight }) {
  return (
    <View
      className={`rounded-xl py-3 px-2 items-center flex-1 ${
        highlight ? "bg-amber-50 border border-amber-200" : "bg-white"
      }`}
    >
      <Text className="text-[11px] text-gray-500 font-medium">{label}</Text>
      <Text
        className={`text-base font-extrabold mt-0.5 ${
          highlight ? "text-amber-700" : "text-gray-800"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}

function MarketCard({ t, data, empty }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400, delay: 50 }}
      className="rounded-2xl bg-amber-50 border border-amber-100 p-5 flex-1"
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <FontAwesome5 name="store" size={16} color="#f59e0b" />
          <Text className="text-base font-bold text-gray-800">{t("marketCard")}</Text>
        </View>
        {!empty && <TrendBadge trend={data.trend} />}
      </View>

      {empty ? (
        <Text className="text-gray-500 text-sm">{t("fillFormPrompt")}</Text>
      ) : (
        <>
          <Text className="text-sm font-semibold text-gray-600 mb-3">{data.marketName}</Text>
          <View className="flex-row gap-2.5">
            <PriceStat label={t("lowestPrice")} value={data.lowestPrice} />
            <PriceStat label={t("modalPrice")} value={data.modalPrice} highlight />
            <PriceStat label={t("highestPrice")} value={data.highestPrice} />
          </View>

          <PriceRangeBar
            low={data.lowestPriceValue}
            modal={data.modalPriceValue}
            high={data.highestPriceValue}
            lowLabel={t("lowestPrice")}
            modalLabel={t("modalPrice")}
            highLabel={t("highestPrice")}
          />

          <View className="mt-4 flex-row items-center gap-2">
            <FontAwesome5 name="calendar-alt" size={11} color="#9ca3af" />
            <Text className="text-xs text-gray-500">
              {t("arrivalDate")}: {data.arrivalDate}
            </Text>
          </View>
        </>
      )}
    </MotiView>
  );
}

export default MarketCard;
