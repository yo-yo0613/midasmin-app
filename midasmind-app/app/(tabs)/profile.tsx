import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../constants/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile, // 新增：用於更新使用者個人資料
  User 
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);

  // 名稱編輯狀態
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const [assets, setAssets] = useState({
    totalBalance: 0,
    todayPnL: 0,
    totalReturn: 0
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setNewName(currentUser.displayName || ''); // 初始化編輯框內容
        
        const userDocRef = doc(db, "users", currentUser.uid);
        const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAssets({
              totalBalance: data.totalBalance || 0,
              todayPnL: data.todayPnL || 0,
              totalReturn: data.totalReturn || 0
            });
          }
        });
        return () => unsubscribeDoc();
      }
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // 實作更新名稱功能
  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    try {
      await updateProfile(auth.currentUser, {
        displayName: newName
      });
      setIsEditingName(false);
      Alert.alert("成功", "顯示名稱已更新");
    } catch (error: any) {
      Alert.alert("更新失敗", error.message);
    }
  };

  const handleAuth = async () => {
    const cleanEmail = email.trim(); 
    if (!cleanEmail || !password) return Alert.alert("提示", "請輸入完整資訊");
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } else {
        await createUserWithEmailAndPassword(auth, cleanEmail, password);
        Alert.alert("成功", "帳號已建立");
      }
    } catch (error: any) {
      Alert.alert("失敗", error.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4ADE80" />
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authBox}>
          <Text style={styles.title}>{isLoginMode ? 'MidasMind' : '建立帳號'}</Text>
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} placeholderTextColor="#64748B" autoCapitalize="none"/>
          <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} placeholderTextColor="#64748B" secureTextEntry/>
          <TouchableOpacity style={styles.btn} onPress={handleAuth}>
            <Text style={styles.btnText}>{isLoginMode ? '登入' : '註冊'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
            <Text style={styles.switch}>{isLoginMode ? '還沒有帳號？立即註冊' : '返回登入'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 使用者資訊區 - 優化版 */}
        <View style={styles.header}>
          <View style={styles.profileRow}>
            {/* 頭像圓圈 */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.nameContainer}>
              <Text style={styles.welcomeLabel}>歡迎回來,</Text>
              {isEditingName ? (
                <View style={styles.editInputRow}>
                  <TextInput 
                    value={newName} 
                    onChangeText={setNewName} 
                    style={styles.nameInput}
                    placeholder="輸入名稱..."
                    placeholderTextColor="#64748B"
                    autoFocus
                  />
                  <TouchableOpacity onPress={handleUpdateProfile}>
                    <Text style={styles.saveBtn}>儲存</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.nameDisplayRow}>
                  <Text style={styles.userName}>
                    {user.displayName || user.email?.split('@')[0]}
                  </Text>
                  <Text style={styles.editHint}> (編輯)</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <TouchableOpacity style={styles.logoutIcon} onPress={() => signOut(auth)}>
            <Text style={styles.logoutText}>登出</Text>
          </TouchableOpacity>
        </View>

        {/* 資產概覽卡片 */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>總資產估值 (USD)</Text>
          <Text style={styles.balanceValue}>${assets.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
          <View style={styles.divider} />
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statsLabel}>今日盈虧</Text>
              <Text style={[styles.statsValue, assets.todayPnL >= 0 ? styles.positive : styles.negative]}>
                {assets.todayPnL >= 0 ? '+' : ''}${assets.todayPnL.toFixed(2)}
              </Text>
            </View>
            <View>
              <Text style={styles.statsLabel}>總報酬率</Text>
              <Text style={[styles.statsValue, assets.totalReturn >= 0 ? styles.positive : styles.negative]}>
                {assets.totalReturn >= 0 ? '+' : ''}{assets.totalReturn.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>帳戶管理</Text>
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionItemText}>交易紀錄詳情</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionItemText}>安全設定</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E14' },
  scrollContent: { paddingBottom: 40 },
  authBox: { padding: 40, flex: 1, justifyContent: 'center' },
  title: { color: 'white', fontSize: 32, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
  input: { backgroundColor: '#161B22', color: 'white', padding: 18, borderRadius: 12, marginBottom: 15, fontSize: 16 },
  btn: { backgroundColor: '#4ADE80', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  switch: { color: '#94A3B8', textAlign: 'center', marginTop: 25 },
  
  // Header 樣式優化
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, marginTop: 10 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#4ADE80', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#000', fontSize: 22, fontWeight: 'bold' },
  nameContainer: { justifyContent: 'center' },
  welcomeLabel: { color: '#94A3B8', fontSize: 12 },
  userName: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  nameDisplayRow: { flexDirection: 'row', alignItems: 'baseline' },
  editHint: { color: '#4ADE80', fontSize: 12 },
  editInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  nameInput: { color: 'white', fontSize: 18, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#4ADE80', minWidth: 120, paddingVertical: 0 },
  saveBtn: { color: '#4ADE80', fontWeight: 'bold', marginLeft: 10 },
  
  logoutIcon: { backgroundColor: '#1E293B', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  logoutText: { color: '#F87171', fontWeight: '600' },
  balanceCard: { backgroundColor: '#161B22', margin: 20, padding: 25, borderRadius: 24, borderWidth: 1, borderColor: '#30363D' },
  balanceLabel: { color: '#94A3B8', fontSize: 14, marginBottom: 10 },
  balanceValue: { color: 'white', fontSize: 36, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#30363D', marginVertical: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statsLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 5 },
  statsValue: { fontSize: 18, fontWeight: 'bold' },
  positive: { color: '#4ADE80' },
  negative: { color: '#F87171' },
  actionSection: { paddingHorizontal: 25, marginTop: 10 },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  actionItem: { backgroundColor: '#161B22', padding: 20, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#30363D' },
  actionItemText: { color: '#E2E8F0', fontSize: 16 }
});