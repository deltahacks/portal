#!/bin/bash

# Script to import CSV data into local CockroachDB
# Assumes CSVs are in ./csvs/ directory, named as table.csv
# Run this after exporting CSVs from prod and placing them in ./csvs/

source .env

DB_URL="$DATABASE_URL"

# Ensure csvs directory exists
if [ ! -d "./csvs" ]; then
  echo "Error: ./csvs/ directory not found. Please create it and place the exported CSV files there."
  exit 1
fi

for csv in ./csvs/*.csv; do
  if [ -f "$csv" ]; then
    table=$(basename "$csv" .csv)
    echo "Importing data for table: $table"

    # Upload CSV to CockroachDB userfile
    cockroach userfile upload "$csv" "$table.csv"

    # Import into table (assumes table exists; truncates existing data)
    cockroach sql --url="$DB_URL" -e "TRUNCATE TABLE $table; IMPORT INTO $table CSV DATA ('userfile://$table.csv');"
  fi
done

echo "Data import completed."