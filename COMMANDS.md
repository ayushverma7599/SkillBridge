# Commands

Every shell command you need to set up, run, and maintain this project, grouped by task. All paths are relative to the repo root unless a `cd` is shown.

For what these commands actually run (features, screens, API routes), see **[README.md](README.md)**.

---

## First-time setup

```bash
# Clone
git clone https://github.com/ayushverma7599/smarthub-campus-freelancing.git
cd smarthub-campus-freelancing

# Backend: install deps + create your .env
cd backend
cp .env.example .env        # then edit .env — at minimum set DB_PASSWORD and JWT_SECRET
npm install
cd ..

# Frontend: install deps + create your .env
cd smarthub-fresh
cp .env.example .env        # default already points at http://localhost:5000/api/v1
npm install
cd ..
```

Or, equivalently, run the setup script (installs both + copies both `.env` files in one go):

```bash
cd scripts
npm install
npm run setup
```

---

## Database (PostgreSQL)

```bash
# Create the database (uses the default name from backend/.env.example)
psql -U postgres -c 'CREATE DATABASE skillbridge_db;'

# Create the app's DB role (if it doesn't already exist) — match this to
# whatever you put in backend/.env's DB_USER / DB_PASSWORD
psql -U postgres -c "CREATE USER skillbridge_admin WITH PASSWORD 'yourpassword';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE skillbridge_db TO skillbridge_admin;"

# Or, once backend/.env is filled in, the npm shortcuts do the same:
cd backend
npm run db:create     # CREATE DATABASE skillbridge_db
npm run db:migrate     # applies config/database.sql
cd ..
```

You generally **don't need to run migrations by hand** — `npm run dev` (below) auto-syncs the schema on every boot (`sequelize.sync({ alter: true })` in development) and seeds colleges, the Learning Gap Detector question bank, and demo projects if those tables are empty.

```bash
# Open a psql shell against the app database
PGPASSWORD=yourpassword psql -U skillbridge_admin -h localhost -d skillbridge_db

# Quick sanity checks once inside psql
\dt                                  -- list tables
SELECT count(*) FROM "Users";
SELECT count(*) FROM "Projects";

# Wipe and re-seed everything (drops all tables — the backend recreates them
# and reseeds colleges/learning content/demo projects on next boot)
PGPASSWORD=yourpassword psql -U skillbridge_admin -h localhost -d skillbridge_db -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
```

---

## Running the backend

```bash
cd backend
npm run dev       # nodemon — auto-restarts on file changes (recommended for local dev)
npm start         # plain `node server.js`, no auto-restart
```

Default URL: `http://localhost:5000`. Health check: `curl http://localhost:5000/health`. Full route index: `curl http://localhost:5000/api`.

```bash
npm test           # jest --watchAll
npm run lint        # eslint .
```

---

## Running the frontend (Expo / smarthub-fresh)

```bash
cd smarthub-fresh
npm start           # Expo dev server — press w (web), a (Android), i (iOS) from the prompt
npm run web          # same as above, jumps straight to a browser
npm run android       # opens an Android emulator/device directly
npm run ios            # opens an iOS simulator directly (macOS only)
npm run lint            # expo lint
```

Expo's dev server defaults to port `8081`. If that's taken, it'll ask to use another port — say yes, or free the port first (see below).

**Testing on a physical phone (Expo Go):** your phone and computer must be on the same network, and `smarthub-fresh/.env`'s `EXPO_PUBLIC_API_BASE_URL` must use your computer's LAN IP instead of `localhost` (a phone can't resolve `localhost` to your PC). Find your LAN IP with `hostname -I` (Linux) or `ipconfig getifaddr en0` (macOS), then e.g. `EXPO_PUBLIC_API_BASE_URL=http://192.168.1.42:5000/api/v1`.

---

## Running both at once

There's no single root-level command (the repo has no root `package.json`), but you can either use two terminals (simplest — the backend's `nodemon` and Expo's dev server both auto-reload independently) or the `scripts/` orchestrator:

```bash
cd scripts
npm install          # only needed once, installs `concurrently`
npm run dev            # runs backend (nodemon) + frontend (expo start) together
```

---

## Diagnostics

```bash
# What's listening on the backend / frontend ports?
lsof -i :5000
lsof -i :8081

# Kill whatever's on a port (careful — confirm it's actually your own stray process first)
kill $(lsof -t -i :5000)

# Is Postgres up?
pg_isready

# Tail backend logs if you started it detached
# (not needed with `npm run dev` in a foreground terminal — nodemon prints directly)
```

---

## Git workflow

This repo's default/integration branch is `develop`; `main` is the protected/production branch (see [REPOSITORY_CONFIG.md](REPOSITORY_CONFIG.md)).

```bash
# Status / history
git status
git log --oneline -10
git diff                       # unstaged changes
git diff --staged               # staged changes

# Everyday flow
git checkout develop
git pull
git checkout -b feature/my-change
# ...edit...
git add <files>                  # prefer specific files over `git add -A`
git commit -m "Short, present-tense summary of what changed and why"
git push -u origin feature/my-change
# then open a PR into develop on GitHub

# Sync your branch with the latest develop
git fetch origin
git merge origin/develop          # or: git rebase origin/develop

# Push the current branch to GitHub (after it already has an upstream)
git push
```

---

## Environment file reference

```bash
# Backend — copy and fill in
cp backend/.env.example backend/.env

# Frontend — copy (default value usually works as-is for local dev)
cp smarthub-fresh/.env.example smarthub-fresh/.env
```

See the [Environment variables](README.md#environment-variables) section of the README for what each variable does and which ones are actually required to run the app locally.
