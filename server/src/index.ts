import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import equipmentRoutes from './routes/equipment.routes';
import operatorRoutes from './routes/operator.routes';
import authRoutes from './routes/auth.routes';
import checklistRoutes from './routes/checklist.routes';
import statsRoutes from './routes/stats.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
  res.send('RIBAS API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
