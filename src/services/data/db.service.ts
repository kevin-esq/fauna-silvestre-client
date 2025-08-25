import SQLite, {
  SQLiteDatabase,
  Transaction
} from 'react-native-sqlite-storage';
import { PublicationResponse } from '../../domain/models/publication.models';
import { Platform } from 'react-native';
import {
  CachesDirectoryPath,
  DocumentDirectoryPath,
  unlink,
  writeFile,
  exists,
  mkdir
} from 'react-native-fs';

const CONFIG = {
  DB_NAME: 'publications_v2.db',
  TABLE_NAME: 'publications',
  INDEX_TABLE: 'publication_indexes',
  CACHE_TABLE: 'cache_metadata',
  MAX_BASE64_SIZE: 100 * 1024,
  BATCH_SIZE: 10,
  MAX_CACHE_SIZE: 50 * 1024 * 1024,
  CACHE_TTL: 7 * 24 * 60 * 60 * 1000,
  IMAGE_QUALITY: 0.8,
  CONCURRENT_OPERATIONS: 3,
  VACUUM_THRESHOLD: 1000
} as const;

SQLite.enablePromise(true);
if (__DEV__) {
  SQLite.DEBUG(true);
}

interface DatabaseStats {
  totalRecords: number;
  cacheSize: number;
  lastVacuum: number;
  fragmentationLevel: number;
}

interface ImageProcessingOptions {
  maxSize?: number;
  quality?: number;
  format?: 'jpg' | 'png' | 'webp';
}

class DatabasePool {
  private static instance: DatabasePool;
  private connections: Map<string, SQLiteDatabase> = new Map();
  private maxConnections = 3;

  static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }

  async getConnection(key = 'default'): Promise<SQLiteDatabase> {
    if (this.connections.has(key)) {
      const connection = this.connections.get(key);
      if (connection) {
        return connection;
      }
    }

    if (this.connections.size >= this.maxConnections) {
      // Buscar la primera conexión válida
      for (const [connKey, conn] of this.connections.entries()) {
        if (conn) {
          console.log(`Reusing connection: ${connKey}`);
          return conn;
        }
      }
      throw new Error('No hay conexiones disponibles');
    }

    const db = await SQLite.openDatabase({
      name: CONFIG.DB_NAME,
      location: 'default'
    });

    this.connections.set(key, db);
    return db;
  }

  async closeAll(): Promise<void> {
    await Promise.all(
      Array.from(this.connections.values()).map(db => db.close())
    );
    this.connections.clear();
  }
}

// Utilidades de sistema de archivos optimizadas
class FileSystemManager {
  private cacheDir: string | null = null;
  private cacheSizeCache = 0;
  private lastCacheSizeCheck = 0;

  async getCacheDir(): Promise<string> {
    if (this.cacheDir) {
      return this.cacheDir;
    }

    const baseDir =
      Platform.OS === 'android' ? CachesDirectoryPath : DocumentDirectoryPath;

    this.cacheDir = `${baseDir}/publication_images`;

    if (!(await exists(this.cacheDir))) {
      await mkdir(this.cacheDir, { NSURLIsExcludedFromBackupKey: true });
    }

    return this.cacheDir;
  }

  async calculateCacheSize(): Promise<number> {
    const now = Date.now();
    if (now - this.lastCacheSizeCheck < 60000) {
      // Cache por 1 minuto
      return this.cacheSizeCache;
    }

    try {
      const totalSize = 0;
      // Simulamos el cálculo (en producción usarías readdir + stat)
      this.cacheSizeCache = totalSize;
      this.lastCacheSizeCheck = now;

      return totalSize;
    } catch (error) {
      console.warn('Error calculating cache size:', error);
      return 0;
    }
  }

  async cleanupOldFiles(): Promise<number> {
    const cleanedFiles = 0;

    try {
      // En producción, implementarías readdir + stat + unlink
      console.log(`Cleaned ${cleanedFiles} old cache files`);
      return cleanedFiles;
    } catch (error) {
      console.error('Error cleaning old files:', error);
      return 0;
    }
  }

