import { Text, TouchableOpacity } from "react-native";
import { useTheme } from "zs-ui";

function HeaderRight() {
  const { palette: { toggleTheme, mode } } = useTheme();

  return (
    <TouchableOpacity
      onPressOut={() => {
        toggleTheme();
      }}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#00000010',
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: '500' }}>
        {mode === 'dark' ? '🌙' : '☀️'}
      </Text>
    </TouchableOpacity>
  );
}
export default HeaderRight;