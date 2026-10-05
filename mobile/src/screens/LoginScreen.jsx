import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setSubmitting(true);
    try {
      const data = await login(email, password);
      if (data.success) {
        Alert.alert("Success", data.message || "Logged in");
        // Navigation itself is handled by RootNavigator switching stacks
        // once `user`/`token` are set — no explicit navigate() needed here.
      } else {
        Alert.alert("Login Failed", data.message || "Please try again.");
      }
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error?.response?.data?.message || "Could not reach the server."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#f7f9fc]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
        <View className="bg-white shadow-xl rounded-2xl w-full p-8">
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-green-700">🛡️ FarmSafe</Text>
            <Text className="text-gray-600 mt-2">Welcome Back!</Text>
          </View>

          <View className="gap-5">
            <View>
              <Text className="mb-2 font-medium text-gray-700">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                autoCapitalize="none"
                keyboardType="email-address"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </View>

            <View>
              <Text className="mb-2 font-medium text-gray-700">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </View>

            <Pressable
              onPress={handleLogin}
              disabled={submitting}
              className={`w-full bg-green-700 active:bg-green-800 py-3 rounded-lg ${
                submitting ? "opacity-60" : ""
              }`}
            >
              <Text className="text-white font-semibold text-center text-base">
                {submitting ? "Logging in…" : "Login"}
              </Text>
            </Pressable>
          </View>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Don't have an account? </Text>
            <Text
              className="text-green-700 font-semibold"
              onPress={() => navigation.navigate("Register")}
            >
              Register
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;
