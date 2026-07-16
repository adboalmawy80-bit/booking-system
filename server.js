const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'appointments.json');

// --- إعدادات الإيميل الذكية ---
// المشتري يغير هذه القيم لتشغيل الإيميل، وإذا تركها كما هي لن يظهر أي خطأ في السيرفر
const SENDER_EMAIL = 'your-email@gmail.com'; 
const SENDER_PASS = 'your-app-password';

const isEmailConfigured = SENDER_EMAIL !== 'your-email@gmail.com' && SENDER_PASS !== 'your-app-password';

let transporter = null;
if (isEmailConfigured) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: SENDER_EMAIL,
            pass: SENDER_PASS
        }
    });
    console.log('✉️ Email notifications: ENABLED');
} else {
    console.log('⚠️ Email notifications: DISABLED (Demo Mode - Run without sending emails)');
}
// -----------------------------

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. جلب الأوقات المحجوزة
app.get('/api/booked-slots', (req, res) => {
    const { date } = req.query;
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json([]);
        const appointments = JSON.parse(data);
        const bookedSlots = appointments
            .filter(app => app.date === date)
            .map(app => app.time);
        res.json(bookedSlots);
    });
});

// 2. جلب جميع الحجوزات
app.get('/api/appointments', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error reading data' });
        res.json(JSON.parse(data));
    });
});

// 3. إضافة حجز جديد
app.post('/api/appointments', (req, res) => {
    const { name, email, phone, date, time } = req.body;

    if (!name || !email || !phone || !date || !time) {
        return res.status(400).json({ error: 'Please fill all fields!' });
    }

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Server Error' });

        const appointments = JSON.parse(data);
        const isTaken = appointments.some(app => app.date === date && app.time === time);
        if (isTaken) {
            return res.status(400).json({ error: 'This slot is already booked!' });
        }

        const newAppointment = { id: Date.now(), name, email, phone, date, time, status: 'Pending' };
        appointments.push(newAppointment);

        fs.writeFile(DATA_FILE, JSON.stringify(appointments, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Failed to save appointment' });
            res.status(201).json({ message: 'Appointment booked successfully!', appointment: newAppointment });
        });
    });
});

// 4. تحديث الحالة وإرسال إيميل (فقط إذا كانت الإعدادات مفعلة)
app.put('/api/appointments/:id', (req, res) => {
    const { status } = req.body;
    const id = parseInt(req.params.id);

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Server Error' });

        let appointments = JSON.parse(data);
        const index = appointments.findIndex(app => app.id === id);

        if (index !== -1) {
            appointments[index].status = status;
            const customer = appointments[index];

            fs.writeFile(DATA_FILE, JSON.stringify(appointments, null, 2), (err) => {
                if (err) return res.status(500).json({ error: 'Failed to update' });

                // إرسال الإيميل فقط إذا كان العميل قام بتهيئة حسابه بشكل صحيح
                if (status === 'Approved' && isEmailConfigured && transporter) {
                    const mailOptions = {
                        from: SENDER_EMAIL,
                        to: customer.email,
                        subject: 'Appointment Approved! 🎉',
                        html: `<h3>Dear ${customer.name},</h3>
                               <p>Your appointment has been <strong>Approved</strong>!</p>
                               <p><strong>Date:</strong> ${customer.date}</p>
                               <p><strong>Time:</strong> ${customer.time}</p>
                               <p>Thank you for choosing our services.</p>`
                    };

                    transporter.sendMail(mailOptions, (mailErr, info) => {
                        if (mailErr) {
                            console.log('✉️ Email send error:', mailErr.message);
                        } else {
                            console.log('✉️ Email sent to: ' + customer.email);
                        }
                    });
                } else if (status === 'Approved') {
                    console.log(`✉️ Email sending skipped (Email credentials not configured yet). Approved: ${customer.name}`);
                }

                res.json({ message: `Appointment status updated to ${status}` });
            });
        } else {
            res.status(404).json({ error: 'Appointment not found' });
        }
    });
});

// 5. حذف حجز
app.delete('/api/appointments/:id', (req, res) => {
    const id = parseInt(req.params.id);

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Server Error' });

        let appointments = JSON.parse(data);
        appointments = appointments.filter(app => app.id !== id);

        fs.writeFile(DATA_FILE, JSON.stringify(appointments, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Failed to delete' });
            res.json({ message: 'Appointment deleted successfully' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});