import { ScrollView, Text, View } from "react-native";
import Button from "../components/Button";

function FeatureCard({ emoji, title, body }) {
  return (
    <View className="bg-white p-6 rounded-xl shadow w-full mb-4">
      <Text className="text-2xl font-bold mb-3">
        {emoji} {title}
      </Text>
      <Text className="text-gray-700">{body}</Text>
    </View>
  );
}

function HomeScreen({ navigation }) {
  return (
    <View className="flex-1 bg-[#f7f9fc]">
      {/* Simple top bar replacing the web Navbar */}
      <View className="flex-row justify-between items-center px-6 py-4 shadow bg-white">
        <Text className="text-xl font-bold text-green-700">🛡️ FarmSafe</Text>
        <View className="flex-row gap-5">
          <Text
            className="text-gray-700 font-medium mr-5"
            onPress={() => navigation.navigate("Login")}
          >
            Login
          </Text>
          <Text
            className="text-gray-700 font-medium"
            onPress={() => navigation.navigate("Register")}
          >
            Register
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ alignItems: "center", padding: 24, paddingTop: 48 }}>
        <Text className="text-4xl font-bold text-green-800 mb-6 text-center">
          🛡️ FarmSafe
        </Text>

        <Text className="text-lg text-gray-700 text-center mb-10 max-w-xl">
          Helping farmers make better crop selling decisions using weather
          forecasts, mandi prices, and crop knowledge.
        </Text>

        <Button text="Get Started" onPress={() => navigation.navigate("Login")} />

        <View className="w-full mt-16">
          <FeatureCard
            emoji="🌦"
            title="Weather"
            body="Live weather forecast to help plan harvesting."
          />
          <FeatureCard
            emoji="📈"
            title="Mandi Prices"
            body="Latest market prices from nearby mandis."
          />
          <FeatureCard
            emoji="🌱"
            title="Crop Knowledge"
            body="Important crop information for better decisions."
          />
        </View>
      </ScrollView>
    </View>
  );
}

export default HomeScreen;
