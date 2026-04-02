import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../../swagger/swagger.json';
import { config } from './config/index';
import { requestLogger } from './middlewares/requestLogger';
import { errorMiddleware } from './middlewares/errorMiddleware';
import authRoutes from './routes/authRoutes';
import todoRoutes from './routes/todoRoutes';
import { JwtPayload } from './types/auth.types';

declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}

const app: Application = express();

app.use(cors({ origin: config.cors.origin }));
app.use(express.json());
app.use(requestLogger);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

app.use(errorMiddleware);

export default app;
