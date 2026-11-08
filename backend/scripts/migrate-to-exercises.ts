import Database from 'better-sqlite3';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function getDatabasePath(): string {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && dbUrl.startsWith('file:')) {
    const rawPath = dbUrl.replace('file:', '');
    return path.isAbsolute(rawPath) ? rawPath : path.resolve(__dirname, '..', rawPath);
  }
  return path.resolve(__dirname, '../data/dev.db');
}

function runMigration() {
  const dbPath = getDatabasePath();
  console.log(`[Migration] Connecting to SQLite at: ${dbPath}`);
  const db = new Database(dbPath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Check columns on Lesson table
  const columns = db.prepare("PRAGMA table_info('Lesson')").all() as Array<{ name: string }>;
  const columnNames = new Set(columns.map((c) => c.name));

  if (!columnNames.has('generalFeedback')) {
    console.log('[Migration] Adding column generalFeedback to Lesson table');
    db.prepare('ALTER TABLE "Lesson" ADD COLUMN "generalFeedback" TEXT').run();
  }

  if (!columnNames.has('handwrittenOcrText')) {
    console.log('[Migration] Adding column handwrittenOcrText to Lesson table');
    db.prepare('ALTER TABLE "Lesson" ADD COLUMN "handwrittenOcrText" TEXT').run();
  }

  // Create LessonExercise table if not exists
  console.log('[Migration] Ensuring LessonExercise table exists');
  db.prepare(`
    CREATE TABLE IF NOT EXISTS "LessonExercise" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "lessonId" TEXT NOT NULL,
      "exerciseNumber" INTEGER NOT NULL,
      "instruction" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "userSubmission" TEXT,
      "score" INTEGER,
      "feedback" TEXT,
      "corrections" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "LessonExercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `).run();

  db.prepare(`
    CREATE UNIQUE INDEX IF NOT EXISTS "LessonExercise_lessonId_exerciseNumber_key"
    ON "LessonExercise"("lessonId", "exerciseNumber")
  `).run();

  db.prepare(`
    CREATE INDEX IF NOT EXISTS "LessonExercise_lessonId_idx"
    ON "LessonExercise"("lessonId")
  `).run();

  // If Lesson table still has lessonData, migrate data
  if (columnNames.has('lessonData')) {
    console.log('[Migration] Reading existing lessons with lessonData...');
    const lessons = db.prepare('SELECT id, lessonData, userSubmission, aiFeedback, createdAt, updatedAt FROM "Lesson"').all() as Array<{
      id: string;
      lessonData: string | null;
      userSubmission: string | null;
      aiFeedback: string | null;
      createdAt: string;
      updatedAt: string;
    }>;

    console.log(`[Migration] Found ${lessons.length} lessons to inspect.`);

    const insertExercise = db.prepare(`
      INSERT OR REPLACE INTO "LessonExercise" (
        id, lessonId, exerciseNumber, instruction, content, userSubmission, score, feedback, corrections, createdAt, updatedAt
      ) VALUES (
        @id, @lessonId, @exerciseNumber, @instruction, @content, @userSubmission, @score, @feedback, @corrections, @createdAt, @updatedAt
      )
    `);

    const updateLesson = db.prepare(`
      UPDATE "Lesson"
      SET generalFeedback = @generalFeedback,
          handwrittenOcrText = @handwrittenOcrText
      WHERE id = @id
    `);

    let migratedLessons = 0;
    let createdExercises = 0;

    const migrationTx = db.transaction(() => {
      for (const lesson of lessons) {
        if (!lesson.lessonData) {
          continue;
        }

        let ld: any;
        try {
          ld = JSON.parse(lesson.lessonData);
        } catch (e) {
          console.warn(`[Migration] Failed to parse lessonData for lesson ${lesson.id}, skipping exercise migration.`);
          continue;
        }

        let fb: any = null;
        if (lesson.aiFeedback) {
          try {
            fb = JSON.parse(lesson.aiFeedback);
          } catch (e) {
            console.warn(`[Migration] Failed to parse aiFeedback for lesson ${lesson.id}`);
          }
        }

        let us: any = null;
        if (lesson.userSubmission) {
          try {
            us = JSON.parse(lesson.userSubmission);
          } catch (e) {
            console.warn(`[Migration] Failed to parse userSubmission for lesson ${lesson.id}`);
          }
        }

        // Update promoted feedback columns on Lesson
        updateLesson.run({
          id: lesson.id,
          generalFeedback: fb?.generalFeedback ?? null,
          handwrittenOcrText: fb?.handwrittenOcrText ?? null,
        });

        const nowIso = new Date().toISOString();
        const createdAt = lesson.createdAt || nowIso;
        const updatedAt = lesson.updatedAt || nowIso;

        // Exercise 1
        const ex1Content = {
          type: ld.exercise1?.type,
          targetWords: ld.exercise1?.targetWords || [],
          sampleWords: ld.exercise1?.sampleWords,
          subjectPronouns: ld.exercise1?.subjectPronouns,
        };
        insertExercise.run({
          id: randomUUID(),
          lessonId: lesson.id,
          exerciseNumber: 1,
          instruction: ld.exercise1?.instruction || 'Exercise 1',
          content: JSON.stringify(ex1Content),
          userSubmission: us?.ex1 ? JSON.stringify({ text: us.ex1 }) : null,
          score: fb?.exercise1?.score ?? null,
          feedback: fb?.exercise1?.feedback ?? null,
          corrections: fb?.exercise1?.corrections ? JSON.stringify(fb.exercise1.corrections) : null,
          createdAt,
          updatedAt,
        });

        // Exercise 2
        const ex2Content = {
          sentencesToTranslate: ld.exercise2?.sentencesToTranslate || [],
        };
        insertExercise.run({
          id: randomUUID(),
          lessonId: lesson.id,
          exerciseNumber: 2,
          instruction: ld.exercise2?.instruction || 'Exercise 2',
          content: JSON.stringify(ex2Content),
          userSubmission: us?.ex2 ? JSON.stringify({ text: us.ex2 }) : null,
          score: fb?.exercise2?.score ?? null,
          feedback: fb?.exercise2?.feedback ?? null,
          corrections: fb?.exercise2?.corrections ? JSON.stringify(fb.exercise2.corrections) : null,
          createdAt,
          updatedAt,
        });

        // Exercise 3
        const ex3Content = {
          textToTranslate: ld.exercise3?.textToTranslate || '',
        };
        insertExercise.run({
          id: randomUUID(),
          lessonId: lesson.id,
          exerciseNumber: 3,
          instruction: ld.exercise3?.instruction || 'Exercise 3',
          content: JSON.stringify(ex3Content),
          userSubmission: us?.ex3 ? JSON.stringify({ text: us.ex3 }) : null,
          score: fb?.exercise3?.score ?? null,
          feedback: fb?.exercise3?.feedback ?? null,
          corrections: fb?.exercise3?.corrections ? JSON.stringify(fb.exercise3.corrections) : null,
          createdAt,
          updatedAt,
        });

        migratedLessons++;
        createdExercises += 3;
      }
    });

    migrationTx();

    console.log(`[Migration] Successfully migrated ${migratedLessons} lessons into ${createdExercises} LessonExercise records.`);
  } else {
    console.log('[Migration] lessonData column already absent from Lesson table. Pre-migration step previously executed.');
  }

  // Verification count
  const exerciseCount = db.prepare('SELECT count(*) as count FROM "LessonExercise"').get() as { count: number };
  console.log(`[Migration] Total LessonExercise rows in DB: ${exerciseCount.count}`);

  db.close();
}

runMigration();
