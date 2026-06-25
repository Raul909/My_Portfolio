const fs = require('fs');
const path = require('path');

const key = process.env.WEB3FORMS_KEY;
const indexPath = path.join(__dirname, 'index.html');

if (!key) {
  console.log('Warning: WEB3FORMS_KEY environment variable is not set. Skipping injection.');
} else {
  try {
    let content = fs.readFileSync(indexPath, 'utf8');
    content = content.replace(/\{\{WEB3FORMS_KEY\}\}/g, key.trim());
    fs.writeFileSync(indexPath, content);
    console.log('Web3Forms key securely injected.');
  } catch (error) {
    console.error('Failed to inject key:', error);
    process.exit(1);
  }
}
