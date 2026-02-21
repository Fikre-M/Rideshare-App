#!/usr/bin/env node

/**
 * Script to fix Framer Motion imports for LazyMotion compatibility
 * Replaces 'motion' with 'm' in components to enable tree-shaking
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToFix = [
  'src/pages/LandingPage.jsx',
  'src/pages/auth/Login.jsx',
  'src/pages/auth/Register.jsx',
  'src/pages/Profile.jsx',
  'src/pages/NotFound.jsx',
  'src/pages/MapView.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/auth/ForgotPassword.jsx',
  'src/components/dashboard/RealTimeMap.jsx',
  'src/components/notifications/NotificationCenter.jsx',
  'src/components/booking/RideBooking.jsx',
  'src/components/common/PageTransition.jsx',
  'src/components/common/ImageUpload.jsx',
  'src/components/ai/ChatBot.jsx',
  'src/components/ai/SmartMatching.jsx',
  'src/components/ai/RouteOptimizer.jsx',
  'src/components/ai/PredictiveAnalytics.jsx',
  'src/components/ai/ModelSelector.tsx',
  'src/components/ai/DynamicPricing.jsx',
  'src/components/ai/DemandPredictor.jsx',
  'src/components/ai/ChatBot.backup.jsx',
  'src/components/voice/VoiceCommand.tsx',
];

function fixMotionImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace motion import with m import
    // Pattern 1: import { motion } from 'framer-motion'
    if (content.includes("import { motion }") || content.includes("import { motion,")) {
      content = content.replace(
        /import\s*{\s*motion\s*,?\s*(.*?)\s*}\s*from\s*['"]framer-motion['"]/g,
        (match, rest) => {
          const imports = rest ? `m, ${rest}` : 'm';
          return `import { ${imports} } from 'framer-motion'`;
        }
      );
      modified = true;
    }

    // Pattern 2: import { motion, AnimatePresence } from 'framer-motion'
    if (content.includes("import { motion, AnimatePresence }")) {
      content = content.replace(
        /import\s*{\s*motion\s*,\s*AnimatePresence\s*}\s*from\s*['"]framer-motion['"]/g,
        "import { m, AnimatePresence } from 'framer-motion'"
      );
      modified = true;
    }

    // Replace all motion. usages with m.
    // Be careful not to replace 'motion' in comments or strings
    const motionComponentPattern = /<motion\./g;
    if (motionComponentPattern.test(content)) {
      content = content.replace(/<motion\./g, '<m.');
      content = content.replace(/<\/motion\./g, '</m.');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`- Skipped (no changes needed): ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing Framer Motion imports for LazyMotion compatibility...\n');

let fixedCount = 0;
let errorCount = 0;

filesToFix.forEach(file => {
  const fullPath = path.join(path.dirname(__dirname), file);
  if (fs.existsSync(fullPath)) {
    if (fixMotionImports(fullPath)) {
      fixedCount++;
    }
  } else {
    console.log(`⚠ File not found: ${file}`);
    errorCount++;
  }
});

console.log(`\n✨ Done! Fixed ${fixedCount} files.`);
if (errorCount > 0) {
  console.log(`⚠ ${errorCount} files not found.`);
}
