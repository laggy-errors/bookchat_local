import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { initSocketServer } from './sockets';
import { prisma } from './prisma';

// Import Routes
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { bookRoutes } from './routes/book.routes';
import { chatRoutes } from './routes/chat.routes';
import { messageRoutes } from './routes/message.routes';
import { presenceRoutes } from './routes/presence.routes';
import { notificationRoutes } from './routes/notification.routes';
import { bookmarkRoutes } from './routes/bookmark.routes';
import { searchRoutes } from './routes/search.routes';
import { settingsRoutes } from './routes/settings.routes';
import { readingProgressRoutes } from './routes/reading-progress.routes';
import { annotationRoutes } from './routes/annotation.routes';
import { quoteRoutes } from './routes/quote.routes';
import { conversationRoutes } from './routes/conversation.routes';

const app = express();
app.set('trust proxy', 1);
const httpServer = createServer(app);

// 1. Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    credentials: true,
  })
);

// 2. Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Rate Limiter Middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000, // limit each IP to 100,000 requests per windowMs (prevent proxy blocking)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again after 15 minutes',
    errorCode: 'TOO_MANY_REQUESTS',
  },
});

app.use('/api', apiLimiter);

// 4. API Routes Mapping
app.get('/', (req, res) => {
  res.send('BookChat Server API Active & Scribing');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/presence', presenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/reading-progress', readingProgressRoutes);
app.use('/api/annotations', annotationRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/settings', settingsRoutes);

// 5. Global Error Handling Middleware
app.use(errorHandler);

// 6. Socket.IO Server Initialization
const io = initSocketServer(httpServer);
app.set('io', io);

// 7. Start Server Listeners
const port = config.port;
httpServer.listen(port, () => {
  console.log(`[BookChat Server] Listening on port ${port} (HTTP & Sockets Online)`);
});
