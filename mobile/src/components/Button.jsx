import { Pressable, Text } from "react-native";

function Button({ text, onClick, onPress, disabled, className = "" }) {
  return (
    <Pressable
      onPress={onPress || onClick}
      disabled={disabled}
      className={`bg-green-700 active:bg-green-800 px-6 py-3 rounded-lg ${
        disabled ? "opacity-60" : ""
      } ${className}`}
    >
      <Text className="text-white font-semibold text-center text-base">
        {text}
      </Text>
    </Pressable>
  );
}

export default Button;
