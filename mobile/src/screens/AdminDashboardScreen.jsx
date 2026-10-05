import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { MotiView } from "moti";
import { FontAwesome5 } from "@expo/vector-icons";
import api from "../services/api";

function formatTimestamp(iso) {
  if (!iso) return "Never synced yet";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatBlock({ icon, label, value }) {
  return (
    <View className="rounded-xl bg-white border border-gray-100 p-4 flex-row items-center gap-3 flex-1">
      <View className="h-10 w-10 rounded-lg bg-green-100 items-center justify-center">
        <FontAwesome5 name={icon} size={16} color="#1d4ed8" />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-gray-500 font-medium">{label}</Text>
        <Text className="text-base font-bold text-gray-800" numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function AdminDashboardScreen() {
  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);

  const loadStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const res = await api.get("/admin/sync-status");
      setStatus(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Could not reach the backend. Is the API running?");
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleSync = async () => {
    setSyncing(true);
    setLastResult(null);
    setError(null);
    try {
      const res = await api.post("/admin/sync-prices");
      setLastResult(res.data);
      await loadStatus();
    } catch (err) {
      console.error(err);
      setError("Sync failed. Please check the backend and try again.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <View className="flex-1 bg-[#f7f9fc]">
      <View className="bg-white border-b border-gray-100 px-4 py-4 flex-row items-center gap-3 pt-14">
        <View className="h-11 w-11 rounded-xl bg-green-700 items-center justify-center">
          <FontAwesome5 name="shield-alt" size={18} color="white" />
        </View>
        <View>
          <Text className="text-xl font-extrabold text-gray-900">FarmSafe Admin</Text>
          <Text className="text-xs text-green-700 font-medium">Market Data Console</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
          className="rounded-3xl bg-green-700 p-6"
        >
          <Text className="text-xl font-bold text-white">Daily Mandi Price Sync</Text>
          <Text className="mt-1 text-white/85 text-sm">
            Pull today's market prices into FarmSafe so every farmer sees
            up-to-date rates. Run this once a day, ideally each morning.
          </Text>

          <Pressable
            onPress={handleSync}
            disabled={syncing}
            className={`mt-5 flex-row items-center justify-center gap-2 bg-white px-6 py-3.5 rounded-xl ${
              syncing ? "opacity-70" : ""
            }`}
          >
            <FontAwesome5 name="sync-alt" size={14} color="#1d4ed8" />
            <Text className="text-green-700 font-bold text-base">
              {syncing ? "Syncing..." : "Sync Today's Price"}
            </Text>
          </Pressable>
        </MotiView>

        {error && (
          <View className="flex-row items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <FontAwesome5 name="exclamation-triangle" size={14} color="#b91c1c" />
            <Text className="text-red-700 text-sm font-medium flex-1">{error}</Text>
          </View>
        )}

        {lastResult && (
          <View className="flex-row items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <FontAwesome5 name="check-circle" size={14} color="#15803d" />
            <Text className="text-green-800 text-sm font-medium flex-1">
              {lastResult.message}
            </Text>
          </View>
        )}

        <View className="gap-3">
          <StatBlock
            icon="history"
            label="Last Synced"
            value={loadingStatus ? "Loading..." : formatTimestamp(status?.lastSyncedAt)}
          />
          <StatBlock
            icon="sync-alt"
            label="Records Added Last Sync"
            value={loadingStatus ? "…" : status?.lastRecordsAdded ?? 0}
          />
          <StatBlock
            icon="database"
            label="Total Price Records"
            value={loadingStatus ? "…" : status?.totalRecords ?? 0}
          />
        </View>

        <View className="rounded-2xl bg-white border border-gray-100 p-5">
          <Text className="font-semibold text-gray-800 mb-1.5">How this works</Text>
          <Text className="text-sm text-gray-600 leading-relaxed">
            Syncing checks every market + crop combination already tracked in
            FarmSafe and adds today's price if it isn't there yet, so it's
            safe to click more than once a day. Until a live government mandi
            price feed (e.g. Agmarknet / data.gov.in) is connected on the
            backend, today's prices are generated from the most recent known
            price for each market with a small realistic day-to-day
            fluctuation, keeping the dashboard fully demoable end to end.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

export default AdminDashboardScreen;
