#!/bin/bash
# jarvis-update.sh - Auto update script for Debian Server

# Configuration
APP_DIR="/var/www/jadwal_pendadaran"  # Sesuaikan dengan path server Anda
PM2_APP_NAME="jadwal-pendadaran-preview" # Sesuaikan jika ada nama app PM2

echo "🤖 Jarvis: Starting update process on $(hostname)..."
echo "📅 Date: $(date)"
echo "📂 Directory: $APP_DIR"
echo ""

# 1. Masuk ke direktori
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
else
    echo "❌ Error: Directory $APP_DIR not found!"
    exit 1
fi

# 2. Reset dan Pull dari main
echo "⬇️  Pulling latest code from GitHub..."
git fetch origin main
git reset --hard origin/main
git pull origin main

# 3. Install Dependencies & Build Frontend
echo "📦 Processing Frontend..."
if [ -d "frontend" ]; then
    cd frontend
    echo "   Running npm install (Frontend)..."
    npm install
    echo "   Building Frontend..."
    # Force URL production agar tidak fallback ke localhost
    VITE_API_URL="https://be-jpdd.daak.my.id/api" npm run build
    cd ..
else
    echo "❌ Error: Directory 'frontend' not found!"
fi

# 4. Install Dependencies Backend
echo "📦 Processing Backend..."
if [ -d "backend" ]; then
    cd backend
    echo "   Running npm install (Backend)..."
    npm install
    echo "   Initializing Database (Migrations)..."
    npm run init-db
    cd ..
else
    echo "❌ Error: Directory 'backend' not found!"
fi

# 5. Fix Permissions (Untuk folder dist di frontend)
echo "🔑 Fixing permissions..."
if [ -d "frontend/dist" ]; then
    # Jika Nginx serve dari frontend/dist, sesuaikan permission
    chown -R www-data:www-data frontend/dist
    chmod -R 755 frontend/dist
fi

# 6. Restart Services
echo "🔄 Restarting services..."

# Jika pakai PM2 untuk backend/preview
if pm2 list | grep -q "$PM2_APP_NAME"; then
    pm2 restart "$PM2_APP_NAME"
    echo "✅ PM2 restarted ($PM2_APP_NAME)."
else
    echo "⚠️  App '$PM2_APP_NAME' not found in PM2. Attempting to restart ALL processes..."
    pm2 restart all
    echo "✅ All PM2 processes restarted."
fi

# Jika pakai Nginx untuk static files
systemctl reload nginx
echo "✅ Nginx reloaded."

echo ""
echo "✨ Update completed successfully at $(date)!"
