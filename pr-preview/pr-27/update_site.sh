#!/bin/bash
set -e

echo "Starting site update..."

# 0. Check Git Identity
if [ -z "$(git config user.email)" ] || [ -z "$(git config user.name)" ]; then
    echo "Git identity is not set. Please enter your details."
    echo "This is required only once."

    read -p "Enter your Email: " user_email
    read -p "Enter your Name: " user_name

    if [ -n "$user_email" ] && [ -n "$user_name" ]; then
        git config --global user.email "$user_email"
        git config --global user.name "$user_name"
        echo "Identity set successfully!"
    else
        echo "Error: Email and Name cannot be empty."
        exit 1
    fi
fi

# 1. Pull latest changes to avoid conflicts
echo "Pulling latest changes..."
git pull

# 2. Build the blog
echo "Building the blog..."
cd blog
npm run build
# Generate static gallery for Sketches
echo "Generating static gallery..."
node scripts/generate-gallery.cjs
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
