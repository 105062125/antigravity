// Firebase 配置文件
const firebaseConfig = {
    apiKey: "AIzaSyBmcRb1IhGtiJl3W1MgKWwvdnuQc2dm-L4",
    authDomain: "analysisepic.firebaseapp.com",
    projectId: "analysisepic",
    storageBucket: "analysisepic.firebasestorage.app",
    messagingSenderId: "26652198970",
    appId: "1:26652198970:web:90ebd85006525bea28cd03"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 初始化服務
const auth = firebase.auth();
const db = firebase.firestore();

// 配置 Firestore 設定
db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

// 啟用離線持久化
// 離線持久化已禁用以避免多標籤頁衝突
// db.enablePersistence()...

console.log('Firebase 已初始化');
