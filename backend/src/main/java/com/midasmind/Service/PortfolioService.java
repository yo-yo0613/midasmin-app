package com.midasmind.Service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;
import yahoofinance.Stock;
import yahoofinance.YahooFinance;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PortfolioService {

    /**
     * 計算並更新用戶的總資產估值
     * @param userId Firebase 的 User UID
     */
    public void updateAndSaveUserBalance(String userId) {
        // 1. 加入空值檢查，消滅警告
        if (userId == null || userId.isEmpty()) {
            System.err.println("錯誤：userId 不能為空");
            return;
        }

        Firestore db = FirestoreClient.getFirestore();
        
        try {
            // 1. 從 Firestore 取得該用戶所有的交易紀錄
            // 路徑假設：users/{userId}/transactions
            CollectionReference transactionsRef = db.collection("users").document(userId).collection("transactions");
            ApiFuture<QuerySnapshot> query = transactionsRef.get();
            List<QueryDocumentSnapshot> documents = query.get().getDocuments();

            double totalBalance = 0.0;

            // 2. 遍歷每筆交易，計算現值
            for (QueryDocumentSnapshot document : documents) {
                String symbol = document.getString("symbol"); // 例如: AAPL
                Double quantity = document.getDouble("quantity");

                if (symbol != null && quantity != null) {
                    // 3. 呼叫 Yahoo Finance API 取得即時股價
                    Stock stock = YahooFinance.get(symbol);
                    if (stock != null) {
                        BigDecimal price = stock.getQuote().getPrice();
                        totalBalance += price.doubleValue() * quantity;
                    }
                }
            }

            // 4. 將計算結果回寫到用戶的主文件
            DocumentReference userRef = db.collection("users").document(userId);
            Map<String, Object> updateData = new HashMap<>();
            updateData.put("totalBalance", totalBalance);
            updateData.put("lastUpdated", FieldValue.serverTimestamp());

            // 使用 merge 確保不會覆蓋掉使用者的其他資料（如 displayName）
            userRef.set(updateData, SetOptions.merge());
            
            System.out.println("成功更新用戶 " + userId + " 的資產總額為: $" + totalBalance);

        } catch (Exception e) {
            System.err.println("更新資產失敗: " + e.getMessage());
        }
    }
}