import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mapRoutes from './routes/mapRoutes'; // Adjust path if needed

dotenv.config();

const app = express();
// Change this to 3000 to match your frontend service
const PORT = 3000; 

app.use(cors());
app.use(express.json());

app.use('/api', mapRoutes);

app.get('/health', (req, res) => {
  res.send('Campus Guide Backend is running ');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});