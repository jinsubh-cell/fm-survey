'use client';
import { useState, useEffect } from 'react';

const BEST_PROGRAMS = [
  '수상자 발표 및 시상식',
  '포토월 및 기념 촬영',
  'CEO 및 임원 축사',
  '수상자 소감 발표',
  '참석자 간 자유 교류 및 대화 시간',
  '영상 VCR / 영상 연출',
];

const IMPROVEMENTS = [
  '행사 진행 시간 (너무 길었음)',
  '좌석 배치 / 시야 확보',
  '음향 및 마이크 상태',
  '식음료 품질 / 양',
  '주차 / 교통 불편',
  '사전 안내 및 공지 부족',
  '참석자 간 교류 시간 부족',
  '축하 공연',
  '장소',
  '특별히 없음',
];

export default function SurveyPage() {
  const [answers, setAnswers] = useState({
    q1: null, q2: null, q3: null, q4: null, q5: null,
    q6: [], q7: '', q8: [], q9: '', q10: null, q11: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('fm_survey_done') === 'true') {
      setAlreadyDone(true);
    }
  }, []);

  const setScale = (q, val) => setAnswers(p => ({ ...p, [q]: val }));
  const toggleMulti = (q, item) => {
    setAnswers(p => {
      const arr = p[q].includes(item) ? p[q].filter(x => x !== item) : [...p[q], item];
      return { ...p, [q]: arr };
    });
  };
  const setText = (q, val) => setAnswers(p => ({ ...p, [q]: val }));

  const completedCount = () => {
    let c = 0;
    if (answers.q1) c++;
    if (answers.q2) c++;
    if (answers.q3) c++;
    if (answers.q4) c++;
    if (answers.q5) c++;
    if (answers.q6.length > 0) c++;
    if (answers.q7.trim()) c++;
    if (answers.q8.length > 0) c++;
    if (answers.q10 !== null) c++;
    if (answers.q11.trim()) c++;
    return c;
  };

  const totalQ = 10;
  const progress = Math.round((completedCount() / totalQ) * 100);

  const handleSubmit = async () => {
    if (!answers.q1 || !answers.q2 || !answers.q3 || !answers.q4 || !answers.q5 || answers.q10 === null) {
      return alert('1번~5번, 10번 문항은 필수입니다.');
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q1_overall: answers.q1,
          q2_venue: answers.q2,
          q3_ceremony: answers.q3,
          q4_production: answers.q4,
          q5_food: answers.q5,
          q6_best_programs: answers.q6,
          q7_good_points: answers.q7,
          q8_improvements: answers.q8,
          q9_suggestions: answers.q9,
          q10_nps: answers.q10,
          q11_next_year: answers.q11,
        }),
      });
      if (!res.ok) throw new Error('제출 실패');
      localStorage.setItem('fm_survey_done', 'true');
      setSubmitted(true);
    } catch (e) {
      alert('설문 제출 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (alreadyDone) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.thankCard}>
          <div style={styles.checkIcon}>✓</div>
          <h2 style={{ fontSize: 18, fontWeight: 500, margin: '0 0 8px', color: '#2C2C2A' }}>이미 설문을 완료하셨습니다. 감사합니다!</h2>
          <p style={{ fontSize: 14, color: '#5F5E5A', margin: '0 0 1rem', lineHeight: 1.6 }}>
            소중한 의견에 감사드립니다.
          </p>
          <button
            onClick={() => window.location.href = 'https://www.fmac.co.kr'}
            style={styles.confirmBtn}
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.thankCard}>
          <div style={styles.checkIcon}>✓</div>
          <h2 style={{ fontSize: 18, fontWeight: 500, margin: '0 0 8px', color: '#2C2C2A' }}>설문이 완료되었습니다!</h2>
          <p style={{ fontSize: 14, color: '#5F5E5A', margin: '0 0 1rem', lineHeight: 1.6 }}>
            소중한 의견 감사합니다.<br />여러분의 피드백으로 더 나은 행사를 만들겠습니다.
          </p>
          <p style={{ fontSize: 13, color: '#888780', margin: '1rem 0 0' }}>2025 FM Asset 연도대상 수상을 축하드립니다!</p>
          <button
            onClick={() => window.location.href = 'https://www.fmac.co.kr'}
            style={styles.confirmBtn}
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>2025 FM Asset 연도대상<br />만족도 설문</h1>
        <p style={styles.headerDesc}>소중한 의견을 남겨주세요<br />더 나은 행사를 만드는 데 활용됩니다</p>
        <div style={styles.anonBadge}>🔒 익명 설문 · 개인정보를 수집하지 않습니다</div>
      </div>

      {/* Progress */}
      <div style={{ fontSize: 12, color: '#888780', textAlign: 'right', marginBottom: 8 }}>
        {completedCount()} / {totalQ} 항목 완료
      </div>
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      {/* Section: 전반적 행사 평가 */}
      <div style={styles.sectionLabel}>전반적 행사 평가</div>

      <ScaleQuestion label="Q1. 이번 행사 전반에 대한 만족도는?" required value={answers.q1} onChange={v => setScale('q1', v)} />
      <ScaleQuestion label="Q2. 행사장 (장소·시설·접근성) 만족도는?" required value={answers.q2} onChange={v => setScale('q2', v)} />
      <ScaleQuestion label="Q3. 시상식 진행 (MC·순서·시간) 만족도는?" required value={answers.q3} onChange={v => setScale('q3', v)} />
      <ScaleQuestion label="Q4. 무대·영상·음향 등 연출 만족도는?" required value={answers.q4} onChange={v => setScale('q4', v)} />
      <ScaleQuestion label="Q5. 식음료 (식사·음료·다과) 만족도는?" required value={answers.q5} onChange={v => setScale('q5', v)} />

      {/* Section: 좋았던 점 */}
      <div style={styles.sectionLabel}>특별히 좋았던 점</div>

      <div style={styles.qCard}>
        <p style={styles.qTitle}>Q6. 가장 좋았던 프로그램/순서를 모두 선택해 주세요</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {BEST_PROGRAMS.map(item => (
            <CheckOption key={item} label={item} selected={answers.q6.includes(item)} onClick={() => toggleMulti('q6', item)} />
          ))}
        </div>
      </div>

      <div style={styles.qCard}>
        <p style={styles.qTitle}>Q7. 특별히 인상 깊었거나 좋았던 점을 자유롭게 적어주세요</p>
        <textarea style={styles.textarea} rows={3} placeholder="예) 영상 연출이 웅장했습니다, 수상자 발표 방식이 감동적이었습니다..." value={answers.q7} onChange={e => setText('q7', e.target.value)} />
      </div>

      {/* Section: 아쉬운 점 */}
      <div style={styles.sectionLabel}>아쉬웠던 점 및 보완사항</div>

      <div style={styles.qCard}>
        <p style={styles.qTitle}>Q8. 아쉬웠던 점이나 개선이 필요한 부분을 모두 선택해 주세요</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {IMPROVEMENTS.map(item => (
            <CheckOption key={item} label={item} selected={answers.q8.includes(item)} onClick={() => toggleMulti('q8', item)} />
          ))}
        </div>
      </div>

      <div style={styles.qCard}>
        <p style={styles.qTitle}>Q9. 구체적인 개선 의견이나 건의사항을 적어주세요</p>
        <textarea style={styles.textarea} rows={3} placeholder="내년 행사를 더 좋게 만들기 위한 아이디어를 자유롭게 적어주세요..." value={answers.q9} onChange={e => setText('q9', e.target.value)} />
      </div>

      {/* Section: 추천 */}
      <div style={styles.sectionLabel}>추천 및 기타</div>

      <div style={styles.qCard}>
        <p style={styles.qTitle}>Q10. 동료나 파트너에게 FM Asset 연도대상 참석을 추천하시겠어요? <span style={styles.required}>*</span></p>
        <p style={{ fontSize: 12, color: '#888780', margin: '0 0 10px' }}>0 = 전혀 추천 안 함 · 10 = 적극 추천</p>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
            <button key={n} style={{ ...styles.npsBtn, ...(answers.q10 === n ? styles.npsBtnActive : {}) }}
              onClick={() => setScale('q10', n)}>{n}</button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#B4B2A9', marginTop: 4 }}>
          <span>비추천</span><span>적극 추천</span>
        </div>
      </div>

      <div style={styles.qCard}>
        <p style={styles.qTitle}>Q11. 내년 연도대상에 추가되었으면 하는 순서나 행사 내용이 있다면 적어주세요</p>
        <textarea style={styles.textarea} rows={3} placeholder="예) 축하 공연, 수상자 인터뷰 영상, 부문별 시상 확대, 가족 동반 행사 등..." value={answers.q11} onChange={e => setText('q11', e.target.value)} />
      </div>

      <button style={{ ...styles.submitBtn, opacity: submitting ? 0.6 : 1 }} onClick={handleSubmit} disabled={submitting}>
        {submitting ? '제출 중...' : '설문 제출하기 →'}
      </button>
      <p style={{ fontSize: 12, color: '#B4B2A9', textAlign: 'center', marginTop: 12 }}>소요 시간 약 3분 · 응답은 익명으로 처리됩니다</p>
    </div>
  );
}

