import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAUppP2-8AMYOkQpVmdDwXNdQfbxw9QwDI",
  authDomain: "midasmin-app.firebaseapp.com",
  projectId: "midasmin-app",
  storageBucket: "midasmin-app.firebasestorage.app",
  messagingSenderId: "480792482229",
  appId: "1:480792482229:web:12df2338b8b5b1f4cb49fc"
};

// 確保 App 唯 初始化一次
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 使用動態 require 來繞過 Metro 的路徑解析錯誤
let auth: Auth;
try {
  auth = getAuth(app);
} catch (e) {
  // 核心：直接 require 核心 auth 模組，有些環境下 getReactNativePersistence 就在這裡面
  const authModule = require('firebase/auth');
  const getPersistence = authModule.getReactNativePersistence;
  
  auth = initializeAuth(app, {
    persistence: getPersistence(ReactNativeAsyncStorage)
  });
}

const db = getFirestore(app);

export { auth, db };