import cors from 'cors';
import helmet from 'helmet';
import { library } from './utils/library';
import indexRoutes from './api/indexRoutes';
import DatabaseConnection from './database/index';
import { ResponseHelper } from './helper/responseHelper';

const { express, app, dotenv } = library;

dotenv.config();

// Security and middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*', // Allow all origins for dev / screening testing
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/public', express.static(library.path.join(__dirname, '../public')));
app.use('/uploads', express.static(library.path.join(__dirname, '../uploads')));

// Mount API routes
app.use('/api', indexRoutes);
app.use('/', indexRoutes);

// 404 handler
app.use((req, res, _next) => {
  return ResponseHelper.sendErrorRes(res, `Route ${req.method} ${req.originalUrl} Not Found`, 404);
});

// Global error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Unhandled Application Error:', err);
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return ResponseHelper.sendErrorRes(res, message, status, err.data || {});
});

export { app };

(async function () {
  if (process.env.NODE_ENV !== 'test') {
    const dbConnect: boolean = await DatabaseConnection.load();
    if (dbConnect) {
      const port = process.env.PORT || 4000;
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`API Base: http://localhost:${port}/api`);
        console.log(`Health Check: http://localhost:${port}/api/health`);
        console.log(`Date: ${new Date().toISOString()}`);
      });
    } else {
      console.error('Failed to establish database connection. Server not started.');
    }
  }
})();