function ScaleQuestion({ label, required, value, onChange }) {
  return (
    <div style={styles.qCard}>
      <p style={styles.qTitle}>{label} {required && <span style={styles.required}>*</span>}</p>
      <p style={{ fontSize: 12, color: '#888780', margin: '0 0 8px' }}>1 = 매우 불만족 · 5 = 매우 만족</p>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1,2,3,4,5].map(n => (
          <button key={n} style={{ ...styles.scaleBtn, ...(value === n ? styles.scaleBtnActive : {}) }}
            onClick={() => onChange(n)}>{n}</button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#B4B2A9', marginTop: 4 }}>
        <span>매우 불만족</span><span>매우 만족</span>
      </div>
    </div>
  );
}

function CheckOption({ label, selected, onClick }) {
  return (
    <div onClick={onClick} style={{ ...styles.checkOpt, ...(selected ? styles.checkOptSel : {}), cursor: 'pointer' }}>
      <div style={{ ...styles.checkbox, ...(selected ? styles.checkboxSel : {}) }}>
        {selected ? '✓' : ''}
      </div>
      <span style={{ fontSize: 14, color: selected ? '#0C447C' : '#2C2C2A' }}>{label}</span>
    </div>
  );
}

const styles = {
  wrapper: { maxWidth: 480, margin: '0 auto', padding: '1rem', background: '#ffffff', fontFamily: 'sans-serif', minHeight: '100vh' },
  header: { background: '#185FA5', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' },
  headerTitle: { color: '#E6F1FB', fontSize: 18, fontWeight: 500, margin: '0 0 4px' },
  headerDesc: { color: '#85B7EB', fontSize: 13, margin: 0, lineHeight: 1.5 },
  anonBadge: { fontSize: 12, fontWeight: 500, borderRadius: 20, padding: '6px 16px', display: 'inline-block', marginTop: 10, background: 'rgba(255,255,255,0.15)', color: '#E6F1FB' },
  sectionLabel: { fontSize: 12, fontWeight: 500, color: '#888780', letterSpacing: '0.05em', margin: '1.5rem 0 0.75rem' },
  qCard: { background: '#ffffff', border: '1px solid #D3D1C7', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 12 },
  qTitle: { fontSize: 14, fontWeight: 500, color: '#2C2C2A', margin: '0 0 12px', lineHeight: 1.5 },
  required: { color: '#E24B4A', marginLeft: 2 },
  scaleBtn: { flex: 1, padding: '10px 0', border: '1px solid #D3D1C7', borderRadius: 8, background: '#F1EFE8', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#2C2C2A', textAlign: 'center' },
  scaleBtnActive: { background: '#185FA5', borderColor: '#185FA5', color: '#ffffff' },
  npsBtn: { flex: 1, padding: '10px 0', border: '1px solid #D3D1C7', borderRadius: 8, background: '#F1EFE8', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#2C2C2A', textAlign: 'center' },
  npsBtnActive: { background: '#185FA5', borderColor: '#185FA5', color: '#ffffff' },
  checkOpt: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid #D3D1C7', borderRadius: 8, background: '#ffffff' },
  checkOptSel: { borderColor: '#378ADD', background: '#E6F1FB' },
  checkbox: { width: 18, height: 18, borderRadius: 4, border: '1.5px solid #B4B2A9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, background: '#ffffff' },
  checkboxSel: { borderColor: '#185FA5', background: '#185FA5', color: '#ffffff' },
  textarea: { width: '100%', border: '1px solid #D3D1C7', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#2C2C2A', background: '#F1EFE8', resize: 'none', fontFamily: 'sans-serif', lineHeight: 1.6, boxSizing: 'border-box' },
  submitBtn: { width: '100%', padding: 14, background: '#185FA5', color: '#ffffff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: 'pointer', marginTop: '1.5rem' },
  progressBar: { height: 4, background: '#F1EFE8', borderRadius: 2, marginBottom: '1rem' },
  progressFill: { height: '100%', background: '#185FA5', borderRadius: 2, transition: 'width 0.3s' },
  thankCard: { background: '#ffffff', border: '1px solid #D3D1C7', borderRadius: 12, padding: '2rem 1.25rem', textAlign: 'center', marginTop: '2rem' },
  checkIcon: { width: 56, height: 56, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: 24, color: '#1D9E75', fontWeight: 500 },
  confirmBtn: { marginTop: '1.5rem', padding: '12px 48px', background: '#185FA5', color: '#ffffff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: 'pointer' },
};
