#!/bin/bash

# File watcher script to automatically commit changes
# This script watches for file changes and automatically commits them

echo "Starting file watcher for auto-commits..."
echo "Press Ctrl+C to stop"

while true; do
    # Run the auto-commit script
    ./auto-commit.sh
    
    # Wait for 30 seconds before checking again
    sleep 30
done
