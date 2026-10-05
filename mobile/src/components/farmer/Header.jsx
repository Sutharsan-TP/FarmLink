import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { LANGUAGES } from "../../utils/translations";

function Header({ language, onLanguageChange, t, onLogout }) {
  const [langOpen, setLangOpen] = useState(false);

  return (
    <View className="bg-white border-b border-gray-100 px-4 py-3 pt-14 flex-row items-center justify-between">
      <View className="flex-row items-center gap-2.5 flex-1">
        <View className="h-10 w-10 rounded-xl bg-green-700 items-center justify-center">
          <FontAwesome5 name="shield-alt" size={16} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-extrabold text-gray-900" numberOfLines={1}>
            FarmSafe
          </Text>
          <Text className="text-xs text-green-700 font-medium" numberOfLines={1}>
            {t("subtitle")}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => setLangOpen(true)}
          className="flex-row items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-2"
        >
          <FontAwesome5 name="globe" size={12} color="#1d4ed8" />
          <Text className="text-sm font-medium text-gray-700">
            {language || t("selectLanguage")}
          </Text>
        </Pressable>

        <Pressable
          onPress={onLogout}
          className="flex-row items-center gap-2 bg-green-700 px-3.5 py-2.5 rounded-full"
        >
          <FontAwesome5 name="sign-out-alt" size={12} color="white" />
        </Pressable>
      </View>

      <Modal visible={langOpen} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/30 items-center justify-center"
          onPress={() => setLangOpen(false)}
        >
          <View className="bg-white rounded-xl overflow-hidden w-48">
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang}
                onPress={() => {
                  onLanguageChange(lang);
                  setLangOpen(false);
                }}
                className={`px-4 py-3 ${lang === language ? "bg-green-50" : ""}`}
              >
                <Text
                  className={
                    lang === language
                      ? "text-green-700 font-semibold"
                      : "text-gray-700"
                  }
                >
                  {lang}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default Header;
