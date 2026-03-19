# Command Reference

Quick reference for all optimization-related commands.

## 🔨 Build Commands

### Development Build
```bash
npm run dev
# Starts dev server on http://localhost:8000
```

### Production Build
```bash
npm run build
# Builds optimized production bundle
# Generates dist/stats.html for bundle analysis
```

### Preview Production Build
```bash
npm run preview
# Serves production build locally
# Available on http://localhost:3003
```

### Build and Analyze
```bash
npm run analyze
# Builds and opens bundle analyzer
# Windows: Opens dist/stats.html automatically
```

## 🔧 Optimization Commands

### Fix MUI Imports
```bash
npm run fix-mui-imports
# Automatically converts barrel imports to direct imports
# Affects ~50 files
# IMPORTANT: Test thoroughly after running
```

### Manual MUI Import Fix
```bash
# Find files with barrel imports
grep -r "from '@mui/material'" src/

# Or on Windows PowerShell
Select-String -Path "src/**/*.jsx" -Pattern "from '@mui/material'"
```

## 📊 Analysis Commands

### View Bundle Stats
```bash
# After build, open in browser:
# Windows
start dist/stats.html

# Mac
open dist/stats.html

# Linux
xdg-open dist/stats.html
```

### Check Bundle Sizes
```bash
# List all bundle files with sizes
ls -lh dist/assets/*.js

# Or on Windows PowerShell
Get-ChildItem dist/assets/*.js | Format-Table Name, Length
```

### Analyze Gzipped Sizes
```bash
# On Unix/Mac
gzip -c dist/assets/vendor-*.js | wc -c

# Or use the stats.html file (includes gzip sizes)
```

## 🧪 Testing Commands

### Run Tests
```bash
npm test
# Runs all tests once
```

### Watch Mode
```bash
npm run test:watch
# Runs tests in watch mode
```

### Coverage Report
```bash
npm run test:coverage
# Generates coverage report
```

## 🔍 Debugging Commands

### Check for Circular Dependencies
```bash
npm run build 2>&1 | grep "Circular"
# Shows any circular dependency warnings
```

### Find Large Modules
```bash
# After build, check stats.html
# Or use source-map-explorer (if installed)
npx source-map-explorer dist/assets/*.js
```

### Check Import Patterns
```bash
# Find all MUI imports
grep -r "@mui/material" src/ | grep "from"

# Find all motion imports
grep -r "framer-motion" src/ | grep "from"

# Find all AI service imports
grep -r "aiService" src/ | grep "import"
```

## 💰 Budget Management Commands

### Check Current Budget (in browser console)
```javascript
// Open browser console (F12)
import('@/services/aiBudgetGuard').then(({ default: guard }) => {
  console.log(guard.getStats());
});
```

### Reset Budget (in browser console)
```javascript
import('@/services/aiBudgetGuard').then(({ default: guard }) => {
  guard.resetSession();
  console.log('Budget reset');
});
```

### Configure Budget (in browser console)
```javascript
import('@/services/aiBudgetGuard').then(({ default: guard }) => {
  guard.configure({
    limit: 1.00,
    enabled: true,
    warningThreshold: 0.8,
  });
  console.log('Budget configured');
});
```

## 📦 Package Management

### Install Dependencies
```bash
npm install
# Installs all dependencies
```

### Update Dependencies
```bash
npm update
# Updates all dependencies to latest compatible versions
```

### Check for Outdated Packages
```bash
npm outdated
# Shows packages that have newer versions
```

### Audit Security
```bash
npm audit
# Checks for security vulnerabilities
```

## 🚀 Deployment Commands

### Build for Production
```bash
# Clean build
rm -rf dist
npm run build

# Or on Windows
rmdir /s /q dist
npm run build
```

### Verify Build
```bash
# Check if all chunks are present
ls dist/assets/

# Check index.html
cat dist/index.html

# Test production build locally
npm run preview
```

## 🔄 Git Commands (Optimization Related)

