import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import equipmentRoutes from './routes/equipment.routes';
import operatorRoutes from './routes/operator.routes';
import authRoutes from './routes/auth.routes';
import checklistRoutes from './routes/checklist.routes';
import statsRoutes from './routes/stats.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import documentRoutes from './routes/document.routes';
import serviceRoutes from './routes/service.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/maintenances', maintenanceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/services', serviceRoutes);

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
});

app.get('/', (req, res) => {
  res.send('RIBAS API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
