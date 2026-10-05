import { useState } from "react";
import { Alert, Linking, ScrollView, View } from "react-native";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getTranslator } from "../utils/translations";
import { normalizeAdvisory } from "../utils/advisoryAdapter";

import Header from "../components/farmer/Header";
import Hero from "../components/farmer/Hero";
import StatsCards from "../components/farmer/StatsCards";
import FarmerForm from "../components/farmer/FarmerForm";
import WeatherCard from "../components/farmer/WeatherCard";
import MarketCard from "../components/farmer/MarketCard";
import MaxPriceTrendChart from "../components/farmer/MaxPriceTrendChart";
import CropCard from "../components/farmer/CropCard";
import AdvisoryCard from "../components/farmer/AdvisoryCard";
import FloatingButtons from "../components/farmer/FloatingButtons";
import Footer from "../components/farmer/Footer";
import LoadingScreen from "../components/farmer/LoadingScreen";

// Defaults mirror the server's own fallback defaults (Tomato / Andhra
// Pradesh / Palamaner / Palamaner APMC / 13.552040,78.505798 / Telugu) so
// an empty form still submits something sensible, same as the original.
const INITIAL_FORM = {
  state: "Andhra Pradesh",
  district: "",
  market: "",
  crop: "",
  latitude: "",
  longitude: "",
  language: "",
};

const DEFAULT_LAT = 13.55204;
const DEFAULT_LON = 78.505798;

function FarmerDashboardScreen() {
  const { logout } = useAuth();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [advisory, setAdvisory] = useState(null);
  const [priceHistory, setPriceHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  const t = getTranslator(formData.language);

  const handleChange = (name, value) => {
    if (name === "crop") {
      setFormData((prev) => ({ ...prev, crop: value, market: "" }));
      return;
    }
    if (name === "district") {
      setFormData((prev) => ({ ...prev, district: value, market: "" }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (language) => {
    setFormData((prev) => ({ ...prev, language }));
  };

  const fetchPriceHistory = async () => {
    try {
      const res = await api.get("/market/history", {
        params: {
          state: formData.state,
          district: formData.district,
          market: formData.market,
          crop: formData.crop,
          limit: 30,
        },
      });
      if (Array.isArray(res.data)) {
        setPriceHistory(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch price history:", err?.message);
    }
  };

  const handleSubmit = async () => {
    if (!formData.state || !formData.crop || !formData.market) {
      Alert.alert("Missing details", "Please select state, crop and market first.");
      return;
    }

    setLoading(true);

    try {
      // Unlike the original (which hardcoded these coordinates client-side
      // regardless of form input — a bug), we actually send whatever the
      // farmer entered, falling back to the same demo coordinates only when
      // the fields are left blank.
      const latitude = formData.latitude ? parseFloat(formData.latitude) : DEFAULT_LAT;
      const longitude = formData.longitude ? parseFloat(formData.longitude) : DEFAULT_LON;

      const response = await api.post("/advisory", {
        crop: formData.crop,
        state: formData.state,
        district: formData.district,
        market: formData.market,
        latitude,
        longitude,
        language: formData.language,
      });

      const normalized = normalizeAdvisory(response.data, formData);
      setAdvisory(normalized);

      await fetchPriceHistory();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch advisory.");
    } finally {
      setTimeout(() => setLoading(false), 1200);
    }
  };

  const handleAskAgain = () => {
    setAdvisory(null);
    setPriceHistory(null);
  };

  const handleNearbyMarkets = () => {
    const query = formData.market
      ? formData.market
      : formData.crop
        ? `mandi market near ${formData.crop}`
        : "mandi market near me";
    Linking.openURL(`https://www.google.com/maps/search/${encodeURIComponent(query)}`);
  };

  const handleHelpline = () => {
    Linking.openURL("tel:18001801551");
  };

  const isEmpty = !advisory;

  return (
    <View className="flex-1 bg-[#f7f9fc]">
      {loading && <LoadingScreen />}

      <Header
        language={formData.language}
        onLanguageChange={handleLanguageChange}
        t={t}
        onLogout={logout}
      />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <Hero
          t={t}
          aiReady={!loading}
          weatherSummary={advisory ? advisory.weather?.temperature : "Awaiting details"}
        />

        <StatsCards t={t} advisory={advisory} />

        <FarmerForm
          t={t}
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          loading={loading}
        />

        <View className="flex-row gap-4">
          <WeatherCard t={t} data={advisory?.weather} empty={isEmpty} />
          <MarketCard t={t} data={advisory?.market} empty={isEmpty} />
        </View>

        <MaxPriceTrendChart
          t={t}
          history={priceHistory || []}
          empty={isEmpty}
          location={formData.market ? `${formData.market}, ${formData.state}` : formData.state}
        />

        <CropCard t={t} data={advisory?.crop} empty={isEmpty} />

        <AdvisoryCard
          t={t}
          advisory={advisory}
          formData={formData}
          empty={isEmpty}
          onAskAgain={handleAskAgain}
        />

        <Footer t={t} />
      </ScrollView>

      <FloatingButtons
        t={t}
        onNearbyMarkets={handleNearbyMarkets}
        onHelpline={handleHelpline}
        onAskAgain={handleAskAgain}
      />
    </View>
  );
}

export default FarmerDashboardScreen;
