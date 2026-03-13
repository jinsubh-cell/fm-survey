import { getAllResponses } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const rows = await getAllResponses();

    const headers = [
      'ID', '행사전반(1-5)', '행사장(1-5)', '시상식(1-5)', '연출(1-5)', '식음료(1-5)',
      '좋았던프로그램', '좋았던점', '아쉬운점', '개선의견', 'NPS(0-10)', '내년희망사항', '응답일시'
    ];

    let csv = '\uFEFF' + headers.join(',') + '\n';
    for (const row of rows) {
      const fields = [
        row.id,
        row.q1_overall,
        row.q2_venue ?? '',
        row.q3_ceremony ?? '',
        row.q4_production ?? '',
        row.q5_food ?? '',
        `"${(row.q6_best_programs || '').replace(/"/g, '""')}"`,
        `"${(row.q7_good_points || '').replace(/"/g, '""')}"`,
        `"${(row.q8_improvements || '').replace(/"/g, '""')}"`,
        `"${(row.q9_suggestions || '').replace(/"/g, '""')}"`,
        row.q10_nps,
        `"${(row.q11_next_year || '').replace(/"/g, '""')}"`,
        row.created_at,
      ];
      csv += fields.join(',') + '\n';
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=survey_results.csv',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
