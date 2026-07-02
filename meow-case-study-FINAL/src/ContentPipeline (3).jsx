import { useState, useRef, useEffect } from "react";
import { Radar, FileText, CalendarDays, Loader2, Check, ChevronRight, Sparkles, Clock, RotateCcw, X } from "lucide-react";

const KEYWORDS = [
  { kw: "girişimler için yüksek faizli mevduat hesabı", hacim: 880, zorluk: 24 },
  { kw: "yapay zeka bot banka hesabı açabilir mi", hacim: 320, zorluk: 11 },
  { kw: "kripto şirketleri için banka hesabı", hacim: 1200, zorluk: 38 },
  { kw: "startup banka hesabı karşılaştırma", hacim: 590, zorluk: 29 },
  { kw: "Mercury vs Brex vs Meow karşılaştırma", hacim: 210, zorluk: 9 },
  { kw: "QuickBooks entegrasyonlu dijital banka", hacim: 140, zorluk: 14 },
];

const CADENCE_DAYS = 7;

function fmtDate(d) {
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
}

export default function ContentPipeline() {
  const [stage, setStage] = useState(0); // 0 idle, 1 kw selected, 2 generating, 3 draft ready
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [calendar, setCalendar] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const draftRef = useRef(null);

  useEffect(() => {
    if (stage === 2) {
      const start = Date.now();
      timerRef.current = setInterval(() => setElapsed((Date.now() - start) / 1000), 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [stage]);

  useEffect(() => {
    if (draft && draftRef.current) draftRef.current.scrollTop = 0;
  }, [draft]);

  async function generate(kwObj) {
    setSelected(kwObj);
    setStage(2);
    setError("");
    setDraft("");
    setElapsed(0);
    try {
      const prompt = `Görev: "${kwObj.kw}" anahtar kelimesi için bir fintech blogunda yayınlanacak SEO odaklı bir blog yazısı taslağı üret.
Bağlam: Meow adında, AI botlarının doğrudan banka işlemi yapabildiği bir B2B dijital bankacılık girişimi için yazıyorsun. Hedef kitle: ABD'deki küçük/orta ölçekli girişim kurucuları.
Referans: Samimi ama bilgi dolu bir ton kullan, listelercik ve alt başlıklarla yapılandır.
Değerlendirme: Bir editör bunu 30 dakika içinde gözden geçirip yayına hazırlayacak, o yüzden net ve düzenli yaz.
Format: Türkçe yaz. Başlık + 4-5 alt başlık + kısa kapanış. Toplam 550-650 kelime civarında olsun. Markdown başlık (#, ##) kullan.`;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "İstek başarısız oldu");
      const text = (data.text || "").trim();
      if (!text) throw new Error("Boş yanıt geldi");
      setDraft(text);
      setStage(3);

      const today = new Date();
      setCalendar((prev) => {
        const nextIdx = prev.length;
        const date = new Date(today.getTime() + nextIdx * CADENCE_DAYS * 86400000);
        return [
          ...prev,
          { kw: kwObj.kw, date, status: "Taslak Hazır" },
        ];
      });
    } catch (e) {
      setError("Üretim sırasında bir sorun oluştu. Tekrar dener misin?");
      setStage(1);
    }
  }

  function resetDraft() {
    setStage(0);
    setSelected(null);
    setDraft("");
    setError("");
    setElapsed(0);
  }

  function removeCalendarEntry(idx) {
    setCalendar((prev) => prev.filter((_, i) => i !== idx));
  }

  function clearCalendar() {
    setCalendar([]);
  }

  const stages = [
    { label: "Anahtar Kelime", icon: Radar },
    { label: "Taslak (Gemini)", icon: FileText },
    { label: "Takvim", icon: CalendarDays },
  ];
  const activeIdx = stage === 0 ? -1 : stage === 1 ? 0 : stage === 2 ? 1 : 2;

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: #2DD4A744; }
        .kwcard:hover { border-color: #2DD4A7AA !important; transform: translateY(-1px); }
        .kwcard:focus-visible, .gen-btn:focus-visible { outline: 2px solid #2DD4A7; outline-offset: 2px; }
        @keyframes pulse { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
        @media (prefers-reduced-motion: reduce) { .pulsedot { animation: none !important; } }
      `}</style>

      <header style={styles.header}>
        <div style={styles.eyebrow}>OTOMASYON PROTOTİPİ &middot; BÖLÜM 10 BONUS</div>
        <h1 style={styles.title}>İçerik Üretim Hattı</h1>
        <p style={styles.subtitle}>
          Anahtar kelime tespiti → Gemini ile taslak üretimi → içerik takvimi. Meow vaka analizinde
          önerilen otomasyon sisteminin çalışan bir örneği.
        </p>
      </header>

      {/* Pipeline tracker */}
      <div style={styles.pipeline}>
        {stages.map((s, i) => {
          const Icon = s.icon;
          const done = i < activeIdx || stage === 3 && i <= 2 && i < 2 ? i < activeIdx : i < activeIdx;
          const isActive = i === activeIdx;
          const isComplete = (stage === 3 && i <= 2) ? (i < 2 || i === 2 ? i <= 2 && (i < activeIdx || (i===2 && stage===3)) : false) : i < activeIdx;
          return (
            <div key={s.label} style={styles.pipeNode}>
              <div style={{
                ...styles.pipeIconWrap,
                borderColor: isActive ? "#2DD4A7" : (i < activeIdx || (stage===3 && i<=2)) ? "#2DD4A7" : "#1E3A33",
                background: isActive ? "#16302A" : (i < activeIdx || (stage===3 && i<=2)) ? "#102420" : "#0C1B18",
              }}>
                {(stage===2 && i===1) ? (
                  <Loader2 size={16} color="#2DD4A7" style={{ animation: "spin 1s linear infinite" }} />
                ) : (i < activeIdx || (stage===3 && i<=2)) ? (
                  <Check size={16} color="#2DD4A7" />
                ) : (
                  <Icon size={16} color={isActive ? "#2DD4A7" : "#3E6358"} />
                )}
              </div>
              <span style={{ ...styles.pipeLabel, color: isActive ? "#EAF3EF" : "#5C8377" }}>{s.label}</span>
              {i < 2 && <div style={{ ...styles.pipeLine, background: (i < activeIdx || stage===3) ? "#2DD4A7" : "#1E3A33" }} />}
            </div>
          );
        })}
      </div>

      {/* Stage 1: keyword detection */}
      <section style={styles.section}>
        <div style={styles.sectionHead}>
          <Radar size={14} color="#2DD4A7" />
          <span style={styles.sectionLabel}>01 — Tespit Edilen Anahtar Kelimeler</span>
        </div>
        <div style={styles.kwGrid}>
          {KEYWORDS.map((k) => (
            <button
              key={k.kw}
              className="kwcard"
              onClick={() => generate(k)}
              disabled={stage === 2}
              style={{
                ...styles.kwCard,
                borderColor: selected?.kw === k.kw ? "#2DD4A7" : "#1E3A33",
                opacity: stage === 2 && selected?.kw !== k.kw ? 0.4 : 1,
                cursor: stage === 2 ? "default" : "pointer",
              }}
            >
              <div style={styles.kwText}>{k.kw}</div>
              <div style={styles.kwStats}>
                <span>hacim {k.hacim}</span>
                <span style={styles.kwDot}>·</span>
                <span>zorluk {k.zorluk}</span>
                <ChevronRight size={14} color="#3E6358" style={{ marginLeft: "auto" }} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Stage 2/3: draft */}
      {(stage === 2 || stage === 3 || error) && (
        <section style={styles.section}>
          <div style={styles.sectionHead}>
            <FileText size={14} color="#2DD4A7" />
            <span style={styles.sectionLabel}>02 — Gemini Taslağı</span>
            {stage === 2 && (
              <span style={styles.timer}><Clock size={12} /> {elapsed.toFixed(1)}s</span>
            )}
            {(stage === 3 || error) && (
              <button onClick={resetDraft} style={styles.clearBtn}>
                <RotateCcw size={12} /> Temizle
              </button>
            )}
          </div>
          <div style={styles.draftCard}>
            {stage === 2 && (
              <div style={styles.loadingRow}>
                <Loader2 size={16} color="#2DD4A7" style={{ animation: "spin 1s linear infinite" }} />
                <span>"{selected?.kw}" için taslak üretiliyor…</span>
              </div>
            )}
            {error && <div style={styles.errorBox}>{error}</div>}
            {stage === 3 && (
              <div ref={draftRef} style={styles.draftText}>
                {draft.split("\n").map((line, i) => {
                  if (line.startsWith("## ")) return <h3 key={i} style={styles.h3}>{line.slice(3)}</h3>;
                  if (line.startsWith("# ")) return <h2 key={i} style={styles.h2}>{line.slice(2)}</h2>;
                  if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
                  return <p key={i} style={styles.p}>{line}</p>;
                })}
                <div style={styles.editorNote}>
                  <Sparkles size={12} color="#E8B854" /> Editör incelemesi için ~30 dk ayrılmalı (rapor önerisi).
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Stage 3: calendar */}
      <section style={styles.section}>
        <div style={styles.sectionHead}>
          <CalendarDays size={14} color="#2DD4A7" />
          <span style={styles.sectionLabel}>03 — İçerik Takvimi</span>
          {calendar.length > 0 && (
            <button onClick={clearCalendar} style={styles.clearBtn}>
              <RotateCcw size={12} /> Tümünü Temizle
            </button>
          )}
        </div>
        {calendar.length === 0 ? (
          <div style={styles.emptyCal}>Henüz planlanmış içerik yok. Bir anahtar kelime seçtiğinde otomatik eklenecek.</div>
        ) : (
          <div style={styles.calList}>
            {calendar.map((c, i) => (
              <div key={i} style={styles.calRow}>
                <div style={styles.calDate}>{fmtDate(c.date)}</div>
                <div style={styles.calKw}>{c.kw}</div>
                <div style={styles.calBadge}>{c.status}</div>
                <button onClick={() => removeCalendarEntry(i)} style={styles.rowDeleteBtn} aria-label="Sil">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer style={styles.footer}>
        Kurgu: Ahrefs benzeri araç → Gemini taslağı → editör onayı (~30 dk) → otomatik takvim + sosyal paylaşım.
        Kaynak: Meow Vaka Analizi, Bölüm 10 &amp; Bonus.
      </footer>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#081413",
    color: "#EAF3EF",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "28px 18px 40px",
    maxWidth: 560,
    margin: "0 auto",
  },
  header: { marginBottom: 22 },
  eyebrow: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.12em",
    color: "#2DD4A7",
    marginBottom: 8,
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 28,
    fontWeight: 700,
    margin: "0 0 8px",
    letterSpacing: "-0.02em",
  },
  subtitle: { fontSize: 14, color: "#7FA396", lineHeight: 1.5, margin: 0 },

  pipeline: { display: "flex", alignItems: "flex-start", marginBottom: 28, padding: "4px 4px" },
  pipeNode: { display: "flex", alignItems: "center", flex: "0 0 auto", position: "relative" },
  pipeIconWrap: {
    width: 34, height: 34, borderRadius: 10, border: "1.5px solid",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  pipeLabel: { fontSize: 11, marginLeft: 8, marginRight: 10, fontWeight: 500, whiteSpace: "nowrap" },
  pipeLine: { width: 28, height: 2, borderRadius: 2, marginRight: 10, alignSelf: "center" },

  section: { marginBottom: 22 },
  sectionHead: { display: "flex", alignItems: "center", gap: 7, marginBottom: 10 },
  sectionLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11.5, letterSpacing: "0.04em", color: "#5C8377", fontWeight: 500,
  },
  timer: {
    marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
    color: "#E8B854", display: "flex", alignItems: "center", gap: 4,
  },
  clearBtn: {
    marginLeft: "auto", display: "flex", alignItems: "center", gap: 5,
    background: "transparent", border: "1px solid #1E3A33", borderRadius: 7,
    padding: "5px 9px", fontSize: 11, color: "#7FA396", cursor: "pointer",
    fontFamily: "'Inter', sans-serif", font: "inherit",
  },
  rowDeleteBtn: {
    background: "transparent", border: "none", color: "#5C8377",
    cursor: "pointer", flexShrink: 0, padding: 4, display: "flex",
    alignItems: "center", justifyContent: "center",
  },

  kwGrid: { display: "flex", flexDirection: "column", gap: 8 },
  kwCard: {
    background: "#0F211D", border: "1.5px solid #1E3A33", borderRadius: 12,
    padding: "12px 14px", textAlign: "left", transition: "all .15s ease",
    color: "#EAF3EF", font: "inherit",
  },
  kwText: { fontSize: 13.5, fontWeight: 500, marginBottom: 6 },
  kwStats: {
    display: "flex", alignItems: "center", gap: 6,
    fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#5C8377",
  },
  kwDot: { color: "#2A4A41" },

  draftCard: {
    background: "#0F211D", border: "1.5px solid #1E3A33", borderRadius: 14,
    padding: 18, minHeight: 80,
  },
  loadingRow: { display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#7FA396" },
  errorBox: { fontSize: 13, color: "#E89A54" },
  draftText: { maxHeight: 420, overflowY: "auto" },
  h2: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, margin: "0 0 10px", color: "#EAF3EF" },
  h3: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, margin: "14px 0 6px", color: "#2DD4A7" },
  p: { fontSize: 13.5, lineHeight: 1.65, color: "#C7DAD2", margin: "0 0 4px" },
  editorNote: {
    marginTop: 14, paddingTop: 12, borderTop: "1px solid #1E3A33",
    display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#A89260",
  },

  emptyCal: {
    fontSize: 12.5, color: "#5C8377", background: "#0C1B18",
    border: "1px dashed #1E3A33", borderRadius: 12, padding: 16, textAlign: "center",
  },
  calList: { display: "flex", flexDirection: "column", gap: 6 },
  calRow: {
    display: "flex", alignItems: "center", gap: 10,
    background: "#0F211D", border: "1px solid #1E3A33", borderRadius: 10,
    padding: "10px 12px",
  },
  calDate: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "#E8B854",
    flexShrink: 0, width: 52,
  },
  calKw: { fontSize: 12.5, color: "#C7DAD2", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  calBadge: {
    fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", color: "#2DD4A7",
    background: "#102420", border: "1px solid #1E3A33", borderRadius: 6, padding: "3px 7px",
    flexShrink: 0,
  },

  footer: { fontSize: 11, color: "#3E6358", textAlign: "center", marginTop: 30, lineHeight: 1.6 },
};