### Commit Optimizations
```bash
git add .
git commit -m "feat: add production optimizations and AI cost guards"
```

### Create Feature Branch
```bash
git checkout -b feature/production-optimizations
```

### View Changes
```bash
git status
git diff
```

## 📝 Documentation Commands

### View Documentation
```bash
# Quick reference
cat QUICK_REFERENCE.md

# Full guide
cat OPTIMIZATION_GUIDE.md

# Implementation summary
cat PRODUCTION_OPTIMIZATION_SUMMARY.md

# Results
cat OPTIMIZATION_RESULTS.md
```

### Search Documentation
```bash
# Find specific topic
grep -r "useAIQuery" *.md

# Or on Windows PowerShell
Select-String -Path "*.md" -Pattern "useAIQuery"
```

## 🐛 Troubleshooting Commands

### Clear Node Modules
```bash
rm -rf node_modules package-lock.json
npm install

# Or on Windows
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Clear Build Cache
```bash
rm -rf dist .vite
npm run build

# Or on Windows
rmdir /s /q dist
rmdir /s /q .vite
npm run build
```

### Check Node/NPM Versions
```bash
node --version
npm --version
# Should be Node 18+ and NPM 9+
```

### Verify Vite Config
```bash
cat vite.config.js
# Check for syntax errors
```

## 📊 Performance Testing Commands

### Lighthouse (Chrome DevTools)
```bash
# 1. Build production
npm run build

# 2. Serve production build
npm run preview

# 3. Open Chrome DevTools (F12)
# 4. Go to Lighthouse tab
# 5. Run audit
```

### Bundle Size Tracking
```bash
# Create size report
npm run build > build-report.txt

# Compare with previous build
diff build-report.txt build-report-old.txt
```

## 🔐 Environment Commands

### Check Environment Variables
```bash
# View all VITE_ variables
env | grep VITE_

# Or on Windows PowerShell
Get-ChildItem Env: | Where-Object { $_.Name -like "VITE_*" }
```

### Load Environment
```bash
# Development
cp .env.example .env
# Edit .env with your values

# Production
# Set environment variables in your deployment platform
```

## 📈 Monitoring Commands

### Check AI Usage (in app)
```bash
# Open browser console
# Cost tracker widget shows live stats
# Or programmatically:
localStorage.getItem('ai-budget-storage')
```

### View Query Cache (in app)
```bash
# Open React Query DevTools
# Available in development mode
# Shows all cached queries
```

## 🎯 Quick Workflows

### Full Optimization Workflow
```bash
# 1. Fix imports
npm run fix-mui-imports

# 2. Build
npm run build

# 3. Analyze
npm run analyze

# 4. Test
npm test

# 5. Preview
npm run preview
```

### Debug Build Issues
```bash
# 1. Clean everything
rm -rf node_modules dist .vite package-lock.json

# 2. Reinstall
npm install

# 3. Try build
npm run build

# 4. Check for errors
npm run build 2>&1 | tee build-log.txt
```

### Deploy Workflow
```bash
# 1. Run tests
npm test

# 2. Build production
npm run build

# 3. Verify bundle sizes
ls -lh dist/assets/*.js

# 4. Test production build
npm run preview

# 5. Deploy (platform specific)
# Example: Vercel
vercel --prod
```

## 💡 Useful Aliases (Optional)

Add to your shell profile (.bashrc, .zshrc, etc.):

```bash
# Quick build and analyze
alias ba="npm run build && npm run analyze"

# Quick dev start
alias dev="npm run dev"

# Quick test
alias t="npm test"

# Fix and build
alias fab="npm run fix-mui-imports && npm run build"
```

## 📚 Help Commands

### NPM Scripts Help
```bash
npm run
# Lists all available scripts
```

### Package Info
```bash
npm info <package-name>
# Shows package information
```

### Command Help
```bash
npm help <command>
# Shows help for specific npm command
```

---

**Tip**: Bookmark this file for quick command reference!

**Note**: Some commands may need adjustment based on your OS (Windows/Mac/Linux).
