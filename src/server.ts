import { app } from './app';
import { env } from './config/env';

app.listen(env.port, () => {
  console.log(`DevPulse API running on port ${env.port}`);
});

export default app;