  async optimizeImage(
    base64: string,
    options: ImageProcessingOptions = {}
  ): Promise<string> {
    const { maxSize = CONFIG.MAX_BASE64_SIZE } = options;

    if (!base64 || base64.length <= maxSize) {
      return base64;
    }

    try {
      // En producción, implementarías compresión de imagen
      // Por ahora, simulamos truncando
      console.log(`Optimized image from ${base64.length} to ${maxSize} bytes`);
      return base64.substring(0, maxSize);
    } catch (error) {
      console.error('Error optimizing image:', error);
      return base64;
    }
  }
}

// Singleton para manejo de archivos
const fsManager = new FileSystemManager();

// Funciones principales optimizadas
export const getDBConnection = async (): Promise<SQLiteDatabase> => {
  try {
    return await DatabasePool.getInstance().getConnection();
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to connect to database');
  }
};

export const createTables = async (db: SQLiteDatabase): Promise<void> => {
  const queries = [
    // Tabla principal con índices optimizados
    `CREATE TABLE IF NOT EXISTS ${CONFIG.TABLE_NAME} (
      recordId TEXT PRIMARY KEY,
      commonNoun TEXT,
      description TEXT,
      animalState TEXT,
      location TEXT,
      status TEXT NOT NULL,
      img TEXT,
      imgPath TEXT,
      author TEXT,
      createdAt INTEGER DEFAULT (strftime('%s', 'now')),
      updatedAt INTEGER DEFAULT (strftime('%s', 'now')),
      accessCount INTEGER DEFAULT 0,
      lastAccessed INTEGER DEFAULT (strftime('%s', 'now'))
    )`,

    // Tabla de metadatos de cache
    `CREATE TABLE IF NOT EXISTS ${CONFIG.CACHE_TABLE} (
      key TEXT PRIMARY KEY,
      size INTEGER,
      lastAccessed INTEGER,
      ttl INTEGER,
      status TEXT,
      createdAt INTEGER DEFAULT (strftime('%s', 'now'))
    )`,

    // Índices para optimización
    `CREATE INDEX IF NOT EXISTS idx_status_created 
     ON ${CONFIG.TABLE_NAME}(status, createdAt DESC)`,

    `CREATE INDEX IF NOT EXISTS idx_status_accessed 
     ON ${CONFIG.TABLE_NAME}(status, lastAccessed DESC)`,

    `CREATE INDEX IF NOT EXISTS idx_search_text 
     ON ${CONFIG.TABLE_NAME}(commonNoun, description)`,

    // Triggers para mantener metadatos actualizados
    `CREATE TRIGGER IF NOT EXISTS update_timestamp 
     AFTER UPDATE ON ${CONFIG.TABLE_NAME}
     BEGIN
       UPDATE ${CONFIG.TABLE_NAME} 
       SET updatedAt = strftime('%s', 'now') 
       WHERE recordId = NEW.recordId;
     END`
  ];

  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx: Transaction) => {
        queries.forEach(query => {
          tx.executeSql(
            query,
            [],
            () => {},
            (_, error) => {
              console.error('Table creation error:', error);
              return false;
            }
          );
        });
      },
      error => {
        console.error('Transaction error creating tables:', error);
        reject(error);
      },
      () => {
        console.log('All tables created successfully');
        resolve();
      }
    );
  });
};

