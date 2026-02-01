package com.midasmind.repository;

import com.midasmind.model.StockHolding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockRepository extends JpaRepository<StockHolding, Long> {
}