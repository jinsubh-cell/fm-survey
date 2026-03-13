'use client';
import { useEffect, useState } from 'react';

const SCALE_LABELS = {
  q1_overall: '행사 전반 만족도',
  q2_venue: '행사장 (장소·시설·접근성)',
  q3_ceremony: '시상식 진행 (MC·순서·시간)',
  q4_production: '무대·영상·음향 연출',
  q5_food: '식음료 (식사·음료·다과)',
};

export default function StatsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    fetch('/api/survey')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={s.wrapper}><p style={{ textAlign: 'center', padding: 40, color: '#888' }}>통계를 불러오는 중...</p></div>;
  if (!data) return <div style={s.wrapper}><p style={{ textAlign: 'center', padding: 40, color: '#E24B4A' }}>데이터를 불러올 수 없습니다.</p></div>;

  return (
    <div style={s.wrapper}>
      <div style={s.header}>
        <h1 style={s.title}>📊 설문 통계 대시보드</h1>
        <p style={s.subtitle}>2025 FM Asset 연도대상 만족도 설문</p>
      </div>

      {/* Summary Cards */}
      <div style={s.cardRow}>
        <div style={s.summaryCard}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#185FA5' }}>{data.total}</div>
          <div style={{ fontSize: 12, color: '#888' }}>총 응답수</div>
        </div>
        <div style={s.summaryCard}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#185FA5' }}>{data.scaleStats.q1_overall?.avg || '-'}</div>
          <div style={{ fontSize: 12, color: '#888' }}>전반 만족도 (5점)</div>
        </div>
        <div style={s.summaryCard}>
          <div style={{ fontSize: 28, fontWeight: 700, color: data.nps.score >= 0 ? '#1D9E75' : '#E24B4A' }}>{data.nps.score}</div>
          <div style={{ fontSize: 12, color: '#888' }}>NPS 점수</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {['overview', 'detail', 'text'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ ...s.tabBtn, ...(tab === t ? s.tabActive : {}) }}>
            {t === 'overview' ? '📈 종합' : t === 'detail' ? '📋 상세' : '💬 서술형'}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab data={data} />}
      {tab === 'detail' && <DetailTab data={data} />}
      {tab === 'text' && <TextTab data={data} />}

      {/* Download */}
      <div style={{ textAlign: 'center', margin: '2rem 0 1rem' }}>
        <a href="/api/survey/export" download style={s.dlBtn}>📥 CSV 다운로드</a>
      </div>
      <p style={{ textAlign: 'center', fontSize: 11, color: '#B4B2A9' }}>마지막 업데이트: {new Date().toLocaleString('ko-KR')}</p>
    </div>
  );
}

