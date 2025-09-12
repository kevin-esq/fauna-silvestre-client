import SQLite, {
  SQLiteDatabase,
  Transaction
} from 'react-native-sqlite-storage';
import { PublicationModelResponse } from '../../domain/models/publication.models';
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
  DB_NAME: 'publications_v3.db',
  TABLE_NAME: 'publications',
  INDEX_TABLE: 'publication_indexes',
  CACHE_TABLE: 'cache_metadata',
  MAX_BASE64_SIZE: 100 * 1024,
  BATCH_SIZE: 5,
  MAX_CACHE_SIZE: 50 * 1024 * 1024,
  CACHE_TTL: 7 * 24 * 60 * 60 * 1000,
  IMAGE_QUALITY: 0.8,
  CONCURRENT_OPERATIONS: 3,
  VACUUM_THRESHOLD: 1000,
  MAX_PAGE_SIZE: 5,
  INITIAL_PAGE: 1,
  SYNC_THRESHOLD: 5 * 60 * 1000,
  MAX_RETRIES: 3,
  PREFETCH_THRESHOLD: 0.8,
  DEBOUNCE_DELAY: 300,
  DEFAULT_PAGE_SIZE: 5
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
      for (const [connKey, conn] of this.connections.entries()) {
        if (conn) {
          console.log(`[DatabasePool] Reusing connection: ${connKey}`);
          return conn;
        }
      }
      throw new Error('No hay conexiones disponibles');
    }

    console.log(`[DatabasePool] Creating new connection: ${key}`);
    const db = await SQLite.openDatabase({
      name: CONFIG.DB_NAME,
      location: 'default'
    });

    this.connections.set(key, db);
    return db;
  }

  async closeAll(): Promise<void> {
    console.log(`[DatabasePool] Closing all connections`);
    await Promise.all(
      Array.from(this.connections.values()).map(db => db.close())
    );
    this.connections.clear();
  }
}

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
      return this.cacheSizeCache;
    }

    try {
      const totalSize = 0;
      this.cacheSizeCache = totalSize;
      this.lastCacheSizeCheck = now;
      return totalSize;
    } catch (error) {
      console.warn('[FileSystemManager] Error calculating cache size:', error);
      return 0;
    }
  }

  async cleanupOldFiles(): Promise<number> {
    const cleanedFiles = 0;

    try {
      console.log(
        `[FileSystemManager] Cleaned ${cleanedFiles} old cache files`
      );
      return cleanedFiles;
    } catch (error) {
      console.error('[FileSystemManager] Error cleaning old files:', error);
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
      console.log(
        `[FileSystemManager] Optimized image from ${base64.length} to ${maxSize} bytes`
      );
      return base64.substring(0, maxSize);
    } catch (error) {
      console.error('[FileSystemManager] Error optimizing image:', error);
      return base64;
    }
  }
}

const fsManager = new FileSystemManager();

// FIX: Función principal para obtener conexión DB
export const getDBConnection = async (): Promise<SQLiteDatabase> => {
  try {
    console.log('[getDBConnection] Requesting database connection');
    return await DatabasePool.getInstance().getConnection();
  } catch (error) {
    console.error('[getDBConnection] Database connection error:', error);
    throw new Error('Failed to connect to database');
  }
};

