# GovBuild360 — Dependency Engine & Failure Impact Analysis

## 1. Dependency Graph Concept

Physical infrastructure in government buildings operates as an interconnected network of dependent systems:

```
[ Primary Step-Down Transformer ]
               │
               ▼
[ Main Electrical Panel (PNL-01) ]
               │
               ├──► [ Central HVAC Chiller ] ──► [ Air Circulation Fans ]
               │
               └──► [ Standby Generator (GEN-01) ]
                           │
                           ▼
                    [ ATS Switch ]
                           │
                           ▼
                    [ Emergency Lighting Bus ]
```

---

## 2. Graph Traversal Algorithm (BFS)

When an asset fails or is selected for impact inspection, the engine executes Breadth-First Search (BFS):

1. Initialize queue with Target Asset ID.
2. Mark Target Asset as visited.
3. Fetch all downstream dependent links (`sourceAssetId == currentAssetId`).
4. Traversal depth tracks direct vs indirect dependencies.
5. Counts total affected assets, affected building systems, and critical dependency links.
6. Returns `ImpactAnalysisResult` and triggers `CRITICAL INFRASTRUCTURE CASCADE IMPACT ALERT` if critical dependencies are affected.
