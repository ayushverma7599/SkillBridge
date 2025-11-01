#!/bin/bash

echo "Ì∫Ä Setting up SmartHub Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "‚ùå Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "Ì≥± Installing Expo CLI..."
    npm install -g @expo/cli
fi

# Setup backend
echo "Ì¥ß Setting up backend..."
cd backend
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Ì≥ù Created backend/.env from template. Please update with your credentials."
fi
npm install
cd ..

# Setup frontend
echo "Ì≥± Setting up frontend..."
cd frontend
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Ì≥ù Created frontend/.env from template. Please update with your credentials."
fi
npm install
cd ..

echo "‚úÖ Setup complete! Next steps:"
echo "1. Update environment variables in backend/.env and frontend/.env"
echo "2. Set up your database (PostgreSQL or MongoDB)"
echo "3. Configure Firebase project"
echo "4. Run 'npm run dev' to start development servers"
EOF

