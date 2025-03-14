#!/bin/bash

# Exit on error
set -e

echo "Starting reset process..."

# Define the base directory as the current directory
BASE_DIR="$(pwd)"
echo "Base directory: $BASE_DIR"

# Step 1: Reset orra configuration
echo "Resetting orra configuration..."
orra config reset

# Step 2: Remove dbstore
echo "Removing dbstore..."
rm -rf "$HOME/.orra/dbstore"

# Step 3: Remove .orra-data directories from top-level subdirectories
echo "Removing .orra-data directories..."
for dir in "$BASE_DIR"/*; do
    if [ -d "$dir" ]; then
        ORRA_DATA_DIR="$dir/.orra-data"
        if [ -d "$ORRA_DATA_DIR" ]; then
            echo "Removing $ORRA_DATA_DIR"
            rm -rf "$ORRA_DATA_DIR"
        fi
    fi
done

# Step 4: Clear ORRA_API_KEY in .env files
echo "Clearing ORRA_API_KEY in .env files..."
for dir in "$BASE_DIR"/*; do
    if [ -d "$dir" ]; then
        ENV_FILE="$dir/.env"
        if [ -f "$ENV_FILE" ]; then
            echo "Updating $ENV_FILE"
            # Replace the ORRA_API_KEY line with an empty value
            sed -i '' 's/^ORRA_API_KEY=.*$/ORRA_API_KEY=/' "$ENV_FILE"
        fi
    fi
done

# Step 5: Remove data.json file if it exists
DATA_JSON="$BASE_DIR/data.json"
if [ -f "$DATA_JSON" ]; then
    echo "Removing $DATA_JSON"
    rm -f "$DATA_JSON"
fi

echo "Reset completed successfully!"
