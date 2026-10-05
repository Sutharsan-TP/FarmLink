import { Pressable, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MotiView } from "moti";
import { FontAwesome5 } from "@expo/vector-icons";
import { TextInput } from "react-native";

// Hardcoded reference taxonomy ported verbatim from the original
// website/frontend/src/pages/Farmer/components/FarmerForm.jsx.
const STATE_DISTRICT_MAP = {
  "Andhra Pradesh": [
    "Alluri Sitharama Raju",
    "Anakapalli",
    "Ananthapuramu",
    "Annamayya",
    "Bapatla",
    "Chittoor",
    "Dr. B.R. Ambedkar Konaseema",
    "East Godavari",
    "Eluru",
    "Guntur",
    "Kakinada",
    "Krishna",
    "Kurnool",
    "Nandyal",
    "NTR",
    "Palnadu",
    "Parvathipuram Manyam",
    "Prakasam",
    "SPSR Nellore",
    "Srikakulam",
    "Sri Sathya Sai",
    "Tirupati",
    "Visakhapatnam",
    "Vizianagaram",
    "West Godavari",
    "YSR Kadapa",
  ],
};

const CROPS = ["Tomato", "Onion", "Potato", "Green Chilli", "Brinjal", "Cauliflower"];

const MARKET_OPTIONS = {
  Tomato: [
    "B.Kothakota H/Q Angallu",
    "Guramkonda Sub-yard of AMC Valmikipuram",
    "Kalikiri APMC",
    "Madanapalli APMC",
    "Mulakalacheruvu APMC",
    "Punganur APMC",
    "Valmikipuram APMC",
    "Palamaner APMC",
    "V. Kota Sub-yard of AMC Palamaneru",
    "Somala APMC",
  ],
  Onion: ["Kurnool APMC"],
  Potato: ["Palamaner APMC"],
  "Green Chilli": ["Palamaner APMC"],
  Brinjal: ["Palamaner APMC"],
  Cauliflower: ["Palamaner APMC"],
};

export { STATE_DISTRICT_MAP, CROPS, MARKET_OPTIONS };

function FieldLabel({ icon, children }) {
  return (
    <View className="flex-row items-center gap-2 mb-1.5">
      {icon && <FontAwesome5 name={icon} size={12} color="#1d4ed8" />}
      <Text className="font-semibold text-gray-700 text-sm">{children}</Text>
    </View>
  );
}

const fieldWrapClass =
  "w-full border-2 border-gray-200 rounded-xl bg-white overflow-hidden";

function FarmerForm({ t, formData, onChange, onSubmit, loading }) {
  const availableMarkets = formData.crop ? MARKET_OPTIONS[formData.crop] || [] : [];

  return (
    <MotiView
      from={{ opacity: 0, translateX: -16 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: 400 }}
      className="rounded-2xl bg-white border border-gray-100 p-5"
    >
      <View className="flex-row items-center gap-2 mb-5">
        <FontAwesome5 name="seedling" size={16} color="#1d4ed8" />
        <Text className="text-xl font-bold text-gray-800">{t("farmerDetails")}</Text>
      </View>

      <View className="gap-4">
        <View>
          <FieldLabel icon="map-marker-alt">{t("state")}</FieldLabel>
          <View className={fieldWrapClass}>
            <Picker
              selectedValue={formData.state}
              onValueChange={(value) => onChange("state", value)}
            >
              <Picker.Item label={t("selectState")} value="" />
              <Picker.Item label="Andhra Pradesh" value="Andhra Pradesh" />
            </Picker>
          </View>
        </View>

        <View>
          <FieldLabel icon="seedling">{t("crop")}</FieldLabel>
          <View className={fieldWrapClass}>
            <Picker
              selectedValue={formData.crop}
              onValueChange={(value) => onChange("crop", value)}
            >
              <Picker.Item label={t("selectCrop")} value="" />
              {CROPS.map((crop) => (
                <Picker.Item key={crop} label={crop} value={crop} />
              ))}
            </Picker>
          </View>
        </View>

        <View>
          <FieldLabel icon="map-marker-alt">{t("market")}</FieldLabel>
          <View className={fieldWrapClass}>
            <Picker
              enabled={!!formData.crop}
              selectedValue={formData.market}
              onValueChange={(value) => onChange("market", value)}
            >
              <Picker.Item
                label={formData.crop ? t("selectMarket") : t("selectCropFirst")}
                value=""
              />
              {availableMarkets.map((market) => (
                <Picker.Item key={market} label={market} value={market} />
              ))}
            </Picker>
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <FieldLabel>{t("latitude")}</FieldLabel>
            <TextInput
              keyboardType="numeric"
              value={formData.latitude}
              onChangeText={(v) => onChange("latitude", v)}
              placeholder={`${t("example")} 13.552040`}
              className="border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base bg-white"
            />
          </View>
          <View className="flex-1">
            <FieldLabel>{t("longitude")}</FieldLabel>
            <TextInput
              keyboardType="numeric"
              value={formData.longitude}
              onChangeText={(v) => onChange("longitude", v)}
              placeholder={`${t("example")} 78.505798`}
              className="border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base bg-white"
            />
          </View>
        </View>

        <View>
          <FieldLabel>{t("language")}</FieldLabel>
          <View className={fieldWrapClass}>
            <Picker
              selectedValue={formData.language}
              onValueChange={(value) => onChange("language", value)}
            >
              <Picker.Item label={t("selectLanguage")} value="" />
              <Picker.Item label="English" value="English" />
              <Picker.Item label="தமிழ்" value="Tamil" />
              <Picker.Item label="తెలుగు" value="Telugu" />
              <Picker.Item label="हिन्दी" value="Hindi" />
            </Picker>
          </View>
        </View>
      </View>

      <Pressable
        onPress={onSubmit}
        disabled={loading}
        className={`mt-6 w-full bg-green-700 active:bg-green-800 px-8 py-4 rounded-xl ${
          loading ? "opacity-60" : ""
        }`}
      >
        <Text className="text-white font-bold text-lg text-center">
          {loading ? "…" : t("getAdvisory")}
        </Text>
      </Pressable>
    </MotiView>
  );
}

export default FarmerForm;
