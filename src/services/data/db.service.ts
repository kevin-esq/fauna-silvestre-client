import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { PublicationModelResponse } from '../../domain/models/publication.models';
import { Platform, AppState } from 'react-native';
import { CachesDirectoryPath, DocumentDirectoryPath } from 'react-native-fs';
import { imageOptimizationService } from '../image/image-optimization.service';

// -------------------
// CONFIGURACIÓN
// -------------------
const CONFIG = {
  DB_NAME: 'publications_v3.db',
  TABLE_NAME: 'publications',
  CACHE_TABLE: 'cache_metadata',
  MAX_BASE64_SIZE: 100 * 1024, // 100KB
  BATCH_SIZE: 5,
  MAX_CACHE_SIZE: 50 * 1024 * 1024,
  CACHE_TTL: 7 * 24 * 60 * 60 * 1000, // 7 días
  IMAGE_QUALITY: 0.8,
  THUMBNAIL_SIZE: 150,
  CACHE_DIR: Platform.OS === 'ios' ? DocumentDirectoryPath : CachesDirectoryPath
};

// -------------------
// LOGGER
// -------------------
const isDebug = __DEV__;
const log = (...args: unknown[]) => {
  if (isDebug) console.log(...args);
};

// -------------------
// SQL CONSTANTES
// -------------------
const SQL = {
  CREATE_PUBLICATIONS: `
    CREATE TABLE IF NOT EXISTS ${CONFIG.TABLE_NAME} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recordId INTEGER UNIQUE NOT NULL,
      commonNoun TEXT,
      animalState TEXT,
      description TEXT,
      img TEXT,
      location TEXT,
      author TEXT,
      imgPath TEXT,
      thumbnailPath TEXT,
      status TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,
  CREATE_CACHE: `
    CREATE TABLE IF NOT EXISTS ${CONFIG.CACHE_TABLE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL,
      page INTEGER NOT NULL,
      totalCount INTEGER NOT NULL,
      lastUpdated TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(status, page)
    )
  `,
  INSERT_PUBLICATION: `
    INSERT OR REPLACE INTO ${CONFIG.TABLE_NAME}
    (recordId, commonNoun, animalState, description, location, author, imgPath, thumbnailPath, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `,
  INSERT_CACHE: `
    INSERT OR REPLACE INTO ${CONFIG.CACHE_TABLE}
    (status, page, totalCount, lastUpdated)
    VALUES (?, ?, ?, datetime('now'))
  `,
  SELECT_PUBLICATIONS: `
    SELECT recordId, commonNoun, animalState, description, img, location, author,
           imgPath, thumbnailPath, status, createdAt, updatedAt
    FROM ${CONFIG.TABLE_NAME}
    WHERE status = ?
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?
  `,
  SELECT_CACHE: `
    SELECT page, totalCount, lastUpdated
    FROM ${CONFIG.CACHE_TABLE}
    WHERE status = ?
    ORDER BY page ASC
  `,
  DELETE_PUBLICATIONS_BY_STATUS: `DELETE FROM ${CONFIG.TABLE_NAME} WHERE status = ?`,
  DELETE_CACHE_BY_STATUS: `DELETE FROM ${CONFIG.CACHE_TABLE} WHERE status = ?`,
  DELETE_ALL_PUBLICATIONS: `DELETE FROM ${CONFIG.TABLE_NAME}`,
  DELETE_ALL_CACHE: `DELETE FROM ${CONFIG.CACHE_TABLE}`
};

// -------------------
// SERVICIO
// -------------------
class DatabaseService {
  private db: SQLiteDatabase | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      log('[DB] Initializing database...');
      await imageOptimizationService.initialize();

      this.db = await SQLite.openDatabase({
        name: CONFIG.DB_NAME,
        location: 'default'
      });

      await this.createTables();
      await this.createIndexes();

      this.isInitialized = true;
      log('[DB] Database initialized successfully');

      // Cerrar DB si la app se va a background
      AppState.addEventListener('change', state => {
        if (state === 'background') this.close();
      });
    } catch (error) {
      console.error('[DB] Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql(SQL.CREATE_PUBLICATIONS);
    await this.db.executeSql(SQL.CREATE_CACHE);

    // Migraciones tolerantes a errores
    const migrations = [
      `ALTER TABLE ${CONFIG.TABLE_NAME} ADD COLUMN imgPath TEXT`,
      `ALTER TABLE ${CONFIG.TABLE_NAME} ADD COLUMN thumbnailPath TEXT`,
      `ALTER TABLE ${CONFIG.CACHE_TABLE} ADD COLUMN totalCount INTEGER`,
      `ALTER TABLE ${CONFIG.CACHE_TABLE} ADD COLUMN lastUpdated TEXT DEFAULT CURRENT_TIMESTAMP`
    ];

    for (const migration of migrations) {
      try {
        await this.db.executeSql(migration);
        log(`[DB] Migration executed: ${migration}`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('duplicate column name')) {
          log(`[DB] Column already exists, skipping migration: ${migration}`);
        } else {
          console.warn(`[DB] Migration failed: ${migration}`, error);
        }
      }
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_recordId ON ${CONFIG.TABLE_NAME}(recordId)`,
      `CREATE INDEX IF NOT EXISTS idx_status ON ${CONFIG.TABLE_NAME}(status)`,
      `CREATE INDEX IF NOT EXISTS idx_createdAt ON ${CONFIG.TABLE_NAME}(createdAt)`,
      `CREATE INDEX IF NOT EXISTS idx_cache_status_page ON ${CONFIG.CACHE_TABLE}(status, page)`
    ];

    for (const sql of indexes) {
      await this.db.executeSql(sql);
    }
  }

  async savePublications(
    publications: PublicationModelResponse[],
    status: string,
    page: number,
    totalCount: number
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      log(
        `[DB] Saving ${publications.length} publications for status ${status}, page ${page}`
      );

      // Procesar imágenes
      const processedPublications = await Promise.all(
        publications.map(async pub => {
          let imgPath = null;
          let thumbnailPath = null;

          if (pub.img && pub.img.length > CONFIG.MAX_BASE64_SIZE) {
            try {
              const result = await imageOptimizationService.processImage(
                pub.recordId,
                pub.img
              );
              if (result) {
                imgPath = result.fullImagePath;
                thumbnailPath = result.thumbnailPath;
                log(`[DB] Processed image for publication ${pub.recordId}`);
              }
            } catch (err) {
              console.warn(
                `[DB] Failed to process image for ${pub.recordId}:`,
                err
              );
            }
          }

          return { ...pub, imgPath, thumbnailPath };
        })
      );

      return new Promise((resolve, reject) => {
        this.db!.transaction(
          tx => {
            for (
              let i = 0;
              i < processedPublications.length;
              i += CONFIG.BATCH_SIZE
            ) {
              const batch = processedPublications.slice(
                i,
                i + CONFIG.BATCH_SIZE
              );

              for (const pub of batch) {
                tx.executeSql(SQL.INSERT_PUBLICATION, [
                  pub.recordId,
                  pub.commonNoun || '',
                  pub.animalState || '',
                  pub.description || '',
                  pub.location || '',
                  pub.author || '',
                  pub.imgPath,
                  pub.thumbnailPath,
                  status
                ]);
              }
            }

            tx.executeSql(SQL.INSERT_CACHE, [status, page, totalCount]);
          },
          error => {
            console.error('[DB] Transaction failed:', error);
            reject(error);
          },
          () => {
            log('[DB] Transaction completed successfully');
            resolve();
          }
        );
      });
    } catch (error) {
      console.error('[DB] Error saving publications:', error);
      throw error;
    }
  }

  async loadPublications(
    status: string,
    limit: number,
    offset: number = 0
  ): Promise<PublicationModelResponse[]> {
    if (!this.db) throw new Error('Database not initialized');

    const publications: PublicationModelResponse[] = [];

    return new Promise((resolve, reject) => {
      this.db!.transaction(tx => {
        tx.executeSql(
          SQL.SELECT_PUBLICATIONS,
          [status, limit, offset],
          (_, results) => {
            for (let i = 0; i < results.rows.length; i++) {
              const row = results.rows.item(i);
              publications.push({
                recordId: row.recordId,
                commonNoun: row.commonNoun,
                animalState: row.animalState,
                description: row.description,
                img: row.img,
                location: row.location,
                author: row.author,
                imgPath: row.imgPath,
                thumbnailPath: row.thumbnailPath
              });
            }
            resolve(publications);
          },
          (_, error) => {
            console.error('[DB] SQL execution error:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getCacheMetadata(
    status: string
  ): Promise<{ page: number; totalCount: number; lastUpdated: string }[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise(resolve => {
      this.db!.transaction(tx => {
        tx.executeSql(
          SQL.SELECT_CACHE,
          [status],
          (_, results) => {
            const metadata: {
              page: number;
              totalCount: number;
              lastUpdated: string;
            }[] = [];

            for (let i = 0; i < results.rows.length; i++) {
              metadata.push(results.rows.item(i));
            }

            resolve(metadata);
          },
          (_, error) => {
            console.error('[DB] Error getting cache metadata:', error);
            resolve([]);
          }
        );
      });
    });
  }

  async clearCache(status?: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      if (status) {
        await this.db.executeSql(SQL.DELETE_PUBLICATIONS_BY_STATUS, [status]);
        await this.db.executeSql(SQL.DELETE_CACHE_BY_STATUS, [status]);
      } else {
        await this.db.executeSql(SQL.DELETE_ALL_PUBLICATIONS);
        await this.db.executeSql(SQL.DELETE_ALL_CACHE);
      }
      await imageOptimizationService.clearCache();
    } catch (error) {
      console.error('[DB] Error clearing cache:', error);
      throw error;
    }
  }

  async pruneExpiredCache(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const cutoff = Date.now() - CONFIG.CACHE_TTL;
      await this.db.executeSql(
        `DELETE FROM ${CONFIG.CACHE_TABLE} WHERE strftime('%s', lastUpdated) < ?`,
        [Math.floor(cutoff / 1000).toString()]
      );
      log('[DB] Pruned expired cache entries');
    } catch (error) {
      console.error('[DB] Error pruning expired cache:', error);
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.isInitialized = false;
      log('[DB] Database closed');
    }
  }
}

export const databaseService = new DatabaseService();
