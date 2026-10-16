const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

let dbInstance = null;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: path.join(__dirname, 'database.sqlite'),
      driver: sqlite3.Database
    });
    
    // Enable foreign keys
    await dbInstance.run('PRAGMA foreign_keys = ON');

    // Run init script if tables don't exist
    const initSql = fs.readFileSync(path.join(__dirname, 'src', 'config', 'sqlite_init.sql'), 'utf8');
    const statements = initSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of statements) {
      await dbInstance.run(stmt);
    }
  }
  return dbInstance;
}

const pool = {
  query: async (sql, params = []) => {
    const db = await getDb();
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
    
    // Convert IF(cond, a, b) to CASE WHEN cond THEN a ELSE b END
    // Convert GREATEST(0, expr) to MAX(0, expr)
    // DATEDIFF(NOW(), expr) to CAST(julianday('now') - julianday(expr) AS INTEGER)
    // DATE_ADD(..., INTERVAL ... DAY) to datetime(..., '+' || ... || ' days')
    // We will do a minimal string replacement for those specific queries in transactionRoutes
    
    let processedSql = sql;
    // VERY specific hacks for transactionRoutes.js date queries
    processedSql = processedSql.replace(/IF\(t\.duration_days IS NOT NULL, DATE_ADD\(t\.created_at, INTERVAL t\.duration_days DAY\), NULL\)/g, "CASE WHEN t.duration_days IS NOT NULL THEN datetime(t.created_at, '+' || t.duration_days || ' days') ELSE NULL END");
    processedSql = processedSql.replace(/IF\(t\.transaction_type = 'borrow_request' AND t\.status = 'approved' AND t\.duration_days IS NOT NULL, \s*GREATEST\(0, DATEDIFF\(NOW\(\), DATE_ADD\(t\.created_at, INTERVAL t\.duration_days DAY\)\)\), \s*0\s*\)/g, "CASE WHEN t.transaction_type = 'borrow_request' AND t.status = 'approved' AND t.duration_days IS NOT NULL THEN MAX(0, CAST(julianday('now') - julianday(datetime(t.created_at, '+' || t.duration_days || ' days')) AS INTEGER)) ELSE 0 END");
    processedSql = processedSql.replace(/IF\(t\.transaction_type = 'borrow_request' AND t\.status = 'approved' AND t\.duration_days IS NOT NULL, \s*GREATEST\(0, DATEDIFF\(NOW\(\), DATE_ADD\(t\.created_at, INTERVAL t\.duration_days DAY\)\)\) \* \?, \s*0\s*\)/g, "CASE WHEN t.transaction_type = 'borrow_request' AND t.status = 'approved' AND t.duration_days IS NOT NULL THEN MAX(0, CAST(julianday('now') - julianday(datetime(t.created_at, '+' || t.duration_days || ' days')) AS INTEGER)) * ? ELSE 0 END");

    try {
      if (isSelect || processedSql.trim().toUpperCase().startsWith('WITH')) {
        const rows = await db.all(processedSql, params);
        return [rows, []];
      } else {
        const result = await db.run(processedSql, params);
        return [{ insertId: result.lastID, affectedRows: result.changes }, []];
      }
    } catch (e) {
      if (e.message.includes('UNIQUE constraint failed')) {
        e.code = 'ER_DUP_ENTRY';
      }
      throw e;
    }
  },
  execute: async (sql, params = []) => {
    return pool.query(sql, params);
  }
};

module.exports = pool;