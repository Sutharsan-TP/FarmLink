import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import FarmerDashboardScreen from "../screens/FarmerDashboardScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";

const Stack = createNativeStackNavigator();

// Route guarding: unauthenticated users only ever see Home/Login/Register.
// Once a token exists, they're routed straight to the role-appropriate
// dashboard. This is a deliberate improvement over the original web app,
// which had no real auth gating at all.
export default function RootNavigator() {
  const { user, token, initializing } = useAuth();

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f7f9fc]">
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  const isAuthed = Boolean(token && user);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthed ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : user.role === "Admin" ? (
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      ) : (
        <Stack.Screen name="FarmerDashboard" component={FarmerDashboardScreen} />
      )}
    </Stack.Navigator>
  );
}
