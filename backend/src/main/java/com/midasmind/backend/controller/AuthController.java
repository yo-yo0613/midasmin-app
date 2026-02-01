package com.midasmind.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        // 模擬簡單驗證邏輯
        if ("midas_user".equals(username) && "midas_password".equals(password)) {
            return Map.of(
                "status", "success",
                "token", "mock-jwt-token-2026",
                "user", Map.of(
                    "name", "Midas Student",
                    "email", "student@midasmind.com"
                )
            );
        } else {
            return Map.of("status", "error", "message", "帳號或密碼錯誤");
        }
    }
}