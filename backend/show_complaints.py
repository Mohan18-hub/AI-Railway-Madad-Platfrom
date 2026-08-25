import sqlite3

conn = sqlite3.connect("railmadad.db")
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute("SELECT * FROM complaints ORDER BY created_at DESC")
rows = cur.fetchall()

print("\n" + "=" * 72)
print(f"  RAILMADAD COMPLAINTS DB  |  Total Records: {len(rows)}")
print("=" * 72)

for i, r in enumerate(rows, 1):
    d = dict(r)
    print(f"\n  [{i}] Complaint No : {d.get('complaint_number', 'N/A')}")
    print(f"       ID           : {d.get('id', 'N/A')}")
    title = str(d.get('title', 'N/A'))[:60]
    print(f"       Title        : {title}")
    print(f"       Status       : {d.get('status', 'N/A')}")
    print(f"       Category     : {d.get('category_tag', 'N/A')}")
    print(f"       Special Cat  : {d.get('is_special_category', 'N/A')}")
    print(f"       PNR          : {d.get('pnr_number', 'N/A')}")
    print(f"       Email        : {d.get('passenger_email', 'N/A')}")
    print(f"       Created At   : {d.get('created_at', 'N/A')}")
    desc = str(d.get('description', ''))[:70]
    print(f"       Description  : {desc}")
    print("  " + "-" * 68)

print("\n--- complaint_status_history ---")
cur.execute("SELECT * FROM complaint_status_history ORDER BY changed_at DESC")
hist = cur.fetchall()
for h in hist:
    hd = dict(h)
    print(f"  complaint_id={hd.get('complaint_id','?')[:8]}...  status={hd.get('status','?')}  at={hd.get('changed_at','?')}")

conn.close()
