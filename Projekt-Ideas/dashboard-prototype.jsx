import React, { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Inbox,
  Calendar,
  MessageSquare,
  FileText,
  PenTool,
  BookOpen,
  Sparkles,
  CreditCard,
  Lightbulb,
  Settings,
  GraduationCap,
  Home,
  ArrowUp,
  ChevronRight,
  Clock,
} from "lucide-react";

const NAV_ITEMS = [
  {
    id: "uebersicht",
    label: "Übersicht",
    icon: LayoutDashboard,
    group: "both",
    empty: null,
  },
  {
    id: "mail",
    label: "Mail",
    icon: Inbox,
    group: "schule",
    empty: "Postfach folgt, sobald die IMAP-Anbindung an IServ steht.",
  },
  {
    id: "stundenplan",
    label: "Stundenplan",
    icon: Calendar,
    group: "schule",
    empty: "Zeigt deinen Stundenplan, sobald die WebUntis-Anbindung läuft.",
  },
  {
    id: "schulcloud",
    label: "schul.cloud",
    icon: MessageSquare,
    group: "schule",
    empty: "Öffnet schul.cloud später direkt im Dashboard.",
  },
  {
    id: "dokumente",
    label: "Dokumente",
    icon: FileText,
    group: "both",
    empty: "Deine Dateien erscheinen hier, sobald Nextcloud angebunden ist.",
  },
  {
    id: "handschrift",
    label: "Handschrift",
    icon: PenTool,
    group: "both",
    empty: "Der Handschrift-Editor kommt in einer der nächsten Ausbaustufen.",
  },
  {
    id: "wiki",
    label: "Wiki",
    icon: BookOpen,
    group: "both",
    empty: "Wissen zum Nachschlagen — folgt in einer späteren Phase.",
  },
  {
    id: "ki",
    label: "KI-Assistent",
    icon: Sparkles,
    group: "both",
    empty: "Hier hinterlegst du später deinen eigenen API-Schlüssel.",
  },
  {
    id: "cardy",
    label: "Cardy",
    icon: CreditCard,
    group: "schule",
    empty: "Digitales Ausgangsticket fürs Sekretariat — erste Version folgt.",
  },
  {
    id: "feedback",
    label: "Verbesserungsvorschläge",
    icon: Lightbulb,
    group: "both",
    empty: null,
  },
  {
    id: "einstellungen",
    label: "Einstellungen",
    icon: Settings,
    group: "both",
    empty: null,
  },
];

const CATEGORIES = [
  { id: "idee", label: "Idee", color: "var(--accent-purple)" },
  { id: "verbesserung", label: "Verbesserung", color: "var(--accent-green)" },
  { id: "fehler", label: "Fehler", color: "var(--accent-red)" },
];

const MODULES_FOR_FEEDBACK = [
  "Allgemein",
  "Übersicht",
  "Mail",
  "Stundenplan",
  "schul.cloud",
  "Dokumente",
  "Handschrift",
  "Wiki",
  "KI-Assistent",
  "Cardy",
  "Design / Theme",
];

const SEED_FEEDBACK = [
  {
    id: "f1",
    title: "Stundenplan als Karte auf der Startseite",
    category: "idee",
    module: "Übersicht",
    description:
      "Die nächsten zwei Stunden direkt auf der Übersicht anzeigen, ohne extra klicken zu müssen.",
    votes: 7,
    minutesAgo: 190,
  },
  {
    id: "f2",
    title: "Radiergummi im Handschrift-Editor zu klein getroffen",
    category: "fehler",
    module: "Handschrift",
    description:
      "Auf dem iPad braucht es mehrere Versuche, bis der Radiergummi-Modus richtig trifft.",
    votes: 3,
    minutesAgo: 60,
  },
  {
    id: "f3",
    title: "Suchfeld oben im Wiki fixieren",
    category: "verbesserung",
    module: "Wiki",
    description:
      "Beim Scrollen durch lange Artikel wäre eine fixierte Suche praktisch.",
    votes: 5,
    minutesAgo: 20,
  },
];

