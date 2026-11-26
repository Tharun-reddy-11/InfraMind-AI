# Dataset inventory

This inventory is based on the files present in `Datasets/` at implementation time. The audit script is the source of truth for exact workbook measurements.

| Group | Files | Type / scale | Intended use | Readiness |
|---|---:|---|---|---|
| State bridge inventory exports | 53 (`*26.xlsx`) | Excel workbooks; schema varies by state/export | Bridge asset import, condition-feature exploration after column mapping | Available; no target label assumed |
| Bridge element condition | 2 (`2025IN_ElementData.xml`, `2025NY_ElementData.xml`) | XML element records | Element-level condition ingestion and historical inspection context | Available; parser/mapping required |
| Road Damage Detector | `RoadDamageDetector-master/` | Labels/source/tutorials; local image set and frozen detector are not present | RDD road-damage detector training/inference | Not ready; no model is claimed |
| SDNET2018 | `DATA_Maguire_20180517_ALL/SDNET2018.zip` | Archive described by its readme as 56,092 labeled 256×256 JPG subimages | Concrete crack classification | Archive available; extraction/training required |

## Reproducible audit

From the project root, install the ML service requirements and run:

```text
python ml-service/scripts/audit_datasets.py
```

The script prints one JSON object per workbook with sheet names, sampled row counts, columns, and missing-value counts, followed by the known archive/source entries. It does not alter the datasets.

## Model policy

The bridge model training script requires a reviewed CSV with explicit features and a reviewed `target_risk` label. It will not infer a safety label from an arbitrary workbook. Until the artifact is trained, `/predict/bridge-risk` returns `MODEL_NOT_READY`. Road and structural endpoints similarly return an honest readiness response until local detector/classifier artifacts exist.
