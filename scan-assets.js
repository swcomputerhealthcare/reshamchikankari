const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'public', 'images', 'reshamchikankari');

if (!fs.existsSync(targetDir)) {
  console.error(`Directory not found: ${targetDir}`);
  process.exit(1);
}

const folders = fs.readdirSync(targetDir)
  .filter(file => fs.statSync(path.join(targetDir, file)).isDirectory());

// Sort folders numerically: "New folder", "New folder (2)", "New folder (3)"...
folders.sort((a, b) => {
  const getNum = str => {
    const match = str.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 1;
  };
  return getNum(a) - getNum(b);
});

console.log(`Found ${folders.length} folders.`);

for (const folder of folders) {
  const folderPath = path.join(targetDir, folder);
  const files = fs.readdirSync(folderPath)
    .filter(file => !fs.statSync(path.join(folderPath, file)).isDirectory());
  
  console.log(`Folder: ${folder} (${files.length} files)`);
  if (files.length > 0) {
    console.log(`  Sample files:`, files.slice(0, 3));
  }
}
