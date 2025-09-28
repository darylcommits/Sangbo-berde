# How to Upload Files to GitHub

## Method 1: Using Git Commands (Recommended)

### For New Files:
```bash
# 1. Add files to staging
git add filename.js
git add .  # Add all files

# 2. Commit changes
git commit -m "Add new feature"

# 3. Push to GitHub
git push origin main
```

### For Modified Files:
```bash
# 1. Check status
git status

# 2. Add modified files
git add .

# 3. Commit changes
git commit -m "Update existing feature"

# 4. Push to GitHub
git push origin main
```

## Method 2: Using GitHub Web Interface

1. Go to your repository: https://github.com/darylcommits/Sangbo-berde
2. Click "Add file" → "Upload files"
3. Drag and drop files or click "choose your files"
4. Add commit message
5. Click "Commit changes"

## Method 3: Using GitHub Desktop

1. Download GitHub Desktop
2. Clone your repository
3. Make changes locally
4. Commit and push through the GUI

## Quick Commands Reference:

```bash
# Check status
git status

# Add all files
git add .

# Commit with message
git commit -m "Your message here"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# Clone repository
git clone https://github.com/darylcommits/Sangbo-berde.git
```
