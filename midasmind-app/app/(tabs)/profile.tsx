import  { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Wallet, LogOut, Mail, Lock, Github, Chrome } from 'lucide-react-native';
import { auth, db } from '../../constants/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const { width } = Dimensions.get('window');

// 定義資產狀態的介面，解決 TS 類型問題
interface AssetData {
  totalBalance: string;
  todayPnL: string;
  totalReturn: string;
}

export default function ProfileScreen() {
  // 這裡明確標註 User 類型，解決截圖中 Line 5 的 implicitly any 錯誤
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // 記帳 Modal 狀態
  const [modalVisible, setModalVisible] = useState(false);
  const [stockSymbol, setStockSymbol] = useState('');
  const [stockPrice, setStockPrice] = useState('');
  const [stockAmount, setStockAmount] = useState('');

  const [assets, setAssets] = useState<AssetData>({
    totalBalance: "$0.00",
    todayPnL: "+$0.00",
    totalReturn: "+0.0%"
  });

  useEffect(() => {
    // 解決截圖中 Line 37/47 的 auth 引用問題
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAssets({
              totalBalance: `$${data.totalBalance?.toLocaleString() || '0.00'}`,
              todayPnL: `${data.todayPnL >= 0 ? '+' : ''}$${data.todayPnL?.toLocaleString() || '0.00'}`,
              totalReturn: `${data.totalReturn >= 0 ? '+' : ''}${data.totalReturn || '0.0'}%`
            });
          }
        });
        return () => unsubscribeDoc();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleSocialLogin = async (platform: 'Google' | 'GitHub') => {
    const provider = platform === 'Google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    try {
      // 實質啟動 Firebase 驗證
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      Alert.alert("驗證失敗", "請檢查 GitHub Callback URL 是否已正確填入 Firebase。");
    }
  };

  const submitTransaction = async () => {
    if (!stockSymbol || !stockPrice || !stockAmount || !user) {
      Alert.alert("錯誤", "請填寫完整資訊並確保已登入");
      return;
    }

    try {
      // 將交易存入 Firestore
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        symbol: stockSymbol.toUpperCase(),
        price: parseFloat(stockPrice),
        amount: parseInt(stockAmount),
        type: "BUY",
        timestamp: serverTimestamp()
      });
      setModalVisible(false);
      setStockSymbol(''); setStockPrice(''); setStockAmount('');
      Alert.alert("成功", `已記錄買入 ${stockSymbol}`);
    } catch (e) {
      Alert.alert("錯誤", "無法寫入資料庫");
    }
  };

  const handleMenuPress = (item: string) => {
    if (item === '記帳本') {
      setModalVisible(true);
    } else {
      Alert.alert("提示", `${item} 功能開發中`);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authBox}>
            <Text style={styles.authTitle}>{isLoginMode ? '歡迎回來' : '建立帳號'}</Text>
            <View style={styles.inputContainer}>
              <Mail color="#94A3B8" size={20} />
              <TextInput placeholder="電子郵件" value={email} onChangeText={setEmail} style={styles.input} placeholderTextColor="#64748B" autoCapitalize="none"/>
            </View>
            <View style={styles.inputContainer}>
              <Lock color="#94A3B8" size={20} />
              <TextInput placeholder="密碼" value={password} onChangeText={setPassword} style={styles.input} placeholderTextColor="#64748B" secureTextEntry/>
            </View>
            <TouchableOpacity 
              style={styles.mainBtn} 
              onPress={isLoginMode ? () => signInWithEmailAndPassword(auth, email, password) : () => createUserWithEmailAndPassword(auth, email, password)}
            >
              <Text style={styles.mainBtnText}>{isLoginMode ? '立即開始' : '註冊帳號'}</Text>
            </TouchableOpacity>
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>快速登入</Text>
              <View style={styles.separatorLine} />
            </View>
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('Google')}><Chrome color="white" size={28} /></TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('GitHub')}><Github color="white" size={28} /></TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
              <Text style={styles.switchText}>{isLoginMode ? '還沒有帳號？立即註冊' : '已有帳號？返回登入'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Image source={{ uri: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}` }} style={styles.avatar} />
          <View style={styles.userInfo}><Text style={styles.userName}>{user.displayName || 'Midas 會員'}</Text><Text style={styles.userId}>{user.email}</Text></View>
          <TouchableOpacity onPress={() => signOut(auth)}><LogOut color="#F87171" size={24} /></TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>總資產估值 (USD)</Text>
          <Text style={styles.balanceValue}>{assets.totalBalance}</Text>
          <View style={styles.statsRow}>
            <View><Text style={styles.statLabel}>今日盈虧</Text><Text style={[styles.statValue, { color: assets.todayPnL.startsWith('+') ? '#4ADE80' : '#F87171' }]}>{assets.todayPnL}</Text></View>
            <View style={styles.divider} /><View><Text style={styles.statLabel}>累計回報</Text><Text style={[styles.statValue, { color: assets.totalReturn.startsWith('+') ? '#4ADE80' : '#F87171' }]}>{assets.totalReturn}</Text></View>
          </View>
        </View>

        <View style={styles.menuList}>
          {['交易紀錄', '籌碼分析設定', '記帳本', '安全設定'].map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={() => handleMenuPress(item)}>
              <View style={styles.menuLeft}><Wallet color="#94A3B8" size={20} /><Text style={styles.menuText}>{item}</Text></View>
              <ChevronRight color="#475569" size={20} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 記帳 Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>新增交易紀錄</Text>
            <TextInput placeholder="股票代碼 (如: NVDA)" value={stockSymbol} onChangeText={setStockSymbol} style={styles.modalInput} placeholderTextColor="#64748B" />
            <TextInput placeholder="買入價格" value={stockPrice} onChangeText={setStockPrice} keyboardType="numeric" style={styles.modalInput} placeholderTextColor="#64748B" />
            <TextInput placeholder="買入數量" value={stockAmount} onChangeText={setStockAmount} keyboardType="numeric" style={styles.modalInput} placeholderTextColor="#64748B" />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#1E293B'}]} onPress={() => setModalVisible(false)}><Text style={{color: 'white'}}>取消</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#4ADE80'}]} onPress={submitTransaction}><Text style={{color: '#000'}}>確認存入</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 40, marginBottom: 20 },
  socialBtn: { backgroundColor: '#1E293B', width: 65, height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  switchText: { color: '#94A3B8', textAlign: 'center', marginTop: 10 },
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
  menuText: { color: 'white', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#161B22', padding: 30, borderRadius: 25, borderWidth: 1, borderColor: '#30363D' },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalInput: { backgroundColor: '#0B0E14', color: 'white', padding: 15, borderRadius: 12, marginBottom: 15 },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalBtn: { flex: 0.45, padding: 15, borderRadius: 12, alignItems: 'center' }
});