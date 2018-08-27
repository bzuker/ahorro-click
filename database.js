const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const adapter = new FileAsync('.data/db.json');
const db = low(adapter);

db.defaults({ tweets: [] }).write();