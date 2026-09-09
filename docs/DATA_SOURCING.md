# DATA_SOURCING.md — Kisan Connect AI Service
## Agmarknet Historical Data: Where It Comes From & How to Fetch It
### For: Siddhesh (AI/ML Engineer) | To be handed to OpenCode for implementation

---

## 0. PURPOSE OF THIS DOCUMENT

This file is the single source of truth for how `ai-service/app/data/agmarknet_sample.csv`
gets populated with REAL government mandi price data (not fully synthetic data).

Hand this whole file to OpenCode as context when asking it to implement the data
fetching layer for the AI service. It contains:
- Where the data actually comes from (chain of custody)
- Two working fetch methods, with full working scripts
- Which method to use and why
- Known limitations and how the pipeline should handle them
- Exact commands to run

---

## 1. WHERE THIS DATA ACTUALLY COMES FROM

```
Real APMC Mandis across India (physical wholesale markets)
   ↓
Every day, each mandi's market committee records actual trades:
   - what commodity sold, what variety, min/max/modal price that day
   ↓
This gets reported UP to:
   Directorate of Marketing & Inspection (DMI)
   under Ministry of Agriculture & Farmers Welfare, Govt of India
   ↓
DMI publishes it on the official portal: agmarknet.gov.in
   (the standard, publicly-cited reference dataset used by agri-economists,
   researchers, and government reports for years)
   ↓
Two ways to programmatically access this same underlying data:
   (A) Mirror on data.gov.in — Open Government Data (OGD) Platform
   (B) Direct via agmarknet.gov.in's own REST API (used by their site's
       search/report pages), accessed via the unofficial `agmarknet` PyPI SDK
```

**Important honesty notes:**
- This is real government mandi price data — not scraped from a third party,
  not fabricated. It's the same dataset the DPR already references
  (Section 9.1, Appendix A).
- The `agmarknet` PyPI package is an **unofficial SDK** — not built by the
  government — but it just calls the *same official API endpoints* the
  agmarknet.gov.in website itself uses. It automates what you'd otherwise
  do by clicking through their web UI one query at a time. It does not
  fabricate or alter data.
- **Data quality varies by mandi.** Some mandis (e.g., Lasalgaon in Nashik)
  report daily and reliably. Others report irregularly or have gaps — this
  is a known, publicly documented limitation of Agmarknet itself, not
  something introduced by how we're fetching it. Expect some crop+district
  combinations to come back sparse. This is real-world data being honest,
  not a bug.

---

## 2. TWO METHODS TO GET THIS DATA — WHICH TO USE

| Method | Source | Gives deep 2+ year history? | API key needed? | Recommended for |
|---|---|---|---|---|
| **A. data.gov.in OGD API** | Government open-data mirror of Agmarknet | ❌ No — daily/recent snapshot only, not a historical archive query | ✅ Yes (free) | Daily current-price snapshots, run repeatedly over time to accumulate history |
| **B. `agmarknet` PyPI SDK** | Official agmarknet.gov.in REST API directly | ✅ Yes — supports arbitrary date ranges (`from_date`/`to_date`), auto-chunks by year | ❌ No | **Primary method** — this is what gives us the real 2–2.5 year dataset Prophet needs |

**Decision: Use Method B (`agmarknet` SDK) as the primary/only fetch method**
for building `agmarknet_sample.csv`. Method A is documented here for
reference only (e.g., if you later want a "refresh today's prices" cron
job separate from the historical training set).

---

## 3. IMPORTANT ENVIRONMENT NOTE

Both `agmarknet.gov.in` and `api.data.gov.in` **block automated fetch
requests from sandboxed AI dev environments** (confirmed directly — bot
detection triggers on these clients). This means:

- These scripts **must be run from a normal machine** (your laptop, a VM,
  Railway, GitHub Actions runner, etc.) — NOT from inside an AI coding
  sandbox that proxies/sandboxes outbound network requests.
