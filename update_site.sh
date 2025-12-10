#!/bin/bash
set -e

echo "Starting site update..."

# 1. Pull latest changes to avoid conflicts
echo "Pulling latest changes..."
git pull

# 2. Build the blog
echo "Building the blog..."
cd blog
npm run build
cd ..

# 3. Add changes
echo "Staging changes..."
git add .

# 4. Commit
echo "Committing changes..."
# Check if there are changes to commit
if git diff --staged --quiet; then
  echo "No changes to commit."
else
  git commit -m "Update site content via script"

  # 5. Push
  echo "Pushing to GitHub..."
  git push
  echo "Done! Site updated."
fi
