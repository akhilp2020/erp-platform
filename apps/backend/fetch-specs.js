const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the Week 2 intake UI SQLite DB
const dbPath = path.resolve(__dirname, '../intake-ui/prisma/dev.db');

function getSpecs(callback) {
  const db = new sqlite3.Database(dbPath);

  db.all('SELECT * FROM Spec', [], (err, rows) => {
    if (err) throw err;
    callback(rows);
  });

  db.close();
}

// Allow this file to be run directly for testing
if (require.main === module) {
  getSpecs(specs => {
    console.log("Fetched specs:", specs);
  });
}

module.exports = getSpecs;

