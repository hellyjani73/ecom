import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// Load env variables
dotenv.config();

const app = express();

// ✅ 1. CORS middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // Replace with specific domain(s) in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'auth-token'],
  credentials: true,
}));

app.options('*', cors()); // Preflight requests

// ✅ 2. Cookie parser middleware
app.use(cookieParser());

// ✅ 3. Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ✅ 4. Body parsing middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ✅ 3. Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ 4. MongoDB Connection
const connectToMongo = async () => {
  try {
    const DATABASE = process.env.DATABASE;
    if (!DATABASE) {
      throw new Error('DATABASE connection string is missing in environment variables');
    }

    await mongoose.connect(DATABASE);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

connectToMongo();

// ✅ 5. Mount routes
app.use('/api', routes);

// ✅ 6. Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: 'Internal server error',
    error: err.message || 'Unknown error',
  });
});

// ✅ 7. Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});

export default app;