import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { FontAwesome5 } from "@expo/vector-icons";

const STAGES = [
  { icon: "cloud-sun", text: "Fetching Weather..." },
  { icon: "chart-line", text: "Checking Market..." },
  { icon: "seedling", text: "Analyzing Crop..." },
  { icon: "robot", text: "Generating AI Recommendation..." },
];

function LoadingScreen() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        backgroundColor: "rgba(23, 45, 115, 0.95)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
      }}
    >
      <View style={{ width: "100%", maxWidth: 320, alignItems: "center" }}>
        <MotiView
          from={{ rotate: "0deg" }}
          animate={{ rotate: "360deg" }}
          transition={{ type: "timing", duration: 2000, loop: true }}
          style={{
            marginBottom: 24,
            height: 64,
            width: 64,
            borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.1)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome5 name={STAGES[stage].icon} size={28} color="#bef264" />
        </MotiView>

        <AnimatePresence exitBeforeEnter>
          <MotiView
            key={stage}
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -8 }}
            transition={{ type: "timing", duration: 250 }}
          >
            <Text
              style={{ color: "white", fontSize: 18, fontWeight: "600", textAlign: "center" }}
            >
              {STAGES[stage].text}
            </Text>
          </MotiView>
        </AnimatePresence>

        <View
          style={{
            marginTop: 24,
            height: 6,
            width: "100%",
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.15)",
            overflow: "hidden",
          }}
        >
          <MotiView
            from={{ width: "0%" }}
            animate={{ width: `${((stage + 1) / STAGES.length) * 100}%` }}
            transition={{ type: "timing", duration: 400 }}
            style={{ height: "100%", borderRadius: 999, backgroundColor: "#bef264" }}
          />
        </View>
      </View>
    </View>
  );
}

export default LoadingScreen;
