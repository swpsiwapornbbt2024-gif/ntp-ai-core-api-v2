// server.js (วางทับไฟล์เดิม)
require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Storage สำหรับ multer (เก็บในโฟลเดอร์ uploads/)
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // ตั้งชื่อไฟล์เพื่อไม่ให้ซ้ำ
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2,8)}-${file.originalname}`;
    cb(null, unique);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit, ปรับได้
  fileFilter: (req, file, cb) => {
    // ยอมรับเฉพาะ zip เท่านั้น
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.zip') cb(null, true);
    else cb(new Error('Only .zip files are allowed'));
  }
});

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI environment variable is not set.");
  process.exit(1);
}

let dbClient;
let db;
async function connectDB() {
  try {
    dbClient = new MongoClient(MONGO_URI);
    await dbClient.connect();
    db = dbClient.db(process.env.MONGO_DBNAME || 'ntp_ai_core'); // ถ้าต้องการเปลี่ยนชื่อ DB ให้ตั้ง env MONGO_DBNAME
    // Ensure index on users.email (unique) for safety
    await db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log("✅ MongoDB successfully connected.");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

// Health
app.get('/', (req, res) => res.status(200).send("NTP AI Core API V2 is Online and ready to serve"));

// GET all users (ดึงจาก MongoDB จริง)
app.get('/api/v1/users', async (req, res) => {
  try {
    const users = await db.collection('users').find({}).toArray();
    res.status(200).json({ status: "success", count: users.length, users });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error during data retrieval." });
  }
});

// GET single user by id
app.get('/api/v1/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create user
app.post('/api/v1/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    // email optional แต่ถ้ามีจะบังคับ unique index
    const newUser = { name, email, createdAt: new Date() };
    const result = await db.collection('users').insertOne(newUser);
    newUser._id = result.inserted/ server.js

const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();

// **การตั้งค่า Middleware**
app.use(cors());
app.use(express.json()); // สำหรับการอ่าน JSON ใน POST requests

// **การเชื่อมต่อ MongoDB**
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI environment variable is not set.");
    process.exit(1);
}

let db;

async function connectDB() {
    try {
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        db = client.db(); // ถ้าคุณต้องการเชื่อมต่อกับ database ชื่อเฉพาะ ให้ใส่ชื่อ database ใน .db('your_db_name')
        console.log("✅ MongoDB successfully connected.");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        // ทำให้แอปฯ ล้มเหลวถ้าเชื่อมต่อ DB ไม่ได้
        process.exit(1); 
    }
}

// **Route พื้นฐาน (ที่ทำงานอยู่แล้ว)**
app.get('/', (req, res) => {
    res.status(200).send("NTP AI Core API V2 is Online and ready to serve");
});

// --------------------------------------------------------------------------------
// **Route ที่แก้ไข (แก้ปัญหา 404 Not Found)**
// --------------------------------------------------------------------------------

app.get('/api/v1/users', async (req, res) => {
    // โค้ดนี้จะยืนยันว่า Route ทำงานได้ก่อน
    // เมื่อคุณพร้อมที่จะดึงข้อมูลจริง ให้ใช้ db.collection('your_collection_name').find().toArray();
    try {
        // ตัวอย่างการดึงข้อมูลจาก collection ชื่อ 'users' (ถ้าคุณสร้างไว้)
        // const usersCollection = db.collection('users');
        // const users = await usersCollection.find({}).toArray();

        // ส่ง Response 200 OK เพื่อยืนยันว่า Route ทำงานได้สำเร็จ
        res.status(200).json({ 
            status: "success", 
            message: "User route is working! (Database connection confirmed by successful server start)", 
            users: [] // ส่ง Array ว่างไปก่อน
        }); 

    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({ status: "error", message: "Internal Server Error during data retrieval." });
    }
});


// **คำสั่งเริ่มเซิร์ฟเวอร์ (สำคัญมาก)**
// ต้องเรียก connectDB ก่อนที่จะเรียก app.listen
connectDB().then(() => {
    const port = process.env.PORT || 3000; 

    app.listen(port, '0.0.0.0', () => {
        console.log(`✅ Server listening on 0.0.0.0:${port}`);
    });
});

