import json

for mode, path in [("MOBILE", "baseline-mobile.json"), ("DESKTOP", "baseline-desktop.json")]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"=== BASELINE LIGHTHOUSE ({mode}) ===")
    for k, v in data.get("categories", {}).items():
        print(f"{v.get('title')}: {int(v.get('score', 0) * 100)}")

with open("baseline-mobile.json", "r", encoding="utf-8") as f:
    mob = json.load(f)
print("\n=== TOP FAILING MOBILE AUDITS ===")
for k, v in mob.get("audits", {}).items():
    s = v.get("score")
    if s is not None and s < 1 and v.get("scoreDisplayMode") not in ["notApplicable", "informative"]:
        print(f"- [{k}] {v.get('title')} (score: {s}) -> {v.get('displayValue', '')}")
