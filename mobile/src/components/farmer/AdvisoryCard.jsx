import { Alert, Pressable, Text, View } from "react-native";
import { MotiView } from "moti";
import { FontAwesome5 } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import * as Speech from "expo-speech";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const RISK_COLORS = {
  Low: { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" },
  Medium: { bg: "#fef3c7", text: "#b45309", border: "#fde68a" },
  High: { bg: "#fee2e2", text: "#b91c1c", border: "#fecaca" },
};

const LANG_MAP = {
  English: "en-IN",
  Tamil: "ta-IN",
  Hindi: "hi-IN",
  Telugu: "te-IN",
};

function ConfidenceMeter({ value }) {
  return (
    <View className="flex-row items-center gap-2.5">
      <View className="flex-1 h-2.5 rounded-full bg-white/30 overflow-hidden">
        <MotiView
          from={{ width: "0%" }}
          animate={{ width: `${value}%` }}
          transition={{ type: "timing", duration: 800 }}
          className="h-full rounded-full bg-white"
        />
      </View>
      <Text className="text-sm font-bold text-white">{value}%</Text>
    </View>
  );
}

function handleReadAloud(advisory, crop, language) {
  const utterance = `${crop} advisory. ${advisory.recommendation}. Confidence ${advisory.confidence} percent. Risk level ${advisory.riskLevel}.`;
  Speech.stop();
  Speech.speak(utterance, { language: LANG_MAP[language] || "en-IN" });
}

async function handleDownloadPdf(advisory, formData) {
  const reasonsHtml = (advisory.reasons || [])
    .map((reason) => `<li>${reason}</li>`)
    .join("");

  const html = `
    <html>
      <body style="font-family: Helvetica, Arial, sans-serif; padding: 24px;">
        <h1 style="font-size: 22px;">FarmSafe - AI Advisory Report</h1>
        <p><strong>Crop:</strong> ${formData.crop || "-"} &nbsp;|&nbsp;
           <strong>Market:</strong> ${formData.market || "-"} &nbsp;|&nbsp;
           <strong>State:</strong> ${formData.state || "-"}</p>
        <h2 style="font-size: 16px;">Recommendation</h2>
        <p>${(advisory.recommendation || "").replace(/\n/g, "<br/>")}</p>
        <h2 style="font-size: 16px;">Reasons</h2>
        <ul>${reasonsHtml}</ul>
        <h2 style="font-size: 16px;">Confidence Score: ${advisory.confidence}%</h2>
        <h2 style="font-size: 16px;">Risk Level: ${advisory.riskLevel}</h2>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `FarmSafe_Advisory_${formData.crop || "crop"}.pdf`,
      });
    } else {
      Alert.alert("PDF ready", `Saved to: ${uri}`);
    }
  } catch (err) {
    console.error(err);
    Alert.alert("Could not generate PDF", err?.message || "Please try again.");
  }
}

function AdvisoryCard({ t, advisory, formData, empty, onAskAgain }) {
  const riskColors = RISK_COLORS[advisory?.riskLevel] || RISK_COLORS.Medium;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 18 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 450, delay: 150 }}
      className="rounded-3xl bg-emerald-700 p-6"
    >
      <View className="flex-row items-center gap-3 mb-5">
        <View className="h-11 w-11 rounded-xl bg-white/15 items-center justify-center">
          <FontAwesome5 name="robot" size={18} color="white" />
        </View>
        <Text className="text-xl font-bold text-white">{t("aiRecommendation")}</Text>
      </View>

      {empty ? (
        <Text className="text-white/80 text-sm">{t("fillFormPrompt")}</Text>
      ) : (
        <View>
          <Markdown
            style={{
              body: { color: "white", fontSize: 14, lineHeight: 20 },
              heading1: { color: "white" },
              heading2: { color: "white" },
              strong: { color: "white", fontWeight: "700" },
            }}
          >
            {advisory.recommendation}
          </Markdown>

          {advisory.reasons?.length > 0 && (
            <View className="mt-5">
              <Text className="text-sm font-semibold text-white/80 mb-2">
                {t("reasons")}
              </Text>
              <View className="gap-2">
                {advisory.reasons.map((reason, i) => (
                  <View key={i} className="flex-row items-start gap-2">
                    <FontAwesome5
                      name="check-circle"
                      size={13}
                      color="#bef264"
                      style={{ marginTop: 3 }}
                    />
                    <Text className="text-sm text-white/95 flex-1">{reason}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View className="mt-6 gap-4">
            <View className="bg-white/10 rounded-xl p-4">
              <Text className="text-xs font-semibold text-white/70 mb-2">
                {t("confidence")}
              </Text>
              <ConfidenceMeter value={advisory.confidence} />
            </View>
            <View className="bg-white/10 rounded-xl p-4 flex-row items-center justify-between">
              <Text className="text-xs font-semibold text-white/70">{t("riskLevel")}</Text>
              <View
                style={{
                  backgroundColor: riskColors.bg,
                  borderColor: riskColors.border,
                  borderWidth: 1,
                }}
                className="px-3 py-1 rounded-full"
              >
                <Text style={{ color: riskColors.text }} className="text-xs font-bold">
                  {advisory.riskLevel}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-6 flex-row flex-wrap gap-3">
            <Pressable
              onPress={() => handleReadAloud(advisory, formData.crop, formData.language)}
              className="flex-row items-center gap-2 bg-white/15 px-4 py-2.5 rounded-xl"
            >
              <FontAwesome5 name="volume-up" size={13} color="white" />
              <Text className="text-white text-sm font-semibold">{t("readAloud")}</Text>
            </Pressable>

            {/*
              Deviation from the original: web had separate "Download PDF"
              and "Print" buttons (window.print()). On mobile there's no
              native "print" concept distinct from sharing a generated PDF,
              so both actions point at the same expo-print + expo-sharing
              flow; the Print button is kept (labelled the same) since
              Android/iOS share sheets both expose system print options too.
            */}
            <Pressable
              onPress={() => handleDownloadPdf(advisory, formData)}
              className="flex-row items-center gap-2 bg-white/15 px-4 py-2.5 rounded-xl"
            >
              <FontAwesome5 name="file-pdf" size={13} color="white" />
              <Text className="text-white text-sm font-semibold">{t("downloadPdf")}</Text>
            </Pressable>

            <Pressable
              onPress={() => handleDownloadPdf(advisory, formData)}
              className="flex-row items-center gap-2 bg-white/15 px-4 py-2.5 rounded-xl"
            >
              <FontAwesome5 name="print" size={13} color="white" />
              <Text className="text-white text-sm font-semibold">{t("print")}</Text>
            </Pressable>

            <Pressable
              onPress={onAskAgain}
              className="flex-row items-center gap-2 bg-white px-4 py-2.5 rounded-xl ml-auto"
            >
              <Text className="text-green-700 text-sm font-bold">{t("askAgain")}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </MotiView>
  );
}

export default AdvisoryCard;
