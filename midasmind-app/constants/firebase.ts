import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  Auth, 
  browserLocalPersistence // 使用通用的 Web 持久化，Expo 相容性較高
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAUppP2-8AMYOkQpVmdDwXNdQfbxw9QwDI",
  authDomain: "midasmin-app.firebaseapp.com",
  projectId: "midasmin-app",
  storageBucket: "midasmin-app.firebasestorage.app",
  messagingSenderId: "480792482229",
  appId: "1:480792482229:web:12df2338b8b5b1f4cb49fc"
};

const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;
try {
  auth = getAuth(app);
} catch (e) {
  // 修正：使用 browserLocalPersistence 避開 indexedDB 錯誤
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence
  });
}

const db: Firestore = getFirestore(app);
export { auth, db };