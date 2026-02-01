// 增加了對StyleSheet, Text, View, ScrollView, TouchableOpacity和Dimensions的導入
import React from "react";
// 這些組件和API用於構建和樣式化React Native應用的用戶界面
// Dimensions 用於獲取設備的屏幕尺寸
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// 從'react-native-wagmi-charts'導入LineChart組件，用於在應用中顯示折線圖
// 從'lucide-react-native'導入Bell, Search和TrendingUp圖標組件，用於在應用中顯示圖標
// 從'react-native-safe-area-context'導入SafeAreaView組件，用於確保內容不會被設備的安全區域遮擋
import { SafeAreaView } from "react-native-safe-area-context";
//
import { Search, TrendingUp , Bell} from "lucide-react-native";
//
import { LineChart } from "react-native-wagmi-charts";

import { useEffect, useState } from 'react';
const { width } = Dimensions.get("window"); // 獲取設備屏幕的寬度

// 模擬股價數據
const mockData = [
  { timestamp: 1705400000, value: 150.1 },
  { timestamp: 1705403600, value: 155.5 },
  { timestamp: 1705407200, value: 152.2 },
  { timestamp: 1705410800, value: 160.4 },
  { timestamp: 1705414400, value: 158.1 },
  { timestamp: 1705418000, value: 170.1 },
];

// 主屏幕組件
interface Holding {
  id: string;
  symbol: string;
  name: string;
  price: string;
  change: string;
  color: string;
}

export default function HomeScreen() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

    const getHoldings = async () => {
      try {
        // ⚠ 注意：請將 192.168.1.10 替換成你實際的 IPv4 地址
        const response = await fetch('http://192.168.0.12:8080/api/portfolio/holdings');
        const data = await response.json();
        setHoldings(data); // 更新 State 後，畫面才會重新渲染
      } catch (error) {
        console.error("連線超時，請檢查 IP 是否正確:", error);
      } finally {
        setLoading(false);
      }
    };
    
    useEffect(() => {
      // 1. 組件掛載後先執行一次
      getHoldings();

      // 2. 設定定時器，每 10 秒 (10000 毫秒) 執行一次
      const interval = setInterval(() => {
        console.log('正在自動更新股價...');
        getHoldings();
      }, 10000);

      // 3. 當組件卸載時，清除定時器避免內存洩漏
      return () => clearInterval(interval);
    },[]);
  
  return (
    // 使用SafeAreaView確保內容在安全區域內顯示
    <SafeAreaView style={styles.container}>
      {/* 使用ScrollView使內容可滾動，並隱藏垂直滾動指示器 */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {/* Brand text */}
          <Text style={styles.brand}>MidasMind</Text>
          {/* View */}
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Search color="white" size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Bell color="white" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stock Detail Section */}
        <View style={styles.stockInfo}>
          <Text style={styles.symbol}>AAPL</Text>
          <Text style={styles.company}>Apple Inc.</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>$170.00</Text>
            <View style={styles.badge}>
              <TrendingUp color="#4ade80" size={14} />
              <Text style={styles.badgeText}>+2.45%</Text>
            </View>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartBox}>
          <LineChart.Provider data={mockData}>
            <LineChart width={width - 40} height={250}>
              <LineChart.Path color="#4ADE80" width={3}>
                <LineChart.Gradient color="#4ADE80" opacity={0.2} />
              </LineChart.Path>
              <LineChart.CursorCrosshair color="#4AED80">
                <LineChart.Tooltip />
              </LineChart.CursorCrosshair>
            </LineChart>
          </LineChart.Provider>
        </View>

        {/* Invest Button */}
        <TouchableOpacity style={styles.investBtn}>
          <Text style={styles.investBtnText}>Trade Now</Text>
        </TouchableOpacity>

        {/* -- Assets List Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Holdings</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.assetList}>
          {Array.isArray(holdings) && holdings.length > 0 ? (
            holdings.map((item) => (
              <TouchableOpacity key={item.id} style={styles.assetItem}>
                <View style={styles.assetLogo}><Text style={styles.logoText}>{item.symbol?.[0]}</Text></View>
                <View style={styles.assetInfo}>
                  <Text style={styles.assetSymText}>{item.symbol}</Text>
                  <Text style={styles.assetFullname}>{item.name}</Text>
                </View>
                <View style={styles.assetPriceInfo}>
                  <Text style={styles.assetPriceText}>{item.price}</Text>
                  <Text style={[styles.assetChangeText, { color: item.color }]}>{item.change}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: '#94A3B8' }}>正在連接 API (192.168.0.12)...</Text>
              <Text style={{ color: '#64748B', fontSize: 12, marginTop: 8 }}>若長時間未反應，請檢查防火牆</Text>
            </View>
          )}
        </View>

        {/* --- Optimized Asset Allocation --- */}
        <View style={styles.allocationContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Portfolio Mix</Text>
            <TrendingUp color="#4ADE80" size={18} />
          </View>

          <View style={styles.glassCard}>
            {/* 數據列 */}
            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statLabel}>Stocks</Text>
                <Text style={styles.statValue}>70.5%</Text>
              </View>
              <View style={styles.divider} />
              <View>
                <Text style={styles.statLabel}>Crypto</Text>
                <Text style={styles.statValue}>22.3%</Text>
              </View>
              <View style={styles.divider} />
              <View>
                <Text style={styles.statLabel}>Cash</Text>
                <Text style={styles.statValue}>7.2%</Text>
              </View>
            </View>

            {/* 混合比例條 - 一條線呈現所有比例 */}
            <View style={styles.multiProgressBar}>
              <View style={[styles.progressSegment, { width: '70.5%', backgroundColor: '#4ADE80', borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }]} />
              <View style={[styles.progressSegment, { width: '22.3%', backgroundColor: '#60A5FA' }]} />
              <View style={[styles.progressSegment, { width: '7.2%', backgroundColor: '#FACC15', borderTopRightRadius: 8, borderBottomRightRadius: 8 }]} />
            </View>
            
            <View style={styles.legendRow}>
              <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor: '#4ADE80'}]} /><Text style={styles.legendText}>Equity</Text></View>
              <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor: '#60A5FA'}]} /><Text style={styles.legendText}>Digital Assets</Text></View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 定義樣式
