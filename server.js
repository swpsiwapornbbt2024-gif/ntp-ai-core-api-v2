const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

// ********** IMPORTANT: CONNECTION STRING **********
// ใช้ Connection String ที่คุณกู้คืนมาแทนที่ใน URI นี้
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const app = express();
// Server ที่ Deploy บน Render จะใช้ PORT ที่ระบบกำหนด
const port = process.env.PORT || 3000; 

app.use(cors());
app.use(express.json());

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

        // ดึงข้อมูลงานล่าสุด (logistics.jobs)
        const latestJobs = await logisticsDB.collection('jobs').find({}).sort({ date: -1 }).limit(5).toArray();
        // ดึงข้อมูลแจ้งเตือนซ่อมบำรุง (ntp_logistics.maintenance)
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

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
