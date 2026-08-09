import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import session from 'express-session';
import passport from 'passport';
import { SqliteSessionStore } from './auth/sqlite-session-store';

async function bootstrap() {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const app = await NestFactory.create(AppModule);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Session store using SQLite (custom store, no unmaintained deps)
  const dbUrl = process.env.DATABASE_URL || 'file:./data/dev.db';
  const dbPath = dbUrl.replace('file:', '').replace(/^\.\//, path.join(__dirname, '..') + '/');
  const sessionDbPath = path.join(path.dirname(dbPath), 'sessions.db');

  // Ensure data directory exists
  const dataDir = path.dirname(sessionDbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const sessionStore = new SqliteSessionStore({
    dbPath: sessionDbPath,
    clearExpiredIntervalMs: 900000, // 15 min
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // Trust reverse proxy headers (X-Forwarded-Proto, X-Forwarded-For, etc.)
  // Required when behind Cloudflare Tunnel / Nginx / Docker so that:
  // - Passport generates https:// callback URLs (not http://)
  // - Secure cookies work correctly
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  app.enableCors({
    origin: [frontendUrl, 'http://localhost:5173', 'http://localhost:80'],
    credentials: true,
  });

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Korean Language Learner Backend running on http://localhost:${port}`);
}
bootstrap();
