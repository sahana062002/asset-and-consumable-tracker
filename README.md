# Asset Tracker Monorepo

Welcome to the Asset Tracker full-stack monorepo built using React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Express.js, and Drizzle ORM.

## Setup Instructions

Please execute these strictly sequentially:

# 1. Unzip and enter directory
```bash
unzip asset-tracker.zip && cd asset-tracker
```

# 2. Create MySQL database
```bash
mysql -u root -p -e "CREATE DATABASE asset_tracker;"
```

# 3. Setup backend env
```bash
cp backend/.env.example backend/.env
# (edit backend/.env with DB credentials matching your local MySQL user/pass)
```

# 4. Setup frontend env  
```bash
cp frontend/.env.example frontend/.env
```

# 5. Install all dependencies
```bash
# This installs dependencies in root, frontend, and backend packages
npm run install:all

# Next, initialize your Shadcn Components via CLI strictly inside the frontend:
cd frontend
npx shadcn-ui@latest add button input label form card badge dialog alert-dialog select textarea tabs table toast toaster skeleton progress separator dropdown-menu sheet tooltip scroll-area avatar --yes
cd ..
```

# 6. Run migrations and seed
```bash
# Executes Drizzle map and bootstraps initial administrator node
npm run db:migrate && npm run db:seed
```

# 7. Start development
```bash
npm run dev
```

### Endpoints Supported
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
# Admin login: admin@tracker.com / Admin@123
# User login:  user@tracker.com / User@123
