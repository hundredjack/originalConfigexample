#!/bin/bash

# Auto-commit script
# This script automatically commits changes to the repository

# Check if there are any changes to commit
if git diff-index --quiet HEAD --; then
    echo "No changes to commit"
    exit 0
fi

# Add all changes
git add .

# Create a commit message with timestamp
COMMIT_MESSAGE="Auto-commit: $(date)"

# Commit the changes
git commit -m "$COMMIT_MESSAGE"

# Push the changes to the remote repository
git push origin main

echo "Changes committed successfully with message: $COMMIT_MESSAGE"
