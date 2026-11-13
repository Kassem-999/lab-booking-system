const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db.js');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/labs', require('./routes/labRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/equipment', require('./routes/equipmentRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((error) => {
    console.error(`MySQL connection failed: ${error.message}`);
    process.exit(1);
  });