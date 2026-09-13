#!/bin/bash
# Run this from inside scripts/:  cd scripts && ./dev-setup.sh
# (or `npm run setup` from inside scripts/, once you've run `npm install` there)

echo "🚀 Setting up SkillBridge Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI..."
    npm install -g @expo/cli
fi

# Setup backend
echo "📦 Setting up backend..."
cd ../backend
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "📝 Created backend/.env from template. Please update with your credentials."
fi
npm install
cd ../scripts

# Setup frontend (Expo app lives in smarthub-fresh/)
echo "📦 Setting up frontend..."
cd ../smarthub-fresh
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "📝 Created smarthub-fresh/.env from template. Please update with your credentials."
fi
npm install
cd ../scripts

echo "✅ Setup complete! Next steps:"
echo "1. Update environment variables in backend/.env and smarthub-fresh/.env"
echo "2. Make sure PostgreSQL is running and create the database (see backend/README or COMMANDS.md)"
echo "3. (Optional) Configure Firebase in smarthub-fresh/config/firebase.js"
echo "4. Run the backend and frontend dev servers — see COMMANDS.md for the exact commands"
