import { Image, Text, View } from "react-native";
import { MotiView } from "moti";
import { FontAwesome5 } from "@expo/vector-icons";

function getGreetingKey() {
  const hour = new Date().getHours();
  if (hour < 12) return "goodMorning";
  if (hour < 17) return "goodAfternoon";
  return "goodEvening";
}

function Hero({ t, weatherSummary, aiReady }) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <View className="overflow-hidden rounded-3xl bg-green-700">
      <View className="flex-row items-center gap-4 px-6 py-8">
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
          className="flex-1"
        >
          <Text className="text-2xl font-extrabold text-white">
            {t(getGreetingKey())} 👋
          </Text>
          <Text className="mt-1.5 text-white/85 text-sm">{today}</Text>
          <Text className="mt-3 text-white/90 text-base">{t("heroTagline")}</Text>

          <View className="mt-5 flex-row flex-wrap gap-3">
            <View className="flex-row items-center gap-2 bg-white/15 rounded-full px-4 py-2">
              <FontAwesome5 name="cloud-sun" size={12} color="#fef08a" />
              <Text className="text-white text-sm font-medium">{weatherSummary}</Text>
            </View>
            <View className="flex-row items-center gap-2 bg-white/15 rounded-full px-4 py-2">
              <View
                className={`h-2 w-2 rounded-full ${
                  aiReady ? "bg-lime-300" : "bg-yellow-300"
                }`}
              />
              <Text className="text-white text-sm font-medium">{t("aiReady")}</Text>
            </View>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 500, delay: 100 }}
        >
          <Image
            source={require("../../../assets/hero.png")}
            style={{ height: 100, width: 100 }}
            resizeMode="contain"
          />
        </MotiView>
      </View>
    </View>
  );
}

export default Hero;
