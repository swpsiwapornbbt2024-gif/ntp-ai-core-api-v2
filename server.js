// server.js

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