function relativeTime(minutes) {
  if (minutes < 1) return "gerade eben";
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  return `vor ${days} Tag${days > 1 ? "en" : ""}`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Guten Morgen";
  if (h < 18) return "Guten Tag";
  return "Guten Abend";
}

export default function DashboardPrototype() {
  const [group, setGroup] = useState("schule");
  const [active, setActive] = useState("uebersicht");
  const [feedback, setFeedback] = useState(SEED_FEEDBACK);
  const [voted, setVoted] = useState({});
  const [sortMode, setSortMode] = useState("neu");
  const [filterCat, setFilterCat] = useState(null);

  const [form, setForm] = useState({
    title: "",
    category: "idee",
    module: "Allgemein",
    description: "",
  });

  const visibleNav = useMemo(
    () => NAV_ITEMS.filter((n) => n.group === "both" || n.group === group),
    [group]
  );

  function selectGroup(next) {
    setGroup(next);
    const stillVisible = NAV_ITEMS.find(
      (n) => n.id === active && (n.group === "both" || n.group === next)
    );
    if (!stillVisible) setActive("uebersicht");
  }

  function submitFeedback(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const entry = {
      id: `f${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      module: form.module,
      description: form.description.trim(),
      votes: 0,
      minutesAgo: 0,
    };
    setFeedback((prev) => [entry, ...prev]);
    setForm({ title: "", category: "idee", module: "Allgemein", description: "" });
  }

  function toggleVote(id) {
    setVoted((prev) => {
      const already = !!prev[id];
      setFeedback((fb) =>
        fb.map((item) =>
          item.id === id
            ? { ...item, votes: item.votes + (already ? -1 : 1) }
            : item
        )
      );
      return { ...prev, [id]: !already };
    });
  }

  const counts = useMemo(() => {
    const c = { idee: 0, verbesserung: 0, fehler: 0 };
    feedback.forEach((f) => (c[f.category] = (c[f.category] || 0) + 1));
    return c;
  }, [feedback]);

  const sortedFeedback = useMemo(() => {
    let list = filterCat ? feedback.filter((f) => f.category === filterCat) : feedback;
    list = [...list];
    if (sortMode === "beliebt") list.sort((a, b) => b.votes - a.votes);
    else list.sort((a, b) => a.minutesAgo - b.minutesAgo);
    return list;
  }, [feedback, sortMode, filterCat]);

  const activeItem = NAV_ITEMS.find((n) => n.id === active);

  return (
    <div className="tn-app min-h-screen flex" style={{ background: "var(--bg-deep)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

        .tn-app {
          --bg-deep: #1a1b26;
          --bg-panel: #1f2335;
          --bg-inset: #16161e;
          --bg-hover: #292e42;
          --border: #2d3149;
          --text-primary: #c0caf5;
          --text-muted: #8188b3;
          --text-dim: #565f89;
          --accent-blue: #7aa2f7;
          --accent-purple: #bb9af7;
          --accent-cyan: #7dcfff;
          --accent-green: #9ece6a;
          --accent-yellow: #e0af68;
          --accent-red: #f7768e;
          font-family: 'Inter', system-ui, sans-serif;
          color: var(--text-primary);
        }
        .tn-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }

        .tn-cursor {
          display: inline-block;
          width: 8px;
          height: 1em;
          margin-left: 2px;
          background: var(--accent-green);
          animation: tn-blink 1.1s steps(1) infinite;
          vertical-align: -2px;
        }
        @keyframes tn-blink { 50% { opacity: 0; } }

        .tn-navbtn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 12px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-muted);
          font-size: 13.5px;
          text-align: left;
          cursor: pointer;
          transition: background-color 120ms, color 120ms;
        }
        .tn-navbtn:hover { background: var(--bg-hover); color: var(--text-primary); }
        .tn-navbtn.active {
          background: var(--bg-hover);
          color: var(--text-primary);
          border-color: var(--border);
        }
        .tn-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

        .tn-focus:focus-visible {
          outline: 2px solid var(--accent-blue);
          outline-offset: 2px;
        }

        .tn-groupbtn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 6px;
          font-size: 12.5px;
          border-radius: 7px;
          border: 1px solid var(--border);
          background: var(--bg-inset);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 120ms;
        }
        .tn-groupbtn.active {
          color: var(--bg-deep);
          background: var(--accent-cyan);
          border-color: var(--accent-cyan);
          font-weight: 600;
        }

        .tn-input, .tn-select, .tn-textarea {
          width: 100%;
          background: var(--bg-inset);
          border: 1px solid var(--border);
          color: var(--text-primary);
          border-radius: 7px;
          padding: 9px 11px;
          font-size: 13.5px;
          font-family: inherit;
        }
        .tn-input::placeholder, .tn-textarea::placeholder { color: var(--text-dim); }
        .tn-input:focus, .tn-select:focus, .tn-textarea:focus {
          outline: 2px solid var(--accent-blue);
          outline-offset: 1px;
          border-color: var(--accent-blue);
        }

        .tn-chip {
          padding: 6px 11px;
          border-radius: 7px;
          font-size: 12.5px;
          border: 1px solid var(--border);
          background: var(--bg-inset);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 120ms;
        }
        .tn-chip.active { color: var(--bg-deep); font-weight: 600; }

        .tn-votebtn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg-inset);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 120ms;
        }
        .tn-votebtn.voted {
          border-color: var(--accent-blue);
          color: var(--accent-blue);
          background: rgba(122, 162, 247, 0.08);
        }

        .tn-scroll::-webkit-scrollbar { width: 8px; }
        .tn-scroll::-webkit-scrollbar-thumb { background: var(--bg-hover); border-radius: 8px; }

        @media (prefers-reduced-motion: reduce) {
          .tn-cursor { animation: none; opacity: 1; }
          * { transition: none !important; }
        }
      `}</style>

      {/* Sidebar */}
      <aside
        className="w-64 shrink-0 flex flex-col"
        style={{ background: "var(--bg-panel)", borderRight: "1px solid var(--border)" }}
      >
        <div className="px-5 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="tn-mono" style={{ fontSize: "15px", fontWeight: 600 }}>
            simonsstudios<span className="tn-cursor" />
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
            Dashboard · Entwurf
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto tn-scroll px-3 py-4" style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const dotColor =
              item.group === "schule"
                ? "var(--accent-cyan)"
                : item.group === "privat"
                ? "var(--accent-green)"
                : "var(--accent-blue)";
            return (
              <button
                key={item.id}
                className={`tn-navbtn tn-focus ${active === item.id ? "active" : ""}`}
                onClick={() => setActive(item.id)}
              >
                <Icon size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                <span className="tn-dot" style={{ background: dotColor }} />
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4" style={{ borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginBottom: "8px", paddingLeft: "2px" }}>
            Ansicht für
          </div>
          <div className="flex gap-2">
            <button
              className={`tn-groupbtn tn-focus ${group === "schule" ? "active" : ""}`}
              onClick={() => selectGroup("schule")}
            >
              <GraduationCap size={14} /> Schule
            </button>
            <button
              className={`tn-groupbtn tn-focus ${group === "privat" ? "active" : ""}`}
              onClick={() => selectGroup("privat")}
            >
              <Home size={14} /> Privat
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="flex items-center justify-between px-6"
          style={{ height: "56px", borderBottom: "1px solid var(--border)", background: "var(--bg-deep)" }}
        >
          <div className="flex items-center" style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            <span>Dashboard</span>
            <ChevronRight size={14} style={{ margin: "0 4px", color: "var(--text-dim)" }} />
            <span style={{ color: "var(--text-primary)" }}>{activeItem?.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="tn-mono"
              style={{
                fontSize: "11.5px",
                padding: "4px 10px",
                borderRadius: "999px",
                border: "1px solid var(--border)",
                color: "var(--accent-purple)",
              }}
              title="Weitere Designs folgen später"
            >
              Tokyo Night
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto tn-scroll px-8 py-8">
          {active === "uebersicht" && (
            <div style={{ maxWidth: "760px" }}>
              <h1 style={{ fontSize: "26px", fontWeight: 600, marginBottom: "6px" }}>
                {greeting()}, Simon
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "14.5px", lineHeight: 1.6, maxWidth: "520px" }}>
                Das ist ein erster Designentwurf für dein Dashboard. Die Navigation
                funktioniert schon vollständig — die Fachmodule kommen Schritt für
                Schritt dazu.
              </p>

              <button
                className="tn-focus"
                onClick={() => setActive("feedback")}
                style={{
                  marginTop: "20px",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "1px solid var(--accent-green)",
                  background: "rgba(158, 206, 106, 0.1)",
                  color: "var(--accent-green)",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Lightbulb size={15} /> Verbesserungsvorschlag einreichen
              </button>

              <div style={{ marginTop: "36px" }}>
                <div style={{ fontSize: "12.5px", color: "var(--text-dim)", marginBottom: "10px" }}>
                  Module in Planung
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1px", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                  {visibleNav
                    .filter((n) => n.empty)
                    .map((n, i) => (
                      <div
                        key={n.id}
                        onClick={() => setActive(n.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 14px",
                          background: "var(--bg-panel)",
                          cursor: "pointer",
                        }}
                      >
                        <n.icon size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                        <span style={{ fontSize: "13.5px", flex: 1 }}>{n.label}</span>
                        <span
                          className="tn-mono"
                          style={{ fontSize: "11px", color: "var(--accent-yellow)" }}
                        >
                          geplant
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {active !== "uebersicht" && active !== "feedback" && activeItem?.empty && (
            <div
              style={{
                maxWidth: "440px",
                marginTop: "60px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <activeItem.icon size={20} style={{ color: "var(--accent-blue)" }} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "6px" }}>
                {activeItem.label}
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "13.5px", lineHeight: 1.6 }}>
                {activeItem.empty}
              </p>
              <button
                className="tn-focus"
                onClick={() => setActive("feedback")}
                style={{
                  marginTop: "14px",
                  fontSize: "12.5px",
                  color: "var(--accent-green)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Ideen dazu einreichen
              </button>
            </div>
          )}

          {active === "einstellungen" && (
            <div style={{ maxWidth: "520px" }}>
              <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "18px" }}>
                Einstellungen
              </h1>

              <div style={{ fontSize: "12.5px", color: "var(--text-dim)", marginBottom: "8px" }}>
                Design
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden", marginBottom: "26px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "var(--bg-panel)" }}>
                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))" }} />
                  <span style={{ fontSize: "13.5px", flex: 1 }}>Tokyo Night</span>
                  <span className="tn-mono" style={{ fontSize: "11px", color: "var(--accent-green)" }}>aktiv</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "var(--bg-panel)", opacity: 0.5 }}>
                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "var(--bg-hover)" }} />
                  <span style={{ fontSize: "13.5px", flex: 1 }}>Weitere Designs</span>
                  <span className="tn-mono" style={{ fontSize: "11px", color: "var(--text-dim)" }}>bald</span>
                </div>
              </div>

              <div style={{ fontSize: "12.5px", color: "var(--text-dim)", marginBottom: "8px" }}>
                Benutzergruppe
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                Steuert, welche Module in der Seitenleiste sichtbar sind. Aktuell
                ausgewählt: <strong style={{ color: "var(--text-primary)" }}>{group === "schule" ? "Schule" : "Privat"}</strong>.
                Umschalten geht unten links in der Seitenleiste.
              </p>
            </div>
          )}

          {active === "feedback" && (
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "4px" }}>
                Verbesserungsvorschläge
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginBottom: "28px" }}>
                Sammelstelle für Ideen, Verbesserungen und gemeldete Fehler — bewertbar per Stimme.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Form */}
                <form onSubmit={submitFeedback} className="lg:col-span-2" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                      Titel
                    </label>
                    <input
                      className="tn-input tn-focus"
                      placeholder="Kurz und konkret"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                      Kategorie
                    </label>
                    <div className="flex gap-2">
                      {CATEGORIES.map((c) => (
                        <button
                          type="button"
                          key={c.id}
                          className={`tn-chip tn-focus ${form.category === c.id ? "active" : ""}`}
                          style={form.category === c.id ? { background: c.color, borderColor: c.color } : {}}
                          onClick={() => setForm({ ...form, category: c.id })}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                      Bereich
                    </label>
                    <select
                      className="tn-select tn-focus"
                      value={form.module}
                      onChange={(e) => setForm({ ...form, module: e.target.value })}
                    >
                      {MODULES_FOR_FEEDBACK.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                      Beschreibung
                    </label>
                    <textarea
                      className="tn-textarea tn-focus"
                      rows={4}
                      placeholder="Was genau schlägst du vor?"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="tn-focus"
                    style={{
                      alignSelf: "flex-start",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      border: "none",
                      background: "var(--accent-blue)",
                      color: "var(--bg-deep)",
                      fontWeight: 600,
                      fontSize: "13.5px",
                      cursor: "pointer",
                    }}
                  >
                    Absenden
                  </button>
                </form>

                {/* List */}
                <div className="lg:col-span-3">
                  <div className="flex items-center justify-between" style={{ marginBottom: "14px" }}>
                    <div className="flex gap-2">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.id}
                          className={`tn-chip tn-focus ${filterCat === c.id ? "active" : ""}`}
                          style={filterCat === c.id ? { background: c.color, borderColor: c.color } : {}}
                          onClick={() => setFilterCat(filterCat === c.id ? null : c.id)}
                        >
                          {c.label} · {counts[c.id] || 0}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1" style={{ fontSize: "12px" }}>
                      <button
                        className="tn-focus"
                        onClick={() => setSortMode("neu")}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                          background: sortMode === "neu" ? "var(--bg-hover)" : "transparent",
                          color: sortMode === "neu" ? "var(--text-primary)" : "var(--text-dim)",
                          cursor: "pointer",
                        }}
                      >
                        Neu
                      </button>
                      <button
                        className="tn-focus"
                        onClick={() => setSortMode("beliebt")}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                          background: sortMode === "beliebt" ? "var(--bg-hover)" : "transparent",
                          color: sortMode === "beliebt" ? "var(--text-primary)" : "var(--text-dim)",
                          cursor: "pointer",
                        }}
                      >
                        Beliebt
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {sortedFeedback.length === 0 && (
                      <div style={{ color: "var(--text-dim)", fontSize: "13px", padding: "20px 0" }}>
                        Noch nichts in dieser Kategorie.
                      </div>
                    )}
                    {sortedFeedback.map((item) => {
                      const cat = CATEGORIES.find((c) => c.id === item.category);
                      return (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            gap: "12px",
                            padding: "14px 14px 14px 12px",
                            background: "var(--bg-panel)",
                            borderRadius: "9px",
                            borderLeft: `3px solid ${cat.color}`,
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="flex items-center gap-2" style={{ marginBottom: "4px" }}>
                              <span style={{ fontSize: "14px", fontWeight: 600 }}>{item.title}</span>
                            </div>
                            {item.description && (
                              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "8px" }}>
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3" style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
                              <span style={{ color: cat.color }}>{cat.label}</span>
                              <span>{item.module}</span>
                              <span className="tn-mono flex items-center gap-1">
                                <Clock size={11} /> {relativeTime(item.minutesAgo)}
                              </span>
                            </div>
                          </div>
                          <button
                            className={`tn-votebtn tn-focus ${voted[item.id] ? "voted" : ""}`}
                            onClick={() => toggleVote(item.id)}
                          >
                            <ArrowUp size={14} />
                            <span className="tn-mono" style={{ fontSize: "12px" }}>{item.votes}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
