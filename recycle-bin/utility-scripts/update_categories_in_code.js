#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script untuk mengupdate semua referensi kategori di codebase
 */

const CATEGORY_MAPPING = {
  'Topwear': 'Top Wear',
  'Bottomwear': 'Bottom Wear',
  'Winterwear': 'Top & Bottom Wear'
};

function updateFileContent(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    for (const [oldCategory, newCategory] of Object.entries(CATEGORY_MAPPING)) {
      const regex = new RegExp(oldCategory, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, newCategory);
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function findAndUpdateFiles(directory, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const items = fs.readdirSync(directory);
  let updatedCount = 0;
  
  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
      updatedCount += findAndUpdateFiles(fullPath, extensions);
    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
      if (updateFileContent(fullPath)) {
        updatedCount++;
      }
    }
  }
  
  return updatedCount;
}

// Main execution
console.log('🔄 Starting category update process...');
console.log('📂 Scanning frontend and admin directories...');

const frontendDir = './frontend/src';
const adminDir = './admin/src';

let totalUpdated = 0;

if (fs.existsSync(frontendDir)) {
  console.log('\n📁 Updating frontend files...');
  totalUpdated += findAndUpdateFiles(frontendDir);
}

if (fs.existsSync(adminDir)) {
  console.log('\n📁 Updating admin files...');
  totalUpdated += findAndUpdateFiles(adminDir);
}

console.log(`\n✅ Process completed! Updated ${totalUpdated} files.`);
console.log('\n📋 Category mappings applied:');
for (const [old, newCat] of Object.entries(CATEGORY_MAPPING)) {
  console.log(`   ${old} → ${newCat}`);
}