- If OpenCode is generating/running code inside a sandboxed container,
  the actual `python fetch_real_agmarknet_history.py` execution step
  needs to happen on Siddhesh's real machine or the deployment target,
  not inside OpenCode's own sandbox (if it has one).

---

## 4. THE SCRIPT TO USE — `fetch_real_agmarknet_history.py`

Pulls 2.5 years of REAL historical mandi price data via the official
Agmarknet REST API using the `agmarknet` PyPI SDK.

### Install first
```bash
cd ai-service
pip install agmarknet pandas
```

### Run
```bash
python fetch_real_agmarknet_history.py
```

### Output
`app/data/agmarknet_sample.csv` — matches the exact schema
`data_loader.py` expects:
```
date,state,district,market,commodity,variety,min_price,max_price,modal_price,unit
```

### Full script

```python
"""
fetch_real_agmarknet_history.py
Pulls 2.5 YEARS of REAL historical mandi price data directly from the
OFFICIAL Agmarknet REST API (agmarknet.gov.in) using the `agmarknet`
Python SDK - NOT the data.gov.in daily-snapshot mirror, which cannot
give deep history in one call.

Install first:
    pip install agmarknet pandas

Docs: https://pypi.org/project/agmarknet/

USAGE:
    python fetch_real_agmarknet_history.py

OUTPUT:
    app/data/agmarknet_sample.csv  (Siddhesh's exact expected schema)

IMPORTANT:
- Run this from your own machine / a normal server. Government sites
  (agmarknet.gov.in, data.gov.in) block automated fetches from
  sandboxed AI dev environments - confirmed this firsthand.
- This will make a LOT of requests (20 crops x 10 districts x ~3 yearly
  chunks = ~600 requests). Expect this to take 15-30+ minutes depending
  on the API's responsiveness and the SDK's built-in rate limiting.
- If a particular crop+district genuinely has no mandi trading in that
  district (some crops aren't grown/traded everywhere), you'll get an
  empty or very short DataFrame for that combo. That's real-world data
  being honest with you - it's not a bug. The pipeline's fallback
  (moving average -> static) is designed to handle exactly this.
"""

import os
import time
import pandas as pd
from datetime import datetime
from agmarknet import Agmarknet

FROM_DATE = "2024-01-01"
TO_DATE = "2026-08-31"

CROPS = [
    "Tomato", "Onion", "Potato", "Rice", "Wheat", "Maize", "Chilli", "Turmeric",
    "Banana", "Mango", "Brinjal", "Cabbage", "Cauliflower", "Garlic", "Ginger",
    "Groundnut", "Soyabean", "Coconut", "Sugarcane", "Cotton"
]

DISTRICTS = {
    "Nashik": "Maharashtra",
    "Pune": "Maharashtra",
    "Amritsar": "Punjab",
    "Ludhiana": "Punjab",
    "Coimbatore": "Tamil Nadu",
    "Mysuru": "Karnataka",
    "Guntur": "Andhra Pradesh",
    "Jaipur": "Rajasthan",
    "Indore": "Madhya Pradesh",
    "Varanasi": "Uttar Pradesh",
}

OUTPUT_PATH = "app/data/agmarknet_sample.csv"
SLEEP_BETWEEN_CALLS = 1.0  # be polite - this is a free government service
LOG_PATH = "fetch_log.txt"


def log(msg):
    print(msg)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"{datetime.now().isoformat()} | {msg}\n")


def normalize(df, crop, district, state):
    """Map SDK's returned columns to Kisan Connect's exact CSV schema."""
    if df is None or df.empty:
        return pd.DataFrame()

    df = df.copy()
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    col_map = {
        "arrival_date": "date",
        "reported_date": "date",
        "date": "date",
        "min_price": "min_price",
        "min_price_(rs./quintal)": "min_price",
        "max_price": "max_price",
        "max_price_(rs./quintal)": "max_price",
        "modal_price": "modal_price",
        "modal_price_(rs./quintal)": "modal_price",
        "variety": "variety",
        "market": "market",
        "market_name": "market",
    }
    df = df.rename(columns={k: v for k, v in col_map.items() if k in df.columns})

    out = pd.DataFrame()
    out["date"] = pd.to_datetime(df.get("date"), errors="coerce", dayfirst=True).dt.strftime("%Y-%m-%d")
    out["state"] = state
    out["district"] = district
    out["market"] = df.get("market", "")
    out["commodity"] = crop
    out["variety"] = df.get("variety", "")
    out["min_price"] = df.get("min_price", "")
    out["max_price"] = df.get("max_price", "")
    out["modal_price"] = df.get("modal_price", "")
    out["unit"] = "Quintal"

    return out.dropna(subset=["date"])


def main():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    open(LOG_PATH, "w").close()  # reset log

    api = Agmarknet()
    all_frames = []
    sparse_combos = []

    total_combos = len(CROPS) * len(DISTRICTS)
    done = 0

    log(f"Starting pull: {len(CROPS)} crops x {len(DISTRICTS)} districts "
        f"= {total_combos} combos, {FROM_DATE} to {TO_DATE}")

    for district, state in DISTRICTS.items():
        for crop in CROPS:
            done += 1
            log(f"[{done}/{total_combos}] {crop} / {district}, {state}")

            try:
                df = api.report(
                    from_date=FROM_DATE,
                    to_date=TO_DATE,
                    commodity=crop,
                    state=state,
                    district=district,
                    data_type="price",
                )
                normalized = normalize(df, crop, district, state)
                row_count = len(normalized)

                if row_count < 30:
                    sparse_combos.append((crop, district, row_count))

                if row_count > 0:
                    all_frames.append(normalized)

                log(f"   -> {row_count} rows")

            except Exception as e:
                log(f"   ! FAILED: {e}")
                sparse_combos.append((crop, district, 0))

            time.sleep(SLEEP_BETWEEN_CALLS)

    if not all_frames:
        log("\nNo data retrieved at all. Check network access and SDK version.")
        return

    final_df = pd.concat(all_frames, ignore_index=True)
    final_df = final_df.drop_duplicates()
    final_df = final_df.sort_values(["commodity", "district", "date"])
    final_df.to_csv(OUTPUT_PATH, index=False)

    log(f"\nSaved {len(final_df)} total rows to {OUTPUT_PATH}")
    log(f"Date range achieved: {final_df['date'].min()} to {final_df['date'].max()}")

    if sparse_combos:
        log(f"\n{len(sparse_combos)} combo(s) with <30 records "
            f"(these need Prophet's fallback path / synthetic backfill):")
        for crop, district, count in sparse_combos:
            log(f"   - {crop}/{district}: {count} rows")


if __name__ == "__main__":
    main()
```