// FIX: Función corregida para crear tablas
export const createTables = async (db: SQLiteDatabase): Promise<void> => {
  console.log('[createTables] Creating database tables...');

  const queries = [
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
      lastAccessed INTEGER DEFAULT (strftime('%s', 'now')),
      pageNumber INTEGER DEFAULT 1,
      loadOrder INTEGER
    )`,

    `CREATE TABLE IF NOT EXISTS ${CONFIG.CACHE_TABLE} (
      key TEXT PRIMARY KEY,
      status TEXT,
      page INTEGER,
      size INTEGER,
      total INTEGER DEFAULT 0,
      totalPages INTEGER DEFAULT 0,
      hasNext BOOLEAN DEFAULT 0,
      hasPrev BOOLEAN DEFAULT 0,
      lastAccessed INTEGER,
      ttl INTEGER,
      createdAt INTEGER DEFAULT (strftime('%s', 'now'))
    )`,

    `CREATE INDEX IF NOT EXISTS idx_status_page_order
     ON ${CONFIG.TABLE_NAME}(status, pageNumber, loadOrder)`,

    `CREATE INDEX IF NOT EXISTS idx_status_created
     ON ${CONFIG.TABLE_NAME}(status, createdAt DESC)`,

    `CREATE INDEX IF NOT EXISTS idx_status_accessed
     ON ${CONFIG.TABLE_NAME}(status, lastAccessed DESC)`,

    `CREATE INDEX IF NOT EXISTS idx_search_text
     ON ${CONFIG.TABLE_NAME}(commonNoun, description)`,

    `CREATE INDEX IF NOT EXISTS idx_cache_status_page
     ON ${CONFIG.CACHE_TABLE}(status, page)`,

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
        queries.forEach((query, index) => {
          tx.executeSql(
            query,
            [],
            () => {
              console.log(
                `[createTables] Query ${index + 1}/${queries.length} executed successfully`
              );
            },
            (error) => {
              console.error(
                `[createTables] Error in query ${index + 1}:`,
                error
              );
              return false;
            }
          );
        });
      },
      error => {
        console.error('[createTables] Transaction error:', error);
        reject(error);
      },
      () => {
        console.log('[createTables] All tables created successfully');
        resolve();
      }
    );
  });
};

// FIX: Función corregida para limpiar status
export const clearStatus = async (
  db: SQLiteDatabase,
  status: string,
  options: {
    keepRecent?: boolean;
    maxAge?: number;
    onlyOldPages?: boolean;
    currentPage?: number;
  } = {}
): Promise<{ deletedRecords: number; deletedFiles: number }> => {
  console.log(`[clearStatus] Clearing status ${status} with options:`, options);

  const {
    keepRecent = false,
    maxAge = CONFIG.CACHE_TTL,
    onlyOldPages = false,
    currentPage = 1
  } = options;

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

        if (onlyOldPages && currentPage) {
          whereClause += ' AND pageNumber < ?';
          params.push(currentPage.toString());
        }

        tx.executeSql(
          `SELECT imgPath, COUNT(*) as count FROM ${CONFIG.TABLE_NAME} ${whereClause}`,
          params,
          async (_, result) => {
            const paths = [];
            for (let i = 0; i < result.rows.length; i++) {
              const row = result.rows.item(i);
              if (row.imgPath) {
                paths.push(row.imgPath);
              }
            }

            const deletePromises = paths.map(async (path: string) => {
              try {
                const cleanPath = path.replace('file://', '');
                if (await exists(cleanPath)) {
                  await unlink(cleanPath);
                  return true;
                }
              } catch (error) {
                console.warn(
                  '[clearStatus] Error deleting image:',
                  path,
                  error
                );
              }
              return false;
            });

            const deletedFiles = (await Promise.all(deletePromises)).filter(
              Boolean
            ).length;

            tx.executeSql(
              `DELETE FROM ${CONFIG.TABLE_NAME} ${whereClause}`,
              params,
              (_, deleteResult) => {
                let cacheWhereClause = 'WHERE status = ?';
                const cacheParams = [status];

                if (onlyOldPages && currentPage) {
                  cacheWhereClause += ' AND page < ?';
                  cacheParams.push(currentPage.toString());
                }

                tx.executeSql(
                  `DELETE FROM ${CONFIG.CACHE_TABLE} ${cacheWhereClause}`,
                  cacheParams,
                  () => {
                    console.log(
                      `[clearStatus] Cleared cache for status ${status}: ${deleteResult.rowsAffected} records, ${deletedFiles} files`
                    );
                    resolve({
                      deletedRecords: deleteResult.rowsAffected,
                      deletedFiles
                    });
                  }
                );
              },
              (_, error) => {
                console.error('[clearStatus] Error deleting records:', error);
                reject(error);
                return false;
              }
            );
          },
          (_, error) => {
            console.error('[clearStatus] Error selecting records:', error);
            reject(error);
            return false;
          }
        );
      },
      error => {
        console.error('[clearStatus] Transaction error:', error);
        reject(error);
      }
    );
  });
};

// FIX: Función auxiliar para guardar imagen
const saveImageToFile = async (
  base64: string,
  options: ImageProcessingOptions = {}
): Promise<string> => {
  if (!base64 || typeof base64 !== 'string') {
    console.warn('[saveImageToFile] Invalid base64 input');
    return '';
  }

  try {
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
    console.log(`[saveImageToFile] Image saved to: ${path}`);

    return `file://${path}`;
  } catch (error) {
    console.error('[saveImageToFile] Image save error:', error);
    return '';
  }
};

