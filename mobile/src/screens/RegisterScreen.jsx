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

const ROLES = ["Farmer", "Admin"];

function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Farmer",
  });
  const [submitting, setSubmitting] = useState(false);

  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) return;
    setSubmitting(true);
    try {
      const data = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );
      if (data.success) {
        Alert.alert("Success", data.message || "Registered successfully", [
          // Deviation from the original: instead of bouncing to a separate
          // Login screen, registration already returns a token, so we keep
          // the user signed in and let RootNavigator route them straight to
          // their dashboard once this alert is dismissed.
          { text: "Continue" },
        ]);
      } else {
        Alert.alert("Registration Failed", data.message || "Please try again.");
      }
    } catch (error) {
      Alert.alert(
        "Registration Failed",
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
            <Text className="text-gray-600 mt-2">Create Your Account</Text>
          </View>

          <View className="gap-5">
            <View>
              <Text className="mb-2 font-medium text-gray-700">Full Name</Text>
              <TextInput
                value={formData.name}
                onChangeText={(v) => setField("name", v)}
                placeholder="Enter your full name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </View>

            <View>
              <Text className="mb-2 font-medium text-gray-700">Email</Text>
              <TextInput
                value={formData.email}
                onChangeText={(v) => setField("email", v)}
                placeholder="Enter your email"
                autoCapitalize="none"
                keyboardType="email-address"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </View>

            <View>
              <Text className="mb-2 font-medium text-gray-700">Password</Text>
              <TextInput
                value={formData.password}
                onChangeText={(v) => setField("password", v)}
                placeholder="Create a password"
                secureTextEntry
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </View>

            <View>
              <Text className="mb-2 font-medium text-gray-700">Role</Text>
              <View className="flex-row gap-3">
                {ROLES.map((role) => (
                  <Pressable
                    key={role}
                    onPress={() => setField("role", role)}
                    className={`flex-1 border rounded-lg py-3 items-center ${
                      formData.role === role
                        ? "bg-green-700 border-green-700"
                        : "border-gray-300"
                    }`}
                  >
                    <Text
                      className={
                        formData.role === role
                          ? "text-white font-semibold"
                          : "text-gray-700"
                      }
                    >
                      {role}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={handleRegister}
              disabled={submitting}
              className={`w-full bg-green-700 active:bg-green-800 py-3 rounded-lg ${
                submitting ? "opacity-60" : ""
              }`}
            >
              <Text className="text-white font-semibold text-center text-base">
                {submitting ? "Creating account…" : "Register"}
              </Text>
            </Pressable>
          </View>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Already have an account? </Text>
            <Text
              className="text-green-700 font-semibold"
              onPress={() => navigation.navigate("Login")}
            >
              Login
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default RegisterScreen;
