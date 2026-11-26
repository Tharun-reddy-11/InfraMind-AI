"""Print reproducible inventory measurements without modifying Datasets."""
from pathlib import Path
import json, os
import pandas as pd
DATASETS = Path(os.getenv("DATASETS_DIR", Path(__file__).resolve().parents[2] / "Datasets"))
for file in sorted(DATASETS.glob("*.xlsx")):
    book = pd.ExcelFile(file)
    sheets = []
    for name in book.sheet_names:
        df = pd.read_excel(file, sheet_name=name, nrows=2000)
        sheets.append({"sheet":name,"sampleRows":len(df),"columns":df.columns.astype(str).tolist(),"sampleMissing":df.isna().sum().to_dict()})
    print(json.dumps({"file":file.name,"type":"xlsx","sheets":sheets}, default=str))
print(json.dumps({"file":"SDNET2018.zip","type":"zip","use":"concrete crack classification; extract before training"}))
print(json.dumps({"file":"RoadDamageDetector-master","type":"source/labels","use":"road damage detector training; local model absent"}))
