// 以 app/(tabs)/news.tsx 為例，其他檔案雷同
import { View, Text } from "react-native";
export default function NewsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0E14' }}>
      <Text style={{ color: 'white' }}>News Screen</Text>
    </View>
  );
}