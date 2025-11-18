import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

prod_url = os.getenv('PROD_DATABASE_URL')
local_url = os.getenv('DATABASE_URL')

if not prod_url or not local_url:
    print("Error: PROD_DATABASE_URL or DATABASE_URL not set in .env")
    exit(1)

# Connect to prod
prod_conn = psycopg2.connect(prod_url)
prod_cur = prod_conn.cursor()

# Connect to local
local_conn = psycopg2.connect(local_url)
local_cur = local_conn.cursor()

# Get tables from prod
prod_cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
tables = [row[0] for row in prod_cur.fetchall()]
# Reorder to put User first, as it's referenced
if 'User' in tables:
    tables = ['User'] + [t for t in tables if t != 'User']

# Get FK constraints from prod
prod_cur.execute("""
SELECT tc.constraint_name, tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
""")
fks = prod_cur.fetchall()

# Drop FKs on local
for fk in fks:
    constraint_name, table_name, column_name, foreign_table, foreign_column = fk
    local_cur.execute(f'ALTER TABLE "{table_name}" DROP CONSTRAINT IF EXISTS "{constraint_name}"')
    local_conn.commit()

for table in tables:
    print(f"Processing table: {table}")

    # Get column info
    prod_cur.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}' ORDER BY ordinal_position")
    columns = [row[0] for row in prod_cur.fetchall()]

    # Check if table exists on local
    local_cur.execute("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = %s AND table_schema = 'public')", (table,))
    exists = local_cur.fetchone()[0]
    if not exists:
        print(f"Skipping table {table} as it doesn't exist on local")
        continue

    # Truncate existing data
    local_cur.execute(f'TRUNCATE TABLE "{table}"')
    local_conn.commit()

    # Fetch and insert data in batches
    prod_cur.execute(f'SELECT * FROM "{table}"')
    batch_size = 1000
    while True:
        rows = prod_cur.fetchmany(batch_size)
        if not rows:
            break
        placeholders = ', '.join(['%s'] * len(columns))
        quoted_columns = [f'"{c}"' for c in columns]
        insert_stmt = f'INSERT INTO "{table}" ({", ".join(quoted_columns)}) VALUES ({placeholders})'
        local_cur.executemany(insert_stmt, rows)
        local_conn.commit()

# Add back FKs
for fk in fks:
    constraint_name, table_name, column_name, foreign_table, foreign_column = fk
    local_cur.execute(f'ALTER TABLE "{table_name}" ADD CONSTRAINT "{constraint_name}" FOREIGN KEY ("{column_name}") REFERENCES "{foreign_table}" ("{foreign_column}")')
    local_conn.commit()

print("Data cloning completed.")

prod_conn.close()
local_conn.close()