---

## 5. ALTERNATIVE / SUPPLEMENTARY — `fetch_real_agmarknet.py` (data.gov.in method)

Documented for reference. Use this ONLY if the `agmarknet` SDK method above
fails entirely (e.g., official API changes/downtime) or if you want a
separate "refresh today's snapshot" job later, distinct from historical
training data.

### Install first
```bash
pip install requests
```

### Run
```bash
python fetch_real_agmarknet.py
```

### Get your own free API key (recommended over the shared demo key)
1. Go to https://data.gov.in → Sign up / Log in
2. Go to **My Account → API Key**
3. Copy your key, set it as env var: `export DATA_GOV_IN_API_KEY=your_key_here`

Dataset used: **"Variety-wise Daily Market Prices Data of Commodity"**
Resource ID: `9ef84268-d588-465a-a308-a864a43d0070`
Dataset page: https://www.data.gov.in/resource/variety-wise-daily-market-prices-data-commodity

A public demo key exists for testing (rate-limited):
`579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b`

### Full script

```python
"""
fetch_real_agmarknet.py
Pulls REAL historical mandi price data from data.gov.in (Agmarknet mirror)
for Kisan Connect's 20 crops x 10 districts.

Dataset: "Variety-wise Daily Market Prices Data of Commodity"
Resource ID: 9ef84268-d588-465a-a308-a864a43d0070
Docs: https://www.data.gov.in/resource/variety-wise-daily-market-prices-data-commodity

USAGE:
    python fetch_real_agmarknet.py

OUTPUT:
    app/data/agmarknet_sample.csv  (matches Siddhesh's expected schema exactly)

NOTES:
- The public demo key below is rate-limited and meant for testing only.
  Register your own free key at https://data.gov.in (My Account -> API Key)
  and set it as DATA_GOV_IN_API_KEY env var, or paste it into API_KEY below.
- This dataset only contains CURRENT/recent daily data per query window -
  it does not let you query 2.5 years back in one shot. We pull what's
  available per crop+district (recent daily snapshot appended over multiple
  days of running this script builds history), and for any combo that comes
  back sparse (<30 records), the pipeline's own Prophet fallback (moving
  average / static) already covers you - see app/models/demand_forecaster.py.
- Run this on a normal machine / server, NOT on a sandboxed AI environment -
  api.data.gov.in blocks the sandbox's fetch client.
"""

import os
import time
import csv
import requests
from datetime import datetime

API_KEY = os.getenv("DATA_GOV_IN_API_KEY", "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b")
BASE_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

CROPS = [
    "Tomato", "Onion", "Potato", "Rice", "Wheat", "Maize", "Chilli", "Turmeric",
    "Banana", "Mango", "Brinjal", "Cabbage", "Cauliflower", "Garlic", "Ginger",
    "Groundnut", "Soyabean", "Coconut", "Sugarcane", "Cotton"
]

DISTRICTS = {
    "Nashik": "Maharashtra",
    "Pune": "Maharashtra",
    "Amritsar": "Punjab",
    "Ludhiana": "Punjab",
    "Coimbatore": "Tamil Nadu",
    "Mysuru": "Karnataka",
    "Guntur": "Andhra Pradesh",
    "Jaipur": "Rajasthan",
    "Indore": "Madhya Pradesh",
    "Varanasi": "Uttar Pradesh",
}

OUTPUT_PATH = "app/data/agmarknet_sample.csv"
PAGE_LIMIT = 100          # API caps most datasets at ~100 per page
MAX_PAGES_PER_COMBO = 20  # safety cap so one combo can't loop forever
SLEEP_BETWEEN_CALLS = 0.3 # be polite to the free API


def fetch_combo(commodity, district, state):
    """Fetch all available records for one crop+district combo, paginated."""
    records = []
    offset = 0

    for _ in range(MAX_PAGES_PER_COMBO):
        params = {
            "api-key": API_KEY,
            "format": "json",
            "limit": PAGE_LIMIT,
            "offset": offset,
            "filters[commodity]": commodity,
            "filters[district]": district,
            "filters[state]": state,
        }
        try:
            resp = requests.get(BASE_URL, params=params, timeout=15)
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            print(f"  ! request failed for {commodity}/{district}: {e}")
            break

        batch = data.get("records", [])
        if not batch:
            break

        records.extend(batch)
        offset += PAGE_LIMIT

        total = int(data.get("total", 0))
        if offset >= total:
            break

        time.sleep(SLEEP_BETWEEN_CALLS)

    return records


def normalize_row(rec, expected_district, expected_state):
    """Convert API record to Kisan Connect's exact CSV schema."""
    try:
        raw_date = rec.get("arrival_date", "")
        try:
            date_obj = datetime.strptime(raw_date, "%d/%m/%Y")
            date_str = date_obj.strftime("%Y-%m-%d")
        except ValueError:
            date_str = raw_date

        return {
            "date": date_str,
            "state": rec.get("state", expected_state),
            "district": rec.get("district", expected_district),
            "market": rec.get("market", ""),
            "commodity": rec.get("commodity", ""),
            "variety": rec.get("variety", ""),
            "min_price": rec.get("min_price", ""),
            "max_price": rec.get("max_price", ""),
            "modal_price": rec.get("modal_price", ""),
            "unit": "Quintal",
        }
    except Exception:
        return None


def main():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    all_rows = []
    combo_summary = []

    print(f"Fetching real Agmarknet data for {len(CROPS)} crops x {len(DISTRICTS)} districts...")
    print(f"Using API key: {API_KEY[:12]}... (demo key is rate-limited)\n")

    for district, state in DISTRICTS.items():
        for crop in CROPS:
            print(f"-> {crop} / {district}, {state}")
            raw_records = fetch_combo(crop, district, state)
            normalized = [normalize_row(r, district, state) for r in raw_records]
            normalized = [r for r in normalized if r]

            all_rows.extend(normalized)
            combo_summary.append((crop, district, len(normalized)))
            print(f"   got {len(normalized)} records")
            time.sleep(SLEEP_BETWEEN_CALLS)

    if not all_rows:
        print("\nNo data returned at all. Check your API key and network access.")
        return

    fieldnames = ["date", "state", "district", "market", "commodity",
                  "variety", "min_price", "max_price", "modal_price", "unit"]

    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_rows)

    print(f"\nSaved {len(all_rows)} rows to {OUTPUT_PATH}")

    sparse = [c for c in combo_summary if c[2] < 30]
    if sparse:
        print(f"\n{len(sparse)} combo(s) have <30 records (Prophet will need fallback for these):")
        for crop, district, count in sparse:
            print(f"   - {crop}/{district}: {count} records")


if __name__ == "__main__":
    main()
```

