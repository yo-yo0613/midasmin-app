import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, ChevronRight, Wallet, LogOut, Mail, Lock, Github, Twitter, Chrome, Facebook } from 'lucide-react-native';
import { auth } from '../../constants/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User 
} from 'firebase/auth';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);

  // 真實資產 State (目前先放預設值，下一步將從 Firestore 抓取)
  const [totalBalance, setTotalBalance] = useState("$12,450.80");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert("登入失敗", error.message);
    }
  };

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert("註冊失敗", error.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  // 第三方登入模擬（待各平台 Key 申請完成後實作）
  const handleSocialLogin = (platform: string) => {
    Alert.alert("社群登入", `正在啟動 ${platform} 驗證程序...`);
  };

  // --- 登入前的畫面 (包含社群登入) ---
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authBox}>
            <Text style={styles.authTitle}>{isLoginMode ? '歡迎回來' : '建立帳號'}</Text>
            
            <View style={styles.inputContainer}>
              <Mail color="#94A3B8" size={20} />
              <TextInput 
                placeholder="電子郵件" 
                value={email} 
                onChangeText={setEmail} 
                style={styles.input} 
                placeholderTextColor="#64748B"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock color="#94A3B8" size={20} />
              <TextInput 
                placeholder="密碼" 
                value={password} 
                onChangeText={setPassword} 
                style={styles.input} 
                placeholderTextColor="#64748B"
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.mainBtn} onPress={isLoginMode ? handleLogin : handleRegister}>
              <Text style={styles.mainBtnText}>{isLoginMode ? '立即開始' : '註冊帳號'}</Text>
            </TouchableOpacity>

            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>或其他方式登入</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* 社群登入按鈕列 */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('Google')}>
                <Chrome color="white" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('Facebook')}>
                <Facebook color="white" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('GitHub')}>
                <Github color="white" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('Twitter')}>
                <Twitter color="white" size={24} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
              <Text style={styles.switchText}>
                {isLoginMode ? '還沒有帳號？立即註冊' : '已有帳號？返回登入'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- 登入後的畫面 ---
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Image source={{ uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}` }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Midas 會員</Text>
            <Text style={styles.userId}>{user.email}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <LogOut color="#F87171" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>總資產估值 (USD)</Text>
          <Text style={styles.balanceValue}>{totalBalance}</Text>
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>今日盈虧</Text>
              <Text style={[styles.statValue, { color: '#4ADE80' }]}>+$245.10</Text>
            </View>
            <View style={styles.divider} />
            <View>
              <Text style={styles.statLabel}>累計回報</Text>
              <Text style={[styles.statValue, { color: '#4ADE80' }]}>+12.5%</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuList}>
          {['交易紀錄', '籌碼分析設定', '記帳本', '安全設定'].map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <Wallet color="#94A3B8" size={20} />
                <Text style={styles.menuText}>{item}</Text>
              </View>
              <ChevronRight color="#475569" size={20} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E14' },
  authScroll: { flexGrow: 1, justifyContent: 'center' },
  authBox: { padding: 30 },
  authTitle: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161B22', borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, height: 55 },
  input: { flex: 1, color: 'white', marginLeft: 10 },
  mainBtn: { backgroundColor: '#4ADE80', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  mainBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  separatorContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  separatorLine: { flex: 1, height: 1, backgroundColor: '#1E293B' },
  separatorText: { color: '#64748B', marginHorizontal: 10, fontSize: 12 },
  socialRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  socialBtn: { backgroundColor: '#1E293B', width: 55, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  switchText: { color: '#94A3B8', textAlign: 'center', marginTop: 10 },
  // 原有樣式
  header: { flexDirection: 'row', padding: 25, alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1E293B' },
  userInfo: { flex: 1, marginLeft: 15 },
  userName: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  userId: { color: '#64748B', fontSize: 12, marginTop: 4 },
  balanceCard: { margin: 20, padding: 25, backgroundColor: '#161B22', borderRadius: 24, borderWidth: 1, borderColor: '#30363D' },
  balanceLabel: { color: '#94A3B8', fontSize: 14 },
  balanceValue: { color: 'white', fontSize: 32, fontWeight: 'bold', marginVertical: 10 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#30363D' },
  statLabel: { color: '#64748B', fontSize: 12 },
  statValue: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  divider: { width: 1, backgroundColor: '#30363D' },
  menuList: { paddingHorizontal: 20 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#1E222B' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  menuText: { color: 'white', fontSize: 16 }
});