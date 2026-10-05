import { Linking, Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

const GOVT_LINKS = [
  { label: "PM-KISAN", url: "https://pmkisan.gov.in" },
  { label: "eNAM (National Agriculture Market)", url: "https://enam.gov.in" },
  { label: "Agmarknet", url: "https://agmarknet.gov.in" },
  { label: "Ministry of Agriculture", url: "https://agriculture.gov.in" },
];

function Footer({ t }) {
  return (
    <View className="mt-10 rounded-t-3xl bg-gray-900 px-6 py-10">
      <View className="gap-8">
        <View>
          <View className="flex-row items-center gap-2 mb-3">
            <FontAwesome5 name="shield-alt" size={16} color="#60a5fa" />
            <Text className="text-white font-bold text-lg">FarmSafe</Text>
          </View>
          <Text className="text-sm text-gray-400 leading-relaxed">{t("footerAbout")}</Text>
        </View>

        <View>
          <Text className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
            {t("govtLinks")}
          </Text>
          <View className="gap-2">
            {GOVT_LINKS.map((link) => (
              <Text
                key={link.label}
                onPress={() => Linking.openURL(link.url)}
                className="text-sm text-gray-400"
              >
                {link.label}
              </Text>
            ))}
          </View>
        </View>

        <View>
          <Text className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
            {t("helplineNumber")}
          </Text>
          <Text
            onPress={() => Linking.openURL("tel:18001801551")}
            className="text-lg font-bold text-blue-400"
          >
            1800-180-1551
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            Kisan Call Centre — toll free, all days
          </Text>
        </View>
      </View>

      <View className="border-t border-white/10 mt-8 pt-4 items-center">
        <Text className="text-xs text-gray-500">
          © {new Date().getFullYear()} FarmSafe. Built for farmers.
        </Text>
      </View>
    </View>
  );
}

export default Footer;