function OverviewTab({ data }) {
  return (
    <>
      {/* Scale questions summary */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>만족도 항목별 평균</h3>
        {Object.entries(SCALE_LABELS).map(([key, label]) => {
          const stat = data.scaleStats[key];
          const pct = stat?.avg ? (stat.avg / 5) * 100 : 0;
          return (
            <div key={key} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: '#2C2C2A' }}>{label}</span>
                <span style={{ fontWeight: 600, color: '#185FA5' }}>{stat?.avg || 0} / 5</span>
              </div>
              <div style={s.bar}><div style={{ ...s.barFill, width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </div>

      {/* NPS */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>NPS (Net Promoter Score)</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ ...s.npsBadge, background: '#E1F5EE', color: '#1D9E75' }}>추천 (9-10): {data.nps.promoters}명</div>
          <div style={{ ...s.npsBadge, background: '#FFF8E1', color: '#F59E0B' }}>중립 (7-8): {data.nps.passives}명</div>
          <div style={{ ...s.npsBadge, background: '#FEE2E2', color: '#E24B4A' }}>비추천 (0-6): {data.nps.detractors}명</div>
        </div>
        <p style={{ fontSize: 13, color: '#5F5E5A' }}>NPS 점수: <strong>{data.nps.score}</strong> (평균: {data.nps.avg})</p>
      </div>
    </>
  );
}

function DetailTab({ data }) {
  return (
    <>
      {/* Scale distribution */}
      {Object.entries(SCALE_LABELS).map(([key, label]) => {
        const stat = data.scaleStats[key];
        const total = stat?.distribution?.reduce((s, d) => s + d.cnt, 0) || 0;
        return (
          <div key={key} style={s.section}>
            <h3 style={s.sectionTitle}>{label}</h3>
            <p style={{ fontSize: 12, color: '#888', margin: '0 0 8px' }}>평균: {stat?.avg || 0} / 5 · 응답: {total}명</p>
            {[1,2,3,4,5].map(val => {
              const cnt = stat?.distribution?.find(d => d.val === val)?.cnt || 0;
              const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
              return (
                <div key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 20, fontSize: 12, textAlign: 'center', color: '#5F5E5A' }}>{val}</span>
                  <div style={{ ...s.bar, flex: 1 }}><div style={{ ...s.barFill, width: `${pct}%` }} /></div>
                  <span style={{ fontSize: 11, color: '#888', minWidth: 50, textAlign: 'right' }}>{cnt}명 ({pct}%)</span>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Multi-select */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>좋았던 프로그램 (복수선택)</h3>
        <MultiSelectChart counts={data.multiSelect.q6_best_programs} total={data.total} />
      </div>

      <div style={s.section}>
        <h3 style={s.sectionTitle}>아쉬운 점 (복수선택)</h3>
        <MultiSelectChart counts={data.multiSelect.q8_improvements} total={data.total} />
      </div>

      {/* NPS distribution */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>NPS 분포 (0-10)</h3>
        {[0,1,2,3,4,5,6,7,8,9,10].map(val => {
          const cnt = data.nps.distribution?.find(d => d.val === val)?.cnt || 0;
          const pct = data.total > 0 ? Math.round((cnt / data.total) * 100) : 0;
          const color = val >= 9 ? '#1D9E75' : val >= 7 ? '#F59E0B' : '#E24B4A';
          return (
            <div key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ width: 22, fontSize: 12, textAlign: 'center', color: '#5F5E5A' }}>{val}</span>
              <div style={{ ...s.bar, flex: 1 }}><div style={{ ...s.barFill, width: `${pct}%`, background: color }} /></div>
              <span style={{ fontSize: 11, color: '#888', minWidth: 50, textAlign: 'right' }}>{cnt}명 ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function TextTab({ data }) {
  const sections = [
    { key: 'q7_good_points', title: '좋았던 점' },
    { key: 'q9_suggestions', title: '개선 의견' },
    { key: 'q11_next_year', title: '내년 희망사항' },
  ];

  return (
    <>
      {sections.map(({ key, title }) => (
        <div key={key} style={s.section}>
          <h3 style={s.sectionTitle}>{title} ({data.freeTexts[key]?.length || 0}건)</h3>
          {data.freeTexts[key]?.length > 0 ? (
            data.freeTexts[key].map((item, i) => (
              <div key={i} style={s.textItem}>
                <p style={{ margin: 0, fontSize: 13, color: '#2C2C2A', lineHeight: 1.6 }}>{item.text}</p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#B4B2A9' }}>{item.created_at}</p>
              </div>
            ))
          ) : (
            <p style={{ fontSize: 13, color: '#B4B2A9' }}>아직 응답이 없습니다.</p>
          )}
        </div>
      ))}
    </>
  );
}

function MultiSelectChart({ counts, total }) {
  const sorted = Object.entries(counts || {}).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return <p style={{ fontSize: 13, color: '#B4B2A9' }}>아직 응답이 없습니다.</p>;
  const max = sorted[0][1];
  return sorted.map(([label, cnt]) => {
    const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
    return (
      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: '#2C2C2A', minWidth: 160, flexShrink: 0 }}>{label}</span>
        <div style={{ ...s.bar, flex: 1 }}><div style={{ ...s.barFill, width: `${max > 0 ? (cnt / max) * 100 : 0}%` }} /></div>
        <span style={{ fontSize: 11, color: '#888', minWidth: 50, textAlign: 'right' }}>{cnt}명 ({pct}%)</span>
      </div>
    );
  });
}

const s = {
  wrapper: { maxWidth: 640, margin: '0 auto', padding: '1rem', fontFamily: 'sans-serif', minHeight: '100vh' },
  header: { background: '#185FA5', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' },
  title: { color: '#fff', fontSize: 18, fontWeight: 600, margin: 0 },
  subtitle: { color: '#85B7EB', fontSize: 13, margin: '4px 0 0' },
  cardRow: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  summaryCard: { flex: '1 1 100px', background: '#fff', border: '1px solid #E5E3DC', borderRadius: 12, padding: '16px 12px', textAlign: 'center' },
  tabs: { display: 'flex', gap: 4, marginBottom: 16, background: '#F1EFE8', borderRadius: 8, padding: 4 },
  tabBtn: { flex: 1, padding: '8px 0', border: 'none', borderRadius: 6, background: 'transparent', fontSize: 13, fontWeight: 500, color: '#5F5E5A', cursor: 'pointer' },
  tabActive: { background: '#fff', color: '#185FA5', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  section: { background: '#fff', border: '1px solid #E5E3DC', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: '#2C2C2A', margin: '0 0 12px' },
  bar: { height: 8, background: '#F1EFE8', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', background: '#185FA5', borderRadius: 4, transition: 'width 0.3s', minWidth: 2 },
  npsBadge: { fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 12 },
  textItem: { background: '#F9F8F5', borderRadius: 8, padding: '10px 12px', marginBottom: 8 },
  dlBtn: { display: 'inline-block', padding: '12px 24px', background: '#185FA5', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500 },
};