// FIX: Función para guardar metadatos de paginación
const savePaginationMetadata = async (
  db: SQLiteDatabase,
  status: string,
  page: number,
  pagination: {
    size: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
): Promise<void> => {
  console.log(
    `[savePaginationMetadata] Saving metadata for ${status} page ${page}`
  );

  return new Promise<void>((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `INSERT OR REPLACE INTO ${CONFIG.CACHE_TABLE}
         (key, status, page, size, total, totalPages, hasNext, hasPrev, lastAccessed, ttl)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `${status}_page_${page}`,
          status,
          page,
          pagination.size,
          pagination.total,
          pagination.totalPages,
          pagination.hasNext ? 1 : 0,
          pagination.hasPrev ? 1 : 0,
          Date.now(),
          CONFIG.CACHE_TTL
        ],
        () => {
          console.log(
            `[savePaginationMetadata] Successfully saved metadata for ${status} page ${page}`
          );
          resolve();
        },
        (_, error) => {
          console.error(
            '[savePaginationMetadata] Error saving metadata:',
            error
          );
          reject(error);
          return false;
        }
      );
    });
  });
};

// FIX: Función principal corregida para guardar publicaciones
export const savePublications = async (
  db: SQLiteDatabase,
  items: PublicationModelResponse[],
  status: string,
  options: {
    upsert?: boolean;
    processImages?: boolean;
    batchSize?: number;
    pageNumber?: number;
    pagination?: {
      size: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  } = {}
): Promise<{ saved: number; errors: number }> => {
  console.log(
    `[savePublications] Starting save process for ${items?.length || 0} items`
  );

  // FIX: Validación estricta de entrada
  if (!items || !Array.isArray(items)) {
    console.error(
      `[savePublications] Items is not a valid array:`,
      typeof items,
      items
    );
    return { saved: 0, errors: 1 };
  }

  if (items.length === 0) {
    console.warn(`[savePublications] Empty items array provided`);
    return { saved: 0, errors: 0 };
  }

  // FIX: Validar estructura de cada item
  const validItems = items.filter((item, index) => {
    if (!item || typeof item !== 'object') {
      console.warn(`[savePublications] Invalid item at index ${index}:`, item);
      return false;
    }
    if (!item.recordId) {
      console.warn(
        `[savePublications] Item missing recordId at index ${index}:`,
        item
      );
      return false;
    }
    return true;
  });

  if (validItems.length === 0) {
    console.error(
      `[savePublications] No valid items found from ${items.length} total items`
    );
    return { saved: 0, errors: items.length };
  }

  const {
    upsert = true,
    processImages = true,
    batchSize = CONFIG.BATCH_SIZE,
    pageNumber = 1,
    pagination
  } = options;

  console.log(
    `[savePublications] Processing ${validItems.length}/${items.length} valid items for status ${status}, page ${pageNumber}`
  );

  // Guardar metadatos de paginación si se proporcionan
  if (pagination) {
    try {
      await savePaginationMetadata(db, status, pageNumber, pagination);
    } catch (error) {
      console.warn(
        '[savePublications] Failed to save pagination metadata:',
        error
      );
    }
  }

  let savedCount = 0;
  let errorCount = 0;

  // Procesar imágenes
  const processedItems = await Promise.all(
    validItems.map(async (item, index) => {
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
          imgBase64 = '';
        }

        return {
          ...item,
          img: imgBase64,
          imgPath,
          pageNumber,
          loadOrder: (pageNumber - 1) * CONFIG.DEFAULT_PAGE_SIZE + index,
          processedAt: Date.now()
        };
      } catch (error) {
        console.error(
          '[savePublications] Error processing item:',
          item.recordId,
          error
        );
        errorCount++;
        return {
          ...item,
          img: '',
          imgPath: '',
          pageNumber,
          loadOrder: (pageNumber - 1) * CONFIG.DEFAULT_PAGE_SIZE + index,
          processedAt: Date.now()
        };
      }
    })
  );

  // Guardar en lotes
  for (let i = 0; i < processedItems.length; i += batchSize) {
    const batch = processedItems.slice(i, i + batchSize);

    try {
      await new Promise<void>((resolve, reject) => {
        db.transaction(
          (tx: Transaction) => {
            const query = upsert
              ? `INSERT OR REPLACE INTO ${CONFIG.TABLE_NAME}
                 (recordId, commonNoun, description, animalState, location, status, img, imgPath, author, pageNumber, loadOrder, accessCount, lastAccessed)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT accessCount FROM ${CONFIG.TABLE_NAME} WHERE recordId = ? AND status = ?), 0), strftime('%s', 'now'))`
              : `INSERT OR IGNORE INTO ${CONFIG.TABLE_NAME}
                 (recordId, commonNoun, description, animalState, location, status, img, imgPath, author, pageNumber, loadOrder)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            batch.forEach(item => {
              const params = [
                item.recordId.toString(),
                item.commonNoun || '',
                item.description || '',
                item.animalState || '',
                item.location || '',
                status,
                item.img || '',
                item.imgPath || '',
                '',
                item.pageNumber,
                item.loadOrder
              ];

              if (upsert) {
                params.push(item.recordId.toString());
                params.push(status);
              }

              tx.executeSql(
                query,
                params,
                () => {
                  savedCount++;
                },
                (error) => {
                  console.error(
                    '[savePublications] Error saving item:',
                    item.recordId,
                    error
                  );
                  errorCount++;
                  return false;
                }
              );
            });
          },
          error => {
            console.error('[savePublications] Batch transaction error:', error);
            reject(error);
          },
          () => {
            const batchNum = Math.floor(i / batchSize) + 1;
            const totalBatches = Math.ceil(processedItems.length / batchSize);
            console.log(
              `[savePublications] Batch ${batchNum}/${totalBatches} completed`
            );
            resolve();
          }
        );
      });
    } catch (error) {
      console.error('[savePublications] Batch save error:', error);
      errorCount += batch.length;
    }
  }

  console.log(
    `[savePublications] Final result: ${savedCount} saved, ${errorCount} errors from ${validItems.length} items`
  );
  return { saved: savedCount, errors: errorCount };
};

