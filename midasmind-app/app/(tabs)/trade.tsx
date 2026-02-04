import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, auth } from '../../constants/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function TradeScreen() {
  const [symbol, setSymbol] = useState(''); // 股票代碼，如 AAPL, NVDA
  const [quantity, setQuantity] = useState(''); // 買入數量
  const [price, setPrice] = useState(''); // 買入單價

  const handleAddTrade = async () => {
    if (!auth.currentUser) return Alert.alert("錯誤", "請先登入");
    if (!symbol || !quantity || !price) return Alert.alert("提示", "請填寫完整交易資訊");

    try {
      // 1. 建立交易文件路徑：users/{uid}/transactions
      const tradesRef = collection(db, "users", auth.currentUser.uid, "transactions");

      // 2. 存入 Firestore
      await addDoc(tradesRef, {
        symbol: symbol.toUpperCase().trim(),
        quantity: parseFloat(quantity),
        buyPrice: parseFloat(price),
        type: 'BUY',
        timestamp: serverTimestamp() // 使用伺服器時間
      });

      // 3. 成功後清空輸入框
      setSymbol('');
      setQuantity('');
      setPrice('');
      Alert.alert("成功", `已記錄買入 ${symbol.toUpperCase()}`);

      // 這裡會觸發你的 Spring Boot 後端進行重算
    } catch (error) {
      console.error("儲存交易失敗:", error);
      Alert.alert("失敗", "無法儲存交易紀錄");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.formBox}>
          <Text style={styles.title}>新增交易</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>股票代碼 (Symbol)</Text>
            <TextInput 
              placeholder="例如: NVDA" 
              value={symbol} 
              onChangeText={setSymbol} 
              style={styles.input} 
              placeholderTextColor="#64748B"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>數量 (Quantity)</Text>
            <TextInput 
              placeholder="0.00" 
              value={quantity} 
              onChangeText={setQuantity} 
              style={styles.input} 
              placeholderTextColor="#64748B"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>買入價格 (Price USD)</Text>
            <TextInput 
              placeholder="0.00" 
              value={price} 
              onChangeText={setPrice} 
              style={styles.input} 
              placeholderTextColor="#64748B"
              keyboardType="decimal-pad"
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleAddTrade}>
            <Text style={styles.submitText}>確認新增</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E14' },
  formBox: { padding: 30, justifyContent: 'center', flex: 1 },
  title: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  inputGroup: { marginBottom: 20 },
  label: { color: '#94A3B8', marginBottom: 8, fontSize: 14 },
  input: { backgroundColor: '#161B22', color: 'white', padding: 15, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#30363D' },
  submitBtn: { backgroundColor: '#4ADE80', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  submitText: { color: '#000', fontWeight: 'bold', fontSize: 18 }
});