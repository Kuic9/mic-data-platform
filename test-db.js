const { initializeDatabase } = require('./src/config/database');
const path = require('path');

console.log('Current working directory:', process.cwd());
console.log('Database path:', path.join(__dirname, 'data/mic_platform.db'));

initializeDatabase()
  .then(() => {
    console.log('Database initialization successful');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }); 