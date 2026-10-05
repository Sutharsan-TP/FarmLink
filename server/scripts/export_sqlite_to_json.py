"""
One-off migration helper: reads the original project's SQLite database and
dumps the mandi_market_data table to a JSON array, so it can be bulk-loaded
into MongoDB by seedMongo.js without needing a native sqlite3 Node module.

Usage:
    python server/scripts/export_sqlite_to_json.py
"""

import json
import sqlite3
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parents[1]

DB_PATH = REPO_ROOT / "website" / "backend" / "app" / "database" / "mandi_prices.db"
OUTPUT_PATH = SCRIPT_DIR / "mandi_market_data.json"


def main():
    if not DB_PATH.exists():
        raise SystemExit(f"Could not find source database at {DB_PATH}")

    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            state, district, market, commodity_group, commodity,
            variety, grade, min_price, max_price, modal_price,
            price_unit, arrival_quantity, arrival_unit, arrival_date
        FROM mandi_market_data
    """)

    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)

    print(f"Exported {len(rows)} rows to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
