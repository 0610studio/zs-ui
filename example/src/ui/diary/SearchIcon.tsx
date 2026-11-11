import { Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';
import Svg, { Path } from 'react-native-svg';

const SEARCH_PATH =
  'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z';

export default function SearchIcon({ color }: { color: string }) {
  if (Platform.OS === 'android') {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path d={SEARCH_PATH} fill={color} />
      </Svg>
    );
  }
  return <SymbolView name="magnifyingglass" tintColor={color} size={20} />;
}
