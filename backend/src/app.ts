import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import buildingRoutes from './routes/buildingRoutes';
import assetRoutes from './routes/assetRoutes';
import inspectionRoutes from './routes/inspectionRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import dependencyRoutes from './routes/dependencyRoutes';
import riskRoutes from './routes/riskRoutes';
import sensorRoutes from './routes/sensorRoutes';
import lifecycleRoutes from './routes/lifecycleRoutes';
import warrantyRoutes from './routes/warrantyRoutes';
import vendorRoutes from './routes/vendorRoutes';
import failureRoutes from './routes/failureRoutes';
import alertRoutes from './routes/alertRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import reportRoutes from './routes/reportRoutes';
import auditRoutes from './routes/auditRoutes';
import scenarioRoutes from './routes/scenarioRoutes';

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/dependencies', dependencyRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/lifecycle', lifecycleRoutes);
app.use('/api', warrantyRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/failures', failureRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/scenarios', scenarioRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    system: 'GovBuild360 Backend',
    status: 'ONLINE',
    version: '1.0.0-PROTOTYPE',
    timestamp: new Date().toISOString()
  });
});
