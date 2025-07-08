#!/usr/bin/env node

/**
 * Quick Fix Script for Timetable Generator
 * Run this script to fix common issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Timetable Generator - Quick Fix Script');
console.log('==========================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Please run this script from the project root directory');
  process.exit(1);
}

// Check for .env file
if (!fs.existsSync('.env.local') && !fs.existsSync('.env')) {
  console.log('⚠️  Warning: No .env file found');
  console.log('   Please create .env.local with required environment variables');
  console.log('   See SETUP_GUIDE.md for details\n');
}

// Function to run commands safely
function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed: ${error.message}\n`);
    return false;
  }
}

// Fix 1: Install dependencies
console.log('1. Checking dependencies...');
if (!fs.existsSync('node_modules')) {
  runCommand('npm install', 'Installing dependencies');
} else {
  console.log('✅ Dependencies already installed\n');
}

// Fix 2: Generate Prisma client
console.log('2. Setting up database...');
runCommand('npx prisma generate', 'Generating Prisma client');

// Fix 3: Push database schema
runCommand('npx prisma db push', 'Pushing database schema');

// Fix 4: Seed database
runCommand('npm run db:seed', 'Seeding database');

// Fix 5: Clear Next.js cache
console.log('3. Clearing cache...');
if (fs.existsSync('.next')) {
  runCommand('rm -rf .next', 'Clearing Next.js cache');
}

// Fix 6: Check TypeScript
console.log('4. Checking TypeScript...');
runCommand('npx tsc --noEmit', 'TypeScript type checking');

// Fix 7: Build check
console.log('5. Testing build...');
runCommand('npm run build', 'Building project');

console.log('🎉 Quick fix completed!');
console.log('\nNext steps:');
console.log('1. Start the development server: npm run dev');
console.log('2. Open http://localhost:3000 in your browser');
console.log('3. Check the console for any remaining errors');
console.log('\nIf you encounter issues:');
console.log('- Check SETUP_GUIDE.md for detailed instructions');
console.log('- Verify your environment variables are set correctly');
console.log('- Check the browser console for error messages'); 