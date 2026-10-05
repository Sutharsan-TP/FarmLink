import { Text, View } from "react-native";
import { MotiView } from "moti";
import { FontAwesome5 } from "@expo/vector-icons";

function Row({ icon, label, value }) {
  return (
    <View className="flex-row items-start gap-3 py-2.5 border-b border-green-50">
      <FontAwesome5 name={icon} size={13} color="#1d4ed8" style={{ marginTop: 2 }} />
      <View className="flex-1">
        <Text className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </Text>
        <Text className="text-sm text-gray-800 font-medium">{value}</Text>
      </View>
    </View>
  );
}

function CropCard({ t, data, empty }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400, delay: 150 }}
      className="rounded-2xl bg-lime-50 border border-lime-100 p-5"
    >
      <View className="flex-row items-center gap-2 mb-2">
        <FontAwesome5 name="seedling" size={16} color="#2e8bb3" />
        <Text className="text-base font-bold text-gray-800">{t("cropKnowledge")}</Text>
      </View>

      {empty ? (
        <Text className="text-gray-500 text-sm mt-2">{t("fillFormPrompt")}</Text>
      ) : (
        <View className="mt-2">
          <Row icon="calendar-check" label={t("harvestTips")} value={data.harvestTip} />
          <Row icon="box-open" label={t("storageTips")} value={data.storageTip} />
          <Row icon="clock" label={t("bestSellingPeriod")} value={data.bestSellingPeriod} />
          <Row icon="flask" label={t("fertilizerAdvice")} value={data.fertilizerAdvice} />
          <Row icon="tint" label={t("waterRequirement")} value={data.waterRequirement} />
        </View>
      )}
    </MotiView>
  );
}

export default CropCard;
