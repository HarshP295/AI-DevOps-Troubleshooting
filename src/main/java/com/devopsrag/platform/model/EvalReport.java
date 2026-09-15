package com.devopsrag.platform.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvalReport {
    private int totalQueries;
    private int passed;
    private double accuracy;
    private List<EvalDetail> details;
}