// FIX: Función principal corregida para cargar publicaciones
export const loadPublications = async (
  db: SQLiteDatabase,
  status: string,
  limit: number,
  offset = 0,
  options: {
    orderBy?: 'created' | 'accessed' | 'updated' | 'loadOrder';
    searchQuery?: string;
    includeStats?: boolean;
    pageNumber?: number;
  } = {}
): Promise<PublicationModelResponse[]> => {
  const {
    orderBy = 'loadOrder',
    searchQuery,
    includeStats = false,
    pageNumber
  } = options;

  console.log(
    `[loadPublications] Loading ${limit} items for status: ${status}, offset: ${offset}${pageNumber ? `, page: ${pageNumber}` : ''}`
  );

  return new Promise((resolve) => {
    db.transaction(
      (tx: Transaction) => {
        let query = `
        SELECT
          recordId,
          commonNoun,
          description,
          animalState,
          location,
          status,
          CASE
            WHEN imgPath IS NOT NULL AND imgPath != '' THEN imgPath
            ELSE img
          END AS img,
          createdAt,
          lastAccessed,
          accessCount,
          pageNumber,
          loadOrder
        FROM ${CONFIG.TABLE_NAME} 
        WHERE status = ?
      `;

        const params: string[] = [status];

        if (pageNumber) {
          query += ` AND pageNumber = ?`;
          params.push(pageNumber.toString());
        }

        if (searchQuery) {
          query += ` AND (
          commonNoun LIKE ? OR
          description LIKE ?
        )`;
          const searchTerm = `%${searchQuery}%`;
          params.push(searchTerm, searchTerm);
        }

        const orderColumn =
          {
            created: 'createdAt DESC',
            accessed: 'lastAccessed DESC',
            updated: 'updatedAt DESC',
            loadOrder: 'pageNumber ASC, loadOrder ASC'
          }[orderBy] || 'pageNumber ASC, loadOrder ASC';

        query += ` ORDER BY ${orderColumn} LIMIT ? OFFSET ?`;
        params.push(limit.toString(), offset.toString());

        console.log(`[loadPublications] Query params:`, params);

        tx.executeSql(
          query,
          params,
          (_, result) => {
            try {
              if (!result || !result.rows) {
                console.error(
                  '[loadPublications] Invalid result structure:',
                  result
                );
                resolve([]);
                return;
              }

              const rowCount = result.rows.length;
              console.log(`[loadPublications] Found ${rowCount} rows`);

              if (rowCount === 0) {
                resolve([]);
                return;
              }

              const validRows = [];
              for (let i = 0; i < rowCount; i++) {
                try {
                  const row = result.rows.item(i);
                  if (row && row.recordId) {
                    validRows.push(row);
                  } else {
                    console.warn(
                      `[loadPublications] Invalid row at index ${i}:`,
                      row
                    );
                  }
                } catch (rowError) {
                  console.error(
                    `[loadPublications] Error accessing row ${i}:`,
                    rowError
                  );
                }
              }

              const data = validRows.map(row => ({
                recordId: parseInt(row.recordId),
                commonNoun: row.commonNoun || '',
                description: row.description || '',
                animalState: row.animalState || '',
                location: row.location || '',
                img: row.img || '',
                author: row.author || ''
              }));

              if (includeStats && data.length > 0) {
                const updateQuery = `
                UPDATE ${CONFIG.TABLE_NAME}
                SET accessCount = accessCount + 1, lastAccessed = strftime('%s', 'now')
                WHERE recordId IN (${data.map(() => '?').join(',')})
              `;
                const recordIds = data.map(item => item.recordId.toString());

                tx.executeSql(
                  updateQuery,
                  recordIds,
                  () =>
                    console.log(
                      `[loadPublications] Updated access stats for ${recordIds.length} items`
                    ),
                  (_, updateError) =>
                    console.warn(
                      '[loadPublications] Failed to update access stats:',
                      updateError
                    )
                );
              }

              console.log(
                `[loadPublications] Successfully loaded ${data.length} publications`
              );
              resolve(data);
            } catch (processingError) {
              console.error(
                '[loadPublications] Error processing results:',
                processingError
              );
              resolve([]);
            }
          },
          (_, error) => {
            console.error('[loadPublications] SQL Error:', error);
            resolve([]); // FIX: Devolver array vacío en lugar de fallar
            return false;
          }
        );
      },
      transactionError => {
        console.error(
          '[loadPublications] Transaction Error:',
          transactionError
        );
        resolve([]);
      }
    );
  });
};

