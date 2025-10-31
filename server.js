const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

// **********************************************
// 1. CONFIGURATION & INITIALIZATION
// **********************************************
// ใช้ URI จาก Environment Variable
const uri = process.env.MONGO_URI; 
const client = new MongoClient(uri);
const app = express();

// กำหนด PORT และ HOST ตามที่ Render กำหนด
const port = process.env.PORT || 3000; 
const host = '0.0.0.0'; 

// **********************************************
// 2. MIDDLEWARE (ต้องอยู่ก่อน API Endpoints)
// **********************************************
app.use(cors());
app.use(express.json());

// **********************************************
// 3. API ENDPOINTS
// **********************************************

// API Endpoint: Health Check
app.get('/', (req, res) => {
    res.send('NTP AI Core API V2 is Online and ready to serve!');
});

// API Endpoint หลัก: ดึงข้อมูลเชื่อมโยงเพื่อสร้างรายได้
app.get('/api/social_impact_data', async (req, res) => {
    try {
        await client.connect();
        
        const logisticsDB = client.db('logistics'); 
        const ntpLogisticsDB = client.db('ntp_logistics'); 

        // ดึงข้อมูล
        const latestJobs = await logisticsDB.collection('jobs').find({}).sort({ date: -1 }).limit(5).toArray();
        const maintenanceAlerts = await ntpLogisticsDB.collection('maintenance').find({ status: 'pending' }).limit(5).toArray();
        
        res.status(200).json({
            status: "success",
            message: "Core data synchronized and ready for AI analysis.",
            latest_jobs: latestJobs,
            maintenance_alerts: maintenanceAlerts 
        });
    } catch (error) {
        console.error("Connection or Data Retrieval Error:", error);
        res.status(500).json({ status: "error", message: "Internal server error. Failed to connect or retrieve data." });
    } finally {
        // ในการ Deploy จริง จะจัดการ Connection pool
    }
});

// **********************************************
// 4. START SERVER (เรียกใช้เพียงครั้งเดียวตอนท้ายสุด)
// **********************************************
app.listen(port, host, () => { 
    console.log(`Server listening on ${host}:${port}`);
});

// ในไฟล์ server.js (สมมติว่าคุณได้เรียกใช้ Express และ MongoDB แล้ว)

// ... (โค้ด Express app.use() และอื่นๆ) ...

// **เพิ่มโค้ด Route นี้ตรงนี้:**
app.get('/api/v1/users', async (req, res) => {
    try {
        // โค้ด MongoDB สำหรับค้นหาข้อมูล (ต้องแน่ใจว่าได้เรียกใช้โมเดล User หรือ MongoDB Connection แล้ว)
        // const users = await User.find({}); 
        res.status(200).json({ message: "Route is working, but MongoDB code is missing." }); // สามารถทดสอบด้วยโค้ดนี้ก่อน
    } catch (error) {
        console.error("MongoDB Error:", error);
        res.status(500).send("Internal Server Error during MongoDB operation.");
    }
});

// ... (โค้ด app.listen(port, ...) ต้องอยู่สุดท้าย) ... 