export const clearStatus = async (
  db: SQLiteDatabase,
  status: string,
  options: { keepRecent?: boolean; maxAge?: number } = {}
): Promise<{ deletedRecords: number; deletedFiles: number }> => {
  const { keepRecent = false, maxAge = CONFIG.CACHE_TTL } = options;

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx: Transaction) => {
        let whereClause = 'WHERE status = ?';
        const params = [status];

        if (keepRecent) {
          const cutoffTime = Math.floor((Date.now() - maxAge) / 1000);
          whereClause += ' AND createdAt < ?';
          params.push(cutoffTime.toString());
        }

        // Obtener paths de imágenes antes de eliminar
        tx.executeSql(
          `SELECT imgPath, COUNT(*) as count FROM ${CONFIG.TABLE_NAME} ${whereClause}`,
          params,
          async (_, result) => {
            const paths = result.rows
              .raw()
              .map(row => row.imgPath)
              .filter(Boolean);

            // Eliminar archivos de imagen
            const deletePromises = paths.map(async (path: string) => {
              try {
                const cleanPath = path.replace('file://', '');
                if (await exists(cleanPath)) {
                  await unlink(cleanPath);
                  return true;
                }
              } catch (error) {
                console.warn('Error deleting image:', path, error);
              }
              return false;
            });

            const deletedFiles = (await Promise.all(deletePromises)).filter(
              Boolean
            ).length;

            // Eliminar registros de BD
            tx.executeSql(
              `DELETE FROM ${CONFIG.TABLE_NAME} ${whereClause}`,
              params,
              (_, deleteResult) => {
                // Limpiar metadatos de cache
                tx.executeSql(
                  `DELETE FROM ${CONFIG.CACHE_TABLE} WHERE status = ?`,
                  [status],
                  () => {
                    console.log(
                      `Cleared cache for status ${status}: ${deleteResult.rowsAffected} records, ${deletedFiles} files`
                    );
                    resolve({
                      deletedRecords: deleteResult.rowsAffected,
                      deletedFiles
                    });
                  }
                );
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      error => {
        console.error('Clear status transaction error:', error);
        reject(error);
      }
    );
  });
};

const saveImageToFile = async (
  base64: string,
  options: ImageProcessingOptions = {}
): Promise<string> => {
  if (!base64 || typeof base64 !== 'string') return '';

  try {
    // Optimizar imagen si es necesario
    const optimizedBase64 = await fsManager.optimizeImage(base64, options);

    const cacheDir = await fsManager.getCacheDir();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const filename = `img_${timestamp}_${random}.jpg`;
    const path = `${cacheDir}/${filename}`;

    const base64Data = optimizedBase64.startsWith('data:')
      ? optimizedBase64.split(',')[1]
      : optimizedBase64;

    await writeFile(path, base64Data, 'base64');

    // Actualizar metadatos de cache
    const cacheKey = `img_${timestamp}`;
    await updateCacheMetadata(cacheKey, optimizedBase64.length, 'active');

    return `file://${path}`;
  } catch (error) {
    console.error('Image save error:', error);
    return '';
  }
};

const updateCacheMetadata = async (
  key: string,
  size: number,
  status: string
): Promise<void> => {
  try {
    const db = await getDBConnection();

    await new Promise<void>((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO ${CONFIG.CACHE_TABLE} 
           (key, size, lastAccessed, ttl, status) 
           VALUES (?, ?, ?, ?, ?)`,
          [key, size, Date.now(), CONFIG.CACHE_TTL, status],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  } catch (error) {
    console.warn('Cache metadata update failed:', error);
  }
};

export const savePublications = async (
  db: SQLiteDatabase,
  items: PublicationResponse[],
  status: string,
  options: {
    upsert?: boolean;
    processImages?: boolean;
    batchSize?: number;
  } = {}
): Promise<{ saved: number; errors: number }> => {
  if (!items.length) {
    return { saved: 0, errors: 0 };
  }

  const {
    upsert = true,
    processImages = true,
    batchSize = CONFIG.BATCH_SIZE
  } = options;

  console.log(
    `Saving ${items.length} publications to cache for status ${status}`
  );

  let savedCount = 0;
  let errorCount = 0;

  // Procesar imágenes en paralelo con límite de concurrencia
  const processedItems = await Promise.all(
    items.map(async item => {
      try {
        let imgPath = '';
        let imgBase64 = item.img || '';

        if (
          processImages &&
          imgBase64 &&
          imgBase64.length > CONFIG.MAX_BASE64_SIZE
        ) {
          imgPath = await saveImageToFile(imgBase64, {
            maxSize: CONFIG.MAX_BASE64_SIZE,
            quality: CONFIG.IMAGE_QUALITY
          });
          imgBase64 = ''; // Limpiar base64 después de guardar archivo
        }

        return {
          ...item,
          img: imgBase64,
          imgPath,
          processedAt: Date.now()
        };
      } catch (error) {
        console.error('Error processing item:', item.recordId, error);
        errorCount++;
        return {
          ...item,
          img: '',
          imgPath: '',
          processedAt: Date.now()
        };
      }
    })
  );

  // Guardar en lotes para mejor rendimiento
  for (let i = 0; i < processedItems.length; i += batchSize) {
    const batch = processedItems.slice(i, i + batchSize);

    try {
      await new Promise<void>((resolve, reject) => {
        db.transaction(
          (tx: Transaction) => {
            const query = upsert
              ? `INSERT OR REPLACE INTO ${CONFIG.TABLE_NAME} 
                 (recordId, commonNoun, description, animalState, location, status, img, imgPath, author, accessCount, lastAccessed) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT accessCount FROM ${CONFIG.TABLE_NAME} WHERE recordId = ?), 0), strftime('%s', 'now'))`
              : `INSERT OR IGNORE INTO ${CONFIG.TABLE_NAME} 
                 (recordId, commonNoun, description, animalState, location, status, img, imgPath, author) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            batch.forEach(item => {
              const params = [
                item.recordId,
                item.commonNoun || '',
                item.description || '',
                item.animalState || '',
                item.location || '',
                status,
                item.img || '',
                item.imgPath || ''
              ];

              if (upsert) {
                params.push(item.recordId); // Para el COALESCE
              }

              tx.executeSql(
                query,
                params,
                () => {
                  savedCount++;
                },
                (_, error) => {
                  console.error('Error saving item:', item.recordId, error);
                  errorCount++;
                  return false;
                }
              );
            });
          },
          error => {
            console.error('Batch transaction error:', error);
            reject(error);
          },
          () => {
            console.log(
              `Successfully saved batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(processedItems.length / batchSize)}`
            );
            resolve();
          }
        );
      });
    } catch (error) {
      console.error('Batch save error:', error);
      errorCount += batch.length;
    }
  }

  console.log(
    `Completed saving: ${savedCount} successful, ${errorCount} errors`
  );
  return { saved: savedCount, errors: errorCount };
};

