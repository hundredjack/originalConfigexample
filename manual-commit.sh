#!/bin/bash

# Manual-commit script
# This script commits all changes to the repository
# Usage: ./manual-commit.sh "Your commit message here"

# Check if there are any changes to commit
if git diff-index --quiet HEAD --; then
    echo "No changes to commit"
    exit 0
fi

# Add all changes
git add .

# Create a commit message
if [ -z "$1" ]; then
    # If no commit message is provided, use a default message with timestamp
    COMMIT_MESSAGE="Manual commit: $(date)"
    echo "No commit message provided. Using default message."
else
    # Use the provided commit message
    COMMIT_MESSAGE="$1 ($(date))"
fi

# Commit the changes
git commit -m "$COMMIT_MESSAGE"

# Push the changes to the remote repository
git push origin main

echo "Changes committed successfully with message: $COMMIT_MESSAGE"
