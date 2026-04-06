// Description: This script syncs the google-services.json file from the project root to the android/app directory.
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = __dirname;
const source = path.join(projectRoot, 'google-services.json');
const destination = path.join(projectRoot, 'android', 'app', 'google-services.json');

// Check if the source file exists
if (!fs.existsSync(source)) {
  console.warn('[sync:google-services] Source file not found:', source);
  process.exit(0);
}

// Read and validate the source JSON
const sourceContent = fs.readFileSync(source, 'utf8');
let sourceJson;


// Validate JSON structure
try {
  sourceJson = JSON.parse(sourceContent);
} catch (error) {
  console.error('[sync:google-services] Invalid JSON in source file:', error.message);
  process.exit(1);
}

// Basic validation to ensure it has the expected structure 
if (!sourceJson.client || !Array.isArray(sourceJson.client) || sourceJson.client.length === 0) {
  console.error('[sync:google-services] Missing "client" section in google-services.json');
  process.exit(1);
}

// Ensure the destination directory exists and write the file
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, JSON.stringify(sourceJson, null, 2) + '\n', 'utf8');

console.log('[sync:google-services] Synced to', destination);