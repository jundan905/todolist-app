import dotenv from 'dotenv';
dotenv.config();

import { config } from './config/index';
import app from './app';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT} (${config.nodeEnv})`);
});
