import 'dotenv/config';
import { Pool } from 'pg';

function maskDbUri(uri: string) {
  try {
    const u = new URL(uri.trim());
    const user = decodeURIComponent(u.username || '');
    const pass = u.password ? '***' : '';
    return `${u.protocol}//${user}:${pass}@${u.hostname}:${u.port}${u.pathname}${u.search}`;
  } catch {
    return '(URL 파싱 실패) ' + uri;
  }
}

const cwd = process.cwd();
const raw = process.env.DATABASE_URL;

console.log('🔎 CWD:', cwd);
console.log('🔎 .env에서 읽은 DATABASE_URL 존재?', raw ? 'YES' : 'NO');
if (raw) {
  console.log('🔎 마스킹된 DB URI:', maskDbUri(raw));
  try {
    const u = new URL(raw.trim());
    console.log('🔎 Host:', u.hostname, 'Port:', u.port, 'DB:', u.pathname);
  } catch (e) {
    console.log('⚠️ URL 파싱 에러:', e);
  }
}

if (!raw) {
  throw new Error('환경변수 DATABASE_URL을 읽지 못했습니다. (.env 위치/이름/철자 확인)');
}

const pool = new Pool({
  connectionString: raw.trim(),
  ssl: { rejectUnauthorized: false },
});

async function main(): Promise<void> {
  try {
    const { rows } = await pool.query<{ now: string }>('SELECT NOW();');
    console.log('✅ DB 연결 성공:', rows[0]);
  } catch (error) {
    console.error('❌ DB 연결 실패');
    if (error instanceof Error) {
      console.error('메시지:', error.message);
      console.error('스택:', error.stack);
    } else {
      console.error('알 수 없는 오류:', error);
    }
  } finally {
    await pool.end();
  }
}

void main();