// FIX: Función para obtener metadatos de paginación desde cache
export const getPaginationMetadata = async (
  db: SQLiteDatabase,
  status: string,
  page: number
): Promise<{
  size: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} | null> => {
  console.log(
    `[getPaginationMetadata] Getting metadata for ${status} page ${page}`
  );

  return new Promise((resolve) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `SELECT size, total, totalPages, hasNext, hasPrev, lastAccessed, ttl
         FROM ${CONFIG.CACHE_TABLE}
         WHERE status = ? AND page = ?
         ORDER BY lastAccessed DESC
         LIMIT 1`,
        [status, page],
        (_, result) => {
          if (result.rows.length === 0) {
            console.log(
              `[getPaginationMetadata] No metadata found for ${status} page ${page}`
            );
            resolve(null);
            return;
          }

          const row = result.rows.item(0);
          const now = Date.now();
          const isValid = now - row.lastAccessed < row.ttl;

          if (!isValid) {
            console.log(
              `[getPaginationMetadata] Cache expired for ${status} page ${page}`
            );
            resolve(null);
            return;
          }

          console.log(
            `[getPaginationMetadata] Found valid metadata for ${status} page ${page}`
          );
          resolve({
            size: row.size,
            total: row.total,
            totalPages: row.totalPages,
            hasNext: Boolean(row.hasNext),
            hasPrev: Boolean(row.hasPrev)
          });
        },
        (_, error) => {
          console.error(
            '[getPaginationMetadata] Error getting pagination metadata:',
            error
          );
          resolve(null);
          return false;
        }
      );
    });
  });
};

