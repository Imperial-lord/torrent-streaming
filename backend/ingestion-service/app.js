import express from 'express';
import morgan from 'morgan';
import torrentRoutes from './routes/torrentRoutes.js';

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use('/api', torrentRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

export default app;