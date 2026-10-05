import { Dimensions, Text, View } from "react-native";
import { MotiView } from "moti";
import { FontAwesome5 } from "@expo/vector-icons";
import { LineChart } from "react-native-gifted-charts";

const screenWidth = Dimensions.get("window").width;

function MaxPriceTrendChart({ t, history, empty, location }) {
  const chartData = (history || []).map((point) => ({
    value: point.maxPrice,
    label: point.date,
    dataPointText: String(point.maxPrice),
  }));

  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400, delay: 100 }}
      className="rounded-2xl bg-white border border-gray-100 p-5"
    >
      <View className="flex-row items-center justify-between mb-4 flex-wrap gap-2">
        <View className="flex-row items-center gap-2">
          <FontAwesome5 name="chart-line" size={16} color="#1d4ed8" />
          <Text className="text-base font-bold text-gray-800">{t("maxPriceTrend")}</Text>
        </View>
        {!empty && location && (
          <View className="flex-row items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
            <FontAwesome5 name="map-marker-alt" size={10} color="#1d4ed8" />
            <Text className="text-xs font-medium text-gray-500">{location}</Text>
          </View>
        )}
      </View>

      {empty ? (
        <Text className="text-gray-500 text-sm">{t("fillFormPrompt")}</Text>
      ) : chartData.length === 0 ? (
        <Text className="text-gray-500 text-sm">{t("noHistoryData")}</Text>
      ) : (
        <View style={{ paddingVertical: 8 }}>
          <LineChart
            data={chartData}
            width={screenWidth - 90}
            height={200}
            color="#dc2626"
            thickness={2.5}
            dataPointsColor="#dc2626"
            yAxisTextStyle={{ color: "#6b7280", fontSize: 11 }}
            xAxisLabelTextStyle={{ color: "#6b7280", fontSize: 9 }}
            rulesColor="#e5e7eb"
            yAxisColor="transparent"
            xAxisColor="#e5e7eb"
            curved
            areaChart
            startFillColor="#fee2e2"
            endFillColor="#ffffff"
            startOpacity={0.6}
            endOpacity={0.05}
            noOfSections={4}
            spacing={Math.max(32, (screenWidth - 120) / Math.max(chartData.length, 1))}
          />
        </View>
      )}
    </MotiView>
  );
}

export default MaxPriceTrendChart;
