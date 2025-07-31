import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { PublicationResponse } from '../../domain/models/publication.models';
SQLite.enablePromise(true);

export async function getDBConnection(): Promise<SQLiteDatabase> {
  return SQLite.openDatabase({ name: 'publications.db', location: 'default' });
}

export async function createTable(db: SQLiteDatabase) {
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS publications (
      recordId TEXT PRIMARY KEY,
      commonNoun TEXT,
      description TEXT,
      animalState TEXT,
      location TEXT,
      status TEXT,
      img TEXT
    );`);
}

export async function clearStatus(db: SQLiteDatabase, status: string) {
  await db.executeSql(`DELETE FROM publications WHERE status = ?;`, [status]);
}

export async function savePublications(
  db: SQLiteDatabase,
  items: PublicationResponse[],
  status: string
) {
  const placeholders = items.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(',');
  const params = items.flatMap(i => [i.recordId, i.commonNoun, i.description, i.animalState, i.location, status, i.img]);
  await db.executeSql(
    `INSERT OR REPLACE INTO publications (recordId, commonNoun, description, animalState, location, status, img) VALUES ${placeholders};`,
    params
  );
}

export async function loadPublications(
  db: SQLiteDatabase,
  status: string,
  limit: number,
  offset = 0
): Promise<PublicationResponse[]> {
  try{
    console.log('[loadPublications] ', status, limit, offset);
    const [result] = await db.executeSql(
      `SELECT * FROM publications WHERE status = ? LIMIT ? OFFSET ?;`,
      [status, limit, offset]
    );
    console.log('[result] ', result);
  const items: PublicationResponse[] = [];
  result.rows.raw().forEach((row: PublicationResponse) => {
    const item = row;
    console.log('[item] ', item);
    items.push(item);
  });
  console.log('[items] ', items);
  return items;
  }catch(e){
    console.log('[loadPublications] ', e);
    return [];
  }
}