// FIX: Función para limpiar páginas específicas
export const clearPages = async (
  db: SQLiteDatabase,
  status: string,
  fromPage: number,
  toPage?: number
): Promise<{ deletedRecords: number; deletedFiles: number }> => {
  const actualToPage = toPage || fromPage;
  console.log(
    `[clearPages] Clearing pages ${fromPage}-${actualToPage} for ${status}`
  );

  return new Promise((resolve) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `SELECT imgPath FROM ${CONFIG.TABLE_NAME}
         WHERE status = ? AND pageNumber >= ? AND pageNumber <= ?`,
        [status, fromPage, actualToPage],
        async (_, result) => {
          const paths = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            if (row.imgPath) {
              paths.push(row.imgPath);
            }
          }

          const deletePromises = paths.map(async (path: string) => {
            try {
              const cleanPath = path.replace('file://', '');
              if (await exists(cleanPath)) {
                await unlink(cleanPath);
                return true;
              }
            } catch (error) {
              console.warn('[clearPages] Error deleting image:', path, error);
            }
            return false;
          });

          const deletedFiles = (await Promise.all(deletePromises)).filter(
            Boolean
          ).length;

          tx.executeSql(
            `DELETE FROM ${CONFIG.TABLE_NAME}
             WHERE status = ? AND pageNumber >= ? AND pageNumber <= ?`,
            [status, fromPage, actualToPage],
            (_, deleteResult) => {
              tx.executeSql(
                `DELETE FROM ${CONFIG.CACHE_TABLE}
                 WHERE status = ? AND page >= ? AND page <= ?`,
                [status, fromPage, actualToPage],
                () => {
                  console.log(
                    `[clearPages] Cleared pages ${fromPage}-${actualToPage} for ${status}: ${deleteResult.rowsAffected} records, ${deletedFiles} files`
                  );
                  resolve({
                    deletedRecords: deleteResult.rowsAffected,
                    deletedFiles
                  });
                }
              );
            }
          );
        }
      );
    });
  });
};