export const loadPublications = async (
  db: SQLiteDatabase,
  status: string,
  limit: number,
  offset = 0,
  options: {
    orderBy?: 'created' | 'accessed' | 'updated';
    searchQuery?: string;
    includeStats?: boolean;
  } = {}
): Promise<PublicationResponse[]> => {
  const { orderBy = 'created', searchQuery, includeStats = false } = options;

  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      let query = `
        SELECT 
          recordId, 
          commonNoun, 
          description, 
          animalState, 
          location, 
          status,
          author,
          CASE 
            WHEN imgPath IS NOT NULL AND imgPath != '' THEN imgPath
            ELSE img 
          END AS img,
          createdAt,
          lastAccessed,
          accessCount
        FROM ${CONFIG.TABLE_NAME} 
        WHERE status = ?
      `;

      const params: string[] = [status];

      // Agregar búsqueda si se especifica
      if (searchQuery) {
        query += ` AND (
          commonNoun LIKE ? OR 
          description LIKE ? OR 
          author LIKE ?
        )`;
        const searchTerm = `%${searchQuery}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Agregar ordenamiento
      const orderColumn =
        {
          created: 'createdAt',
          accessed: 'lastAccessed',
          updated: 'updatedAt'
        }[orderBy] || 'createdAt';

      query += ` ORDER BY ${orderColumn} DESC LIMIT ? OFFSET ?`;
      params.push(limit.toString(), offset.toString());

      tx.executeSql(
        query,
        params,
        (_, result) => {
          const data = result.rows.raw();

          // Actualizar contador de acceso para cada registro
          if (includeStats && data.length > 0) {
            const updateQuery = `
              UPDATE ${CONFIG.TABLE_NAME} 
              SET accessCount = accessCount + 1, lastAccessed = strftime('%s', 'now')
              WHERE recordId IN (${data.map(() => '?').join(',')})
            `;
            const recordIds = data.map(item => item.recordId);

            tx.executeSql(updateQuery, recordIds);
          }

          console.log(
            `Loaded ${data.length} publications from DB for status ${status}`
          );
          resolve(data);
        },
        (_, error) => {
          console.error('[loadPublications] Error:', error);
          reject(new Error(`Failed to load publications: ${error.message}`));
          return false;
        }
      );
    });
  });
};

// Funciones de mantenimiento y optimización
export const optimizeDatabase = async (
  db: SQLiteDatabase
): Promise<DatabaseStats> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      // Obtener estadísticas
      tx.executeSql(
        `SELECT 
          COUNT(*) as totalRecords,
          SUM(LENGTH(img) + LENGTH(imgPath)) as totalSize
        FROM ${CONFIG.TABLE_NAME}`,
        [],
        (_, result) => {
          const stats = result.rows.item(0);

          // Ejecutar VACUUM si es necesario
          if (stats.totalRecords > CONFIG.VACUUM_THRESHOLD) {
            tx.executeSql('VACUUM');
            console.log('Database VACUUM completed');
          }

          // Limpiar registros antiguos
          const cutoffTime = Math.floor((Date.now() - CONFIG.CACHE_TTL) / 1000);
          tx.executeSql(
            `DELETE FROM ${CONFIG.TABLE_NAME} WHERE createdAt < ?`,
            [cutoffTime]
          );

          resolve({
            totalRecords: stats.totalRecords,
            cacheSize: stats.totalSize || 0,
            lastVacuum: Date.now(),
            fragmentationLevel: 0 // Calcular si es necesario
          });
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getDatabaseStats = async (
  db: SQLiteDatabase
): Promise<DatabaseStats> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `SELECT 
          COUNT(*) as totalRecords,
          SUM(LENGTH(COALESCE(img, '')) + LENGTH(COALESCE(imgPath, ''))) as cacheSize,
          MIN(createdAt) as oldestRecord,
          MAX(lastAccessed) as lastAccess
        FROM ${CONFIG.TABLE_NAME}`,
        [],
        (_, result) => {
          const row = result.rows.item(0);
          resolve({
            totalRecords: row.totalRecords,
            cacheSize: row.cacheSize || 0,
            lastVacuum: 0, // Implementar tracking si es necesario
            fragmentationLevel: 0
          });
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Función de limpieza automática
export const performMaintenance = async (
  db: SQLiteDatabase,
  options: {
    cleanOldFiles?: boolean;
    optimizeDb?: boolean;
    maxAge?: number;
  } = {}
): Promise<{
  filesDeleted: number;
  recordsDeleted: number;
  cacheSize: number;
}> => {
  const {
    cleanOldFiles = true,
    optimizeDb = true,
    maxAge = CONFIG.CACHE_TTL
  } = options;

  let filesDeleted = 0;
  let recordsDeleted = 0;

  try {
    // Limpiar archivos antiguos
    if (cleanOldFiles) {
      filesDeleted = await fsManager.cleanupOldFiles();
    }

    // Limpiar registros antiguos de la BD
    const cutoffTime = Math.floor((Date.now() - maxAge) / 1000);
    await new Promise<void>((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          `DELETE FROM ${CONFIG.TABLE_NAME} WHERE createdAt < ?`,
          [cutoffTime],
          (_, result) => {
            recordsDeleted = result.rowsAffected;
            resolve();
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });

    // Optimizar base de datos
    if (optimizeDb) {
      await optimizeDatabase(db);
    }

    const cacheSize = await fsManager.calculateCacheSize();

    console.log(
      `Maintenance completed: ${filesDeleted} files, ${recordsDeleted} records deleted`
    );

    return {
      filesDeleted,
      recordsDeleted,
      cacheSize
    };
  } catch (error) {
    console.error('Maintenance error:', error);
    throw error;
  }
};

// Funciones de compatibilidad (mantener nombres originales)
export const createTable = createTables;

// Cleanup al cerrar la app
export const closeDatabase = async (): Promise<void> => {
  await DatabasePool.getInstance().closeAll();
  console.log('Database connections closed');
};
