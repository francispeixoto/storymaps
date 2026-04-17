import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initDatabase } from './models/db';
import mapRoutes from './routes/mapRoutes';
import activityRoutes from './routes/activityRoutes';
import actionRoutes from './routes/actionRoutes';
import actorRoutes from './routes/actorRoutes';
import contextRoutes from './routes/contextRoutes';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

initDatabase();

app.use('/api/contexts', contextRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/actors', actorRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;