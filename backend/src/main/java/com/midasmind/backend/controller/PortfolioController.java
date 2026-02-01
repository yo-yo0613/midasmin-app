package com.midasmind.backend.controller;

import java.util.List;
//import java.util.stream.Collectors;

//import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.midasmind.dto.AssetDTO;
//import com.midasmind.repository.StockRepository;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "*")
public class PortfolioController {

    @GetMapping("/holdings")
    public List<AssetDTO> getHoldings() {
    // 假設你目前先用寫死數據測試，確保欄位名稱跟前端一致
        return List.of(
            new AssetDTO("1", "TSLA", "Tesla, Inc.", "$172.63", "-0.8%", "#F87171"),
            new AssetDTO("2", "NVDA", "NVIDIA Corp.", "$875.28", "+3.5%", "#4ADE80"),
            new AssetDTO("3", "AAPL", "Apple Inc.", "$190.10", "+2.4%", "#4ADE80")
        );
    }

}