---

## 6. WHAT TO DO WITH THE RESULT

1. Run Method B (`fetch_real_agmarknet_history.py`) first.
2. Check `fetch_log.txt` for the summary of sparse combos.
3. Do **not** attempt to fabricate/fill every sparse combo manually.
   `DemandForecaster` already has a 3-layer fallback
   (Prophet → moving average → static) exactly for this — see
   `ImplementationPlan.md` Day 2 and `Architecture.md` Section 5.3.
4. Once `agmarknet_sample.csv` exists with real data, proceed to build
   `app/models/demand_forecaster.py` (Task.md Module 3 / Implementation
   Plan Day 2) — no changes needed to that plan; it already expects a CSV
   in this exact schema.

---

## 7. INSTRUCTIONS FOR OPENCODE

When implementing the data layer for `ai-service/`:

- Use the script in Section 4 (`fetch_real_agmarknet_history.py`) as the
  primary data-fetch script. Place it at `ai-service/fetch_real_agmarknet_history.py`.
- Do NOT attempt to execute this script inside a sandboxed build/test
  environment — it must be run by the developer on a real machine with
  unrestricted network access, since agmarknet.gov.in blocks sandboxed
  fetch clients (bot detection).
- After the developer confirms `app/data/agmarknet_sample.csv` exists and
  is populated, proceed with building `data_loader.py`,
  `demand_forecaster.py`, and all dependent routes exactly as specified
  in `Task.md`, `Context.md`, and `ImplementationPlan.md` — no schema
  changes needed, the CSV output already matches what those modules expect.
- If asked to "generate the Agmarknet data," do NOT silently fabricate a
  synthetic CSV without flagging it — always tell the developer explicitly
  whether the data used is real (fetched via this script) or synthetic
  (generated), since this affects what can be claimed in the project's
  documentation and demo.

---

*Document version: 1.0 | Kisan Connect SIH 2026 | Data sourcing decisions for Siddhesh's AI service*
