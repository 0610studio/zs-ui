import { Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@0610studio/zs-ui';

function HeaderRight() {
  const { palette: { toggleTheme, mode } } = useTheme();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={mode === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
      testID="theme-toggle"
      onPress={() => {
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
