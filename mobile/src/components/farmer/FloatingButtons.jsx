import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { FontAwesome5 } from "@expo/vector-icons";

function FloatingButtons({ t, onNearbyMarkets, onHelpline, onAskAgain }) {
  const [open, setOpen] = useState(false);

  const actions = [
    {
      key: "nearby",
      icon: "map-marked-alt",
      label: t("nearbyMarkets"),
      onClick: onNearbyMarkets,
      bg: "#2563eb",
    },
    {
      key: "helpline",
      icon: "phone-alt",
      label: t("helpline"),
      onClick: onHelpline,
      bg: "#dc2626",
    },
    {
      key: "askAgain",
      icon: "redo",
      label: t("askAgain"),
      onClick: onAskAgain,
      bg: "#16a34a",
    },
  ];

  return (
    <View
      style={{ position: "absolute", bottom: 24, right: 20, alignItems: "flex-end", gap: 12 }}
    >
      <AnimatePresence>
        {open &&
          actions.map((action, i) => (
            <MotiView
              key={action.key}
              from={{ opacity: 0, translateY: 10, scale: 0.8 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              exit={{ opacity: 0, translateY: 10, scale: 0.8 }}
              transition={{ type: "timing", duration: 150, delay: i * 40 }}
            >
              <Pressable
                onPress={() => {
                  action.onClick?.();
                  setOpen(false);
                }}
                style={{ backgroundColor: action.bg }}
                className="flex-row items-center gap-2.5 pl-4 pr-5 py-3 rounded-full"
              >
                <FontAwesome5 name={action.icon} size={14} color="white" />
                <Text className="text-white font-semibold text-sm">{action.label}</Text>
              </Pressable>
            </MotiView>
          ))}
      </AnimatePresence>

      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="h-14 w-14 rounded-full bg-green-700 items-center justify-center"
      >
        <FontAwesome5 name={open ? "times" : "plus"} size={18} color="white" />
      </Pressable>
    </View>
  );
}

export default FloatingButtons;
