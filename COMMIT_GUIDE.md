# Commit Guide for 3D Shirt Configurator

This guide explains how to use the manual commit script to commit your changes with descriptive messages.

## Using the Manual Commit Script

The `manual-commit.sh` script allows you to commit all changes with a descriptive message. This makes it easier to track changes and revert to specific versions if needed.

### Basic Usage

To commit changes with a default timestamp message:

```bash
./manual-commit.sh
```

### Adding a Descriptive Message

To commit changes with a custom descriptive message (recommended):

```bash
./manual-commit.sh "Added direct manipulation feature"
```

The commit will include both your message and a timestamp, like:
`Added direct manipulation feature (Sat Apr 26 21:25:00 CEST 2025)`

## Example Commit Messages

Here are some examples of good commit messages:

- "Initial setup of 3D shirt configurator"
- "Added custom image upload functionality"
- "Implemented direct manipulation of images"
- "Fixed rotation bug in image manipulation"
- "Updated UI with better instructions"
- "Added new color options"

## Benefits of Descriptive Commit Messages

- Easier to identify specific versions
- Better project history tracking
- Makes it simpler to revert to specific points
- Helps collaborators understand your changes