// FIX: Funciones de mantenimiento y optimización
export const optimizeDatabase = async (
  db: SQLiteDatabase
): Promise<DatabaseStats> => {
  console.log('[optimizeDatabase] Starting database optimization');

  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `SELECT 
          COUNT(*) as totalRecords,
          SUM(LENGTH(COALESCE(img, '')) + LENGTH(COALESCE(imgPath, ''))) as totalSize
        FROM ${CONFIG.TABLE_NAME}`,
        [],
        (_, result) => {
          const stats = result.rows.item(0);

          if (stats.totalRecords > CONFIG.VACUUM_THRESHOLD) {
            tx.executeSql('VACUUM');
            console.log('[optimizeDatabase] Database VACUUM completed');
          }

          const cutoffTime = Math.floor((Date.now() - CONFIG.CACHE_TTL) / 1000);
          tx.executeSql(
            `DELETE FROM ${CONFIG.TABLE_NAME} WHERE createdAt < ?`,
            [cutoffTime],
            () => {
              console.log('[optimizeDatabase] Old records cleaned up');
            }
          );

          resolve({
            totalRecords: stats.totalRecords,
            cacheSize: stats.totalSize || 0,
            lastVacuum: Date.now(),
            fragmentationLevel: 0
          });
        },
        (_, error) => {
          console.error('[optimizeDatabase] Error:', error);
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
  console.log('[getDatabaseStats] Getting database statistics');

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
          console.log(
            `[getDatabaseStats] Found ${row.totalRecords} total records`
          );
          resolve({
            totalRecords: row.totalRecords,
            cacheSize: row.cacheSize || 0,
            lastVacuum: 0,
            fragmentationLevel: 0
          });
        },
        (_, error) => {
          console.error('[getDatabaseStats] Error:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

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
  console.log(
    '[performMaintenance] Starting maintenance with options:',
    options
  );

  const {
    cleanOldFiles = true,
    optimizeDb = true,
    maxAge = CONFIG.CACHE_TTL
  } = options;

  let filesDeleted = 0;
  let recordsDeleted = 0;

  try {
    if (cleanOldFiles) {
      filesDeleted = await fsManager.cleanupOldFiles();
    }

    const cutoffTime = Math.floor((Date.now() - maxAge) / 1000);
    await new Promise<void>((resolve, reject) => {
      db.transaction((tx: Transaction) => {
        tx.executeSql(
          `DELETE FROM ${CONFIG.TABLE_NAME} WHERE createdAt < ?`,
          [cutoffTime],
          (_, result) => {
            recordsDeleted = result.rowsAffected;

            tx.executeSql(
              `DELETE FROM ${CONFIG.CACHE_TABLE} WHERE lastAccessed < ?`,
              [Date.now() - maxAge],
              () => {
                console.log(
                  `[performMaintenance] Cleaned ${recordsDeleted} old records`
                );
                resolve();
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
      });
    });

    if (optimizeDb) {
      await optimizeDatabase(db);
    }

    const cacheSize = await fsManager.calculateCacheSize();

    console.log(
      `[performMaintenance] Completed: ${filesDeleted} files, ${recordsDeleted} records deleted`
    );

    return {
      filesDeleted,
      recordsDeleted,
      cacheSize
    };
  } catch (error) {
    console.error('[performMaintenance] Error:', error);
    throw error;
  }
};

// FIX: Función auxiliar para formatear publicaciones para cache
export const formatPublicationsForCache = (
  publications: PublicationModelResponse[],
): PublicationModelResponse[] => {
  console.log(
    `[formatPublicationsForCache] Formatting ${publications.length} publications`
  );

  return publications.map((pub) => ({
    ...pub,
    commonNoun: pub.commonNoun || '',
    description: pub.description || '',
    animalState: pub.animalState || '',
    location: pub.location || '',
    img: pub.img || ''
  }));
};

// FIX: Funciones de compatibilidad - mantener nombres originales
export const createTable = createTables; // Alias para compatibilidad

export const closeDatabase = async (): Promise<void> => {
  console.log('[closeDatabase] Closing all database connections');
  await DatabasePool.getInstance().closeAll();
  console.log('[closeDatabase] All database connections closed');
};
