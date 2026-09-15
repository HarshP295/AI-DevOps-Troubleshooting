package com.devopsrag.platform.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvalDetail {
    private String query;
    private String expectedSource;
    private boolean passed;
    private List<String> actualTopSources;
}
