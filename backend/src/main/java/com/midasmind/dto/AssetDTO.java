package com.midasmind.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AssetDTO {
   private String id;
   private String symbol;
   private String name;
   private String price;
   private String change;
   private String color;
}
