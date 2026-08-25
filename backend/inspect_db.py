import sqlite3

conn = sqlite3.connect("railmadad.db")
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [t[0] for t in cursor.fetchall()]

print("=== RailMadad Database Overview ===")
print("Database File: backend/railmadad.db")
print(f"Total Tables ({len(tables)}): {', '.join(tables)}\n")

for table in tables:
    cursor.execute(f"SELECT COUNT(*) FROM {table}")
    count = cursor.fetchone()[0]
    print(f"Table '{table}': {count} record(s)")
