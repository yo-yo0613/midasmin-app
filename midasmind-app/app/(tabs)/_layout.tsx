import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen name="markets" options={{ title: "Analysis", tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.line.uptrend.xyaxis" color={color} /> }} />
      <Tabs.Screen name="trade" options={{ title: "Trade", tabBarIcon: ({ color }) => <IconSymbol size={32} name="plus.circle.fill" color="#4ADE80" /> }} />
      <Tabs.Screen name="news" options={{ title: "News", tabBarIcon: ({ color }) => <IconSymbol size={28} name="newspaper.fill" color={color} /> }} />
      {/* 新增/修改：帳號分頁 */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.crop.circle.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
