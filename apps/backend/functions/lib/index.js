"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
admin.initializeApp();
const db = admin.firestore();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// Health check
app.get('/health', (req, res) => res.send('AstroBalendar backend is up!'));
// Mock prediction endpoint
app.post('/predict', async (req, res) => {
    // TODO: Replace with real KP logic
    const { name, dateOfBirth, timeOfBirth, location } = req.body;
    if (!name || !dateOfBirth || !timeOfBirth || !location) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    // Simulate prediction result
    res.json({
        kpChart: {
            rasi: [],
            lagna: 'Aries',
            nakshatra: 'Ashwini',
            dasa: 'Venus',
            bhukti: 'Mercury',
            planetaryPositions: [],
            houses: [],
            significators: []
        },
        message: 'This is a mock prediction. KP logic to be implemented.'
    });
});
// User registration (store user + birth data)
app.post('/register', async (req, res) => {
    const { uid, role, name, email, mobile, birthData } = req.body;
    if (!uid || !role || !name || !email || !mobile || !birthData) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    await db.collection('users').doc(uid).set({
        role, name, email, mobile, birthData, createdAt: new Date().toISOString()
    }, { merge: true });
    res.json({ success: true });
});
// Location data (mock for now)
app.get('/locations', (req, res) => {
    // TODO: Replace with real location DB or Google Maps API
    res.json({
        countries: ['India'],
        states: ['Tamil Nadu', 'Karnataka'],
        districts: ['Arcot', 'Chennai', 'Bangalore Urban'],
        cities: ['Vellore', 'Chennai', 'Bangalore']
    });
});
// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