const styles = StyleSheet.create({
  // 主容器樣式，設置為彈性佈局並設置背景顏色
  container: { flex: 1, backgroundColor: "#0B0E14" },
  // header樣式，設置為行方向排列，兩端對齊，內邊距為20，並垂直居中
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  // brand樣式，設定為顏色為白色，文字大小為22，樣式為粗體
  brand: { color: "white", fontSize: 22, fontWeight: "bold" },
  // headerIcons樣式，設定為行方向排列，
  headerIcons: { flexDirection: "row", gap: 15 },
  iconBtn: { backgroundColor: "#1E222B", padding: 10, borderRadius: 12 },
  stockInfo: { paddingHorizontal: 20, marginTop: 10 },
  symbol: { color: "#94A2B8", fontSize: 16, fontWeight: "600" },
  company: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 5,
  },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  price: { color: "white", fontSize: 36, fontWeight: "700" },
  badge: {
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    padding: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeText: { color: "#4ADE80", fontWeight: "bold" },
  chartBox: { marginTop: 30, alignItems: "center" },
  investBtn: {
    backgroundColor: "#4ADE80",
    margin: 20,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  investBtnText: { color: "#000", fontSize: 18, fontWeight: "bold" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: { color: "white", fontSize: 18, fontWeight: "700" },
  seeAll: { color: "#4ADE80", fontSize: 14, fontWeight: "600" },
  allocationCard: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "#161B22",
    borderRadius: 20,
  },
  allocationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  assetName: { color: "#94A3B8", fontSize: 14 },
  assetValue: { color: "white", fontWeight: "bold" },
  progressBarBg: {
    height: 6,
    backgroundColor: "#30363D",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 3 },
  assetList: { paddingHorizontal: 20 },
  assetItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161B22",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  assetLogo: {
    width: 44,
    height: 44,
    backgroundColor: "#1E222B",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: { color: "white", fontWeight: "bold", fontSize: 18 },
  assetInfo: { flex: 1, marginLeft: 15 },
  assetSymText: { color: "white", fontSize: 16, fontWeight: "700" },
  assetFullname: { color: "#64748B", fontSize: 12 },
  assetPriceInfo: { alignItems: "flex-end" },
  assetPriceText: { color: "white", fontSize: 16, fontWeight: "700" },
  assetChangeText: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  allocationContainer: { marginTop: 10 },
  glassCard: {
    marginHorizontal: 20,
    padding: 24,
    backgroundColor: '#161B22',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 25, alignItems: 'center' },
  statLabel: { color: '#8B949E', fontSize: 12, marginBottom: 4, textAlign: 'center' },
  statValue: { color: 'white', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  divider: { width: 1, height: 20, backgroundColor: '#30363D' },
  multiProgressBar: {
    height: 12,
    flexDirection: 'row',
    backgroundColor: '#0D1117',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressSegment: { height: '100%' },
  legendRow: { flexDirection: 'row', gap: 15, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: {color: '#8B949E', fontSize: 12},
});
