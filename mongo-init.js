// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Create the database and collections
db = db.getSiblingDB('astrobalendar');

// Create users collection with indexes
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ 'auth.providerId': 1 });
db.users.createIndex({ createdAt: 1 });

// Create sessions collection with indexes
db.createCollection('sessions');
db.sessions.createIndex({ userId: 1 });
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

// Create horoscopes collection with indexes
db.createCollection('horoscopes');
db.horoscopes.createIndex({ userId: 1 });
db.horoscopes.createIndex({ birthDate: 1 });
db.horoscopes.createIndex({ 'location.coordinates': '2dsphere' });
db.horoscopes.createIndex({ createdAt: 1 });

// Create predictions collection with indexes
db.createCollection('predictions');
db.predictions.createIndex({ userId: 1 });
db.predictions.createIndex({ horoscopeId: 1 });
db.predictions.createIndex({ date: 1 });
db.predictions.createIndex({ category: 1 });
db.predictions.createIndex({ createdAt: 1 });

// Create audit logs collection with TTL index
db.createCollection('auditLogs');
db.auditLogs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

// Create system settings collection
db.createCollection('settings');
db.settings.createIndex({ key: 1 }, { unique: true });

// Insert default settings if they don't exist
const defaultSettings = [
  {
    key: 'maintenanceMode',
    value: false,
    description: 'Enable/disable maintenance mode',
    updatedAt: new Date()
  },
  {
    key: 'apiRateLimit',
    value: 100,
    description: 'Maximum number of requests per minute per IP',
    updatedAt: new Date()
  },
  {
    key: 'enableRegistration',
    value: true,
    description: 'Enable/disable new user registration',
    updatedAt: new Date()
  }
];

defaultSettings.forEach(setting => {
  db.settings.updateOne(
    { key: setting.key },
    { $setOnInsert: setting },
    { upsert: true }
  );
});

print('✅ MongoDB initialization completed');
