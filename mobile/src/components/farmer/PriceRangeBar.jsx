import { Text, View } from "react-native";
import { MotiView } from "moti";

function PriceRangeBar({ low, modal, high, lowLabel, modalLabel, highLabel }) {
  const span = Math.max(high - low, 1);
  const markerPercent = Math.min(100, Math.max(0, ((modal - low) / span) * 100));

  return (
    <View className="mt-4">
      <View className="relative h-3 rounded-full bg-amber-200 overflow-visible">
        <MotiView
          from={{ left: "50%" }}
          animate={{ left: `${markerPercent}%` }}
          transition={{ type: "timing", duration: 600 }}
          style={{ position: "absolute", top: -6, marginLeft: -12 }}
        >
          <View className="h-6 w-6 rounded-full bg-white border-4 border-green-700" />
        </MotiView>
      </View>
      <View className="flex-row justify-between mt-2">
        <Text className="text-[11px] font-semibold text-gray-500">{lowLabel}</Text>
        <Text className="text-[11px] font-semibold text-green-700">{modalLabel}</Text>
        <Text className="text-[11px] font-semibold text-gray-500">{highLabel}</Text>
      </View>
    </View>
  );
}

export default PriceRangeBar;
