import { neon } from '@neondatabase/serverless';

function getSQL() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다.');
  }
  return neon(process.env.DATABASE_URL);
}

export async function initDB() {
  const sql = getSQL();
  await sql`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      q1_overall INTEGER NOT NULL,
      q2_venue INTEGER,
      q3_ceremony INTEGER,
      q4_production INTEGER,
      q5_food INTEGER,
      q6_best_programs TEXT,
      q7_good_points TEXT,
      q8_improvements TEXT,
      q9_suggestions TEXT,
      q10_nps INTEGER NOT NULL,
      q11_next_year TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

export async function insertResponse(data) {
  const sql = getSQL();
  await initDB();
  await sql`
    INSERT INTO responses (q1_overall, q2_venue, q3_ceremony, q4_production, q5_food,
      q6_best_programs, q7_good_points, q8_improvements, q9_suggestions, q10_nps, q11_next_year)
    VALUES (${data.q1_overall}, ${data.q2_venue}, ${data.q3_ceremony}, ${data.q4_production}, ${data.q5_food},
      ${data.q6_best_programs}, ${data.q7_good_points}, ${data.q8_improvements}, ${data.q9_suggestions},
      ${data.q10_nps}, ${data.q11_next_year})
  `;
}

async function getScaleStat(sql, col) {
  const avgRows = await sql(`SELECT AVG(${col}) as avg FROM responses WHERE ${col} IS NOT NULL`);
  const distRows = await sql(`SELECT ${col} as val, COUNT(*) as cnt FROM responses WHERE ${col} IS NOT NULL GROUP BY ${col} ORDER BY ${col}`);
  const avg = avgRows[0]?.avg ? Math.round(parseFloat(avgRows[0].avg) * 100) / 100 : 0;
  return { avg, distribution: distRows.map(r => ({ val: r.val, cnt: parseInt(r.cnt) })) };
}

export async function getStats() {
  const sql = getSQL();
  await initDB();

  const [totalResult] = await sql`SELECT COUNT(*) as count FROM responses`;
  const total = parseInt(totalResult.count);

  const scaleStats = {};
  for (const q of ['q1_overall', 'q2_venue', 'q3_ceremony', 'q4_production', 'q5_food']) {
    scaleStats[q] = await getScaleStat(sql, q);
  }

  const npsData = await sql`SELECT q10_nps as val, COUNT(*) as cnt FROM responses WHERE q10_nps IS NOT NULL GROUP BY q10_nps ORDER BY q10_nps`;
  const npsAvgResult = await sql`SELECT AVG(q10_nps) as avg FROM responses WHERE q10_nps IS NOT NULL`;
  const promotersResult = await sql`SELECT COUNT(*) as cnt FROM responses WHERE q10_nps >= 9`;
  const detractorsResult = await sql`SELECT COUNT(*) as cnt FROM responses WHERE q10_nps <= 6`;

  const promoters = parseInt(promotersResult[0].cnt);
  const detractors = parseInt(detractorsResult[0].cnt);
  const npsAvg = npsAvgResult[0]?.avg ? Math.round(parseFloat(npsAvgResult[0].avg) * 100) / 100 : 0;
  const npsScore = total > 0 ? Math.round((promoters / total - detractors / total) * 100) : 0;

  const bestPrograms = await sql`SELECT q6_best_programs FROM responses WHERE q6_best_programs IS NOT NULL`;
  const programCounts = {};
  bestPrograms.forEach(r => {
    try { JSON.parse(r.q6_best_programs).forEach(item => { programCounts[item] = (programCounts[item] || 0) + 1; }); } catch {}
  });

  const improvements = await sql`SELECT q8_improvements FROM responses WHERE q8_improvements IS NOT NULL`;
  const improvementCounts = {};
  improvements.forEach(r => {
    try { JSON.parse(r.q8_improvements).forEach(item => { improvementCounts[item] = (improvementCounts[item] || 0) + 1; }); } catch {}
  });

  const freeTexts = {
    q7_good_points: await sql`SELECT q7_good_points as text, created_at FROM responses WHERE q7_good_points IS NOT NULL AND q7_good_points != '' ORDER BY created_at DESC`,
    q9_suggestions: await sql`SELECT q9_suggestions as text, created_at FROM responses WHERE q9_suggestions IS NOT NULL AND q9_suggestions != '' ORDER BY created_at DESC`,
    q11_next_year: await sql`SELECT q11_next_year as text, created_at FROM responses WHERE q11_next_year IS NOT NULL AND q11_next_year != '' ORDER BY created_at DESC`,
  };

  return {
    total, scaleStats,
    nps: { distribution: npsData.map(r => ({ val: r.val, cnt: parseInt(r.cnt) })), avg: npsAvg, score: npsScore, promoters, detractors, passives: total - promoters - detractors },
    multiSelect: { q6_best_programs: programCounts, q8_improvements: improvementCounts },
    freeTexts,
  };
}

export async function getAllResponses() {
  const sql = getSQL();
  await initDB();
  return await sql`SELECT * FROM responses ORDER BY created_at DESC`;
}
