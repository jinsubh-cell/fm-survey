import { insertResponse, getStats } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    await insertResponse({
      q1_overall: body.q1_overall,
      q2_venue: body.q2_venue || null,
      q3_ceremony: body.q3_ceremony || null,
      q4_production: body.q4_production || null,
      q5_food: body.q5_food || null,
      q6_best_programs: body.q6_best_programs?.length > 0 ? JSON.stringify(body.q6_best_programs) : null,
      q7_good_points: body.q7_good_points || null,
      q8_improvements: body.q8_improvements?.length > 0 ? JSON.stringify(body.q8_improvements) : null,
      q9_suggestions: body.q9_suggestions || null,
      q10_nps: body.q10_nps,
      q11_next_year: body.q11_next_year || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Survey submit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
