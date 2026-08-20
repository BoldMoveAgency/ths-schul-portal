import { Component, useEffect, useState } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) {
    return { err };
  }
  render() {
    if (this.state.err) {
      return (
        <pre style={{ padding: 24, whiteSpace: "pre-wrap" }}>
          {String(this.state.err?.stack || this.state.err)}
        </pre>
      );
    }
    return this.props.children;
  }
}
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  Archive,
  Bell,
  BookOpen,
  Calculator,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  FileCheck,
  FileCode,
  FileText,
  FolderOpen,
  GraduationCap,
  LogOut,
  MessageCircle,
  MessageSquare,
  Moon,
  ScrollText,
  Sun,
  User,
  UserCheck,
  Video,
} from "lucide-react";
import {
  addFile,
  addHomework,
  currentUser,
  getDb,
  gradeHomework,
  homePath,
  hydrateCloud,
  login,
  logout,
  markNoticeRead,
  markRoomRead,
  sendMessage,
  sendNotice,
  submitHomework,
  subscribe,
  unreadCount,
  viewStudentId,
} from "./store.js";
import { toggleTheme, useTheme } from "./theme.js";
import {
  AdminTasks,
  Courses,
  HomeworkQuestions,
  ModulesStudent,
  ModulesTeacher,
  OfflineStudent,
  OfflineTeacher,
  ParentChild,
  ParentHome,
  Payments,
  ReportsStudent,
  ReportsTeacher,
  RoomsFull,
  ScheduleBoard,
  Scripts,
  StudentOverview,
  TestsStudent,
  TestsTeacher,
  ThemeGrading,
  Topics,
} from "./screens.jsx";

function initials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((p) => p.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function useUser() {
  const [user, setUser] = useState(() => currentUser());
  const [db, setDb] = useState(() => getDb());
  const [ready, setReady] = useState(!import.meta.env.VITE_SUPABASE_URL);
  useEffect(() => subscribe(setDb), []);
  useEffect(() => {
    let alive = true;
    hydrateCloud().then((next) => {
      if (!alive) return;
      setDb(next);
      setUser(currentUser());
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);
  return { user, setUser, db, ready };
}

function Login({ user, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();
  if (user) return <Navigate to={homePath(user)} replace />;

  function onSubmit(e) {
    e.preventDefault();
    const u = login(email, password);
    if (!u) {
      setError("Anmeldung fehlgeschlagen.");
      return;
    }
    setUser(u);
    nav(homePath(u));
  }

  const demos = [
    ["Lehrer", "lehrer@ths-demo.schule", "LehrDemo11"],
    ["Schüler", "schueler@ths-demo.schule", "SchuelerDemo11"],
    ["Eltern", "eltern@ths-demo.schule", "ElternDemo11"],
  ];

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="hdr">
          <img className="brand" src="/ths-logo.png" alt="THS Homeschooling" />
          <h1>Anmeldung</h1>
          <p className="lede">Melden Sie sich an, um auf das Hausaufgaben-System zuzugreifen</p>
        </div>
        <form onSubmit={onSubmit} autoComplete="off">
          <label>
            E-Mail
            <input type="email" name="ths-email" autoComplete="off" placeholder="ihre.email@beispiel.de" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Passwort
            <input type="password" name="ths-password" autoComplete="new-password" placeholder="Ihr Passwort" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error ? <p className="err">{error}</p> : null}
          <button className="btn-login" type="submit">
            Anmelden
          </button>
          <button className="forgot" type="button" onClick={() => setError("Passwort-Reset ist in der Demo nicht aktiv.")}>
            Passwort vergessen?
          </button>
          <div className="demo-accounts">
            {demos.map(([label, mail, pw]) => (
              <button
                key={mail}
                className="demo-chip"
                type="button"
                onClick={() => {
                  setEmail(mail);
                  setPassword(pw);
                  setError("");
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </form>
      </div>
      <nav className="login-legal">
        <a href="https://ths-schul-landing.vercel.app/datenschutz.html">Datenschutz</a>
        <a href="https://ths-schul-landing.vercel.app/impressum.html">Impressum</a>
        <a href="https://ths-schul-landing.vercel.app/cookies.html">Nutzungsbedingungen</a>
      </nav>
    </div>
  );
}

function Header({ user, setUser, label }) {
  const nav = useNavigate();
  const theme = useTheme();
  const db = getDb();
  const unread = user ? unreadCount(user.id) : 0;
  const notices = user ? db.notices.filter((n) => n.to.includes(user.id)) : [];
  const unreadNotes = notices.filter((n) => !n.read.includes(user.id)).length;
  const [open, setOpen] = useState(null);
  const profilePath = user?.role === "lehrer" ? "/teacher/profile" : user?.role === "eltern" ? "/parent/profile" : "/student/profile";
  const chatPath = "/chat";

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(null);
    const t = window.setTimeout(() => window.addEventListener("click", close), 0);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("click", close);
    };
  }, [open]);
  if (!user) return null;

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand-stack">
          <img src="/ths-logo.png" alt="THS Homeschooling" />
          <p>{label}</p>
        </div>
        <div className="top-actions" onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn" type="button" title="Nachrichten" onClick={() => nav(chatPath)}>
            <MessageCircle size={20} />
            {unread ? <span className="dot">{unread > 9 ? "9+" : unread}</span> : null}
          </button>
          <div className="menu-wrap">
            <button className="icon-btn" type="button" title="Benachrichtigungen" onClick={() => setOpen(open === "bell" ? null : "bell")}>
              <Bell size={20} />
              {unreadNotes ? <span className="dot">{unreadNotes > 9 ? "9+" : unreadNotes}</span> : null}
            </button>
            {open === "bell" ? (
              <div className="panel">
                <h4>Benachrichtigungen</h4>
                {notices.length === 0 ? (
                  <article>
                    <p>Keine neuen Benachrichtigungen.</p>
                  </article>
                ) : (
                  notices.map((n) => (
                    <article
                      key={n.id}
                      onClick={() => markNoticeRead(user.id, n.id)}
                    >
                      <strong>{n.title}</strong>
                      <p>{n.body}</p>
                    </article>
                  ))
                )}
              </div>
            ) : null}
          </div>
          <button className="icon-btn" type="button" title={theme === "dark" ? "Heller Modus" : "Dunkler Modus"} onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="menu-wrap">
            <button className="user-btn" type="button" onClick={() => setOpen(open === "user" ? null : "user")}>
              <span className="avatar">{initials(user.name)}</span>
              <span>{user.name}</span>
              <ChevronDown size={16} />
            </button>
            {open === "user" ? (
              <div className="menu">
                <button type="button" onClick={() => nav(profilePath)}>
                  <User size={16} /> Mein Profil
                </button>
                <div className="sep" />
                <button
                  type="button"
                  className="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(null);
                    logout();
                    setUser(null);
                    nav("/login");
                  }}
                >
                  <LogOut size={16} /> Abmelden
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function Shell({ user, setUser, label, children, narrow }) {
  return (
    <div className="shell">
      <Header user={user} setUser={setUser} label={label} />
      <div className={narrow ? "main main-narrow" : "main"}>{children}</div>
    </div>
  );
}

function Guard({ user, role, roles, children }) {
  if (!user) return <Navigate to="/login" replace />;
  const allowed = roles || (role ? [role] : null);
  if (allowed && !allowed.includes(user.role)) return <Navigate to={homePath(user)} replace />;
  return children;
}

const TEACHER_TILES = [
  {
    category: "Klassenräume",
    title: "Meine Klassenräume",
    description: "Virtuelle Räume, Stundenpläne, Anwesenheit & Krankmeldungen",
    icon: Video,
    path: "/teacher/classrooms",
    color: "hsl(258 90% 66% / 0.1)",
  },
  {
    category: "Unterricht & Lerninhalte",
    title: "Hausaufgaben-Management",
    description: "Hausaufgaben erstellen, bearbeiten und Schüler-Abgaben verwalten",
    icon: FileText,
    path: "/teacher/homework",
    color: "hsl(217 91% 60% / 0.1)",
  },
  {
    category: "Unterricht & Lerninhalte",
    title: "Offene Hausaufgaben-Fragen",
    description: "Alle unbeantworteten Schülerfragen im Überblick",
    icon: MessageSquare,
    path: "/teacher/homework-questions",
    color: "hsl(0 84% 60% / 0.1)",
  },
  {
    category: "Unterricht & Lerninhalte",
    title: "Themen-Verwaltung",
    description: "Lerneinheiten und Themen für Ihre Klassen organisieren",
    icon: BookOpen,
    path: "/teacher/themen",
    color: "hsl(270 70% 55% / 0.1)",
  },
  {
    category: "Unterricht & Lerninhalte",
    title: "Meine Wahlfächer",
    description: "Wahlfächer und Wahlfach-Aufgaben verwalten",
    icon: BookOpen,
    path: "/teacher/modules",
    color: "hsl(142 50% 45% / 0.1)",
  },
  {
    category: "Unterricht & Lerninhalte",
    title: "Skript-Generator",
    description: "KI-gestützte Skripte erstellen und verwalten",
    icon: FileCode,
    path: "/teacher/script-generator",
    color: "hsl(189 70% 42% / 0.1)",
  },
  {
    category: "Unterricht & Lerninhalte",
    title: "Test-Generator",
    description: "Online-Tests erstellen und automatisch auswerten lassen",
    icon: ClipboardCheck,
    path: "/teacher/test-generator",
    color: "hsl(38 92% 50% / 0.1)",
  },
  {
    category: "Unterricht & Lerninhalte",
    title: "Offline-Tests",
    description: "PDF-Tests für Eltern zum Ausdrucken und Einreichen",
    icon: FileText,
    path: "/teacher/offline-tests",
    color: "hsl(350 70% 55% / 0.1)",
  },
  {
    category: "Bewertung & Noten",
    title: "Themennoten-Generierung",
    description: "Automatische Notenvergabe basierend auf Hausaufgaben-Erledigungsrate",
    icon: Calculator,
    path: "/teacher/theme-grading",
    color: "hsl(173 58% 39% / 0.1)",
  },
  {
    category: "Bewertung & Noten",
    title: "Notenbuch (Gradebook)",
    description: "Noten verwalten und Leistungen überwachen",
    icon: GraduationCap,
    path: "/teacher/gradebook",
    color: "hsl(330 70% 55% / 0.1)",
  },
  {
    category: "Bewertung & Noten",
    title: "Zeugnisse prüfen",
    description: "Noten für Ihre Fächer prüfen und bestätigen",
    icon: ScrollText,
    path: "/teacher/zeugnisse",
    color: "hsl(84 60% 45% / 0.1)",
  },
  {
    category: "Verwaltung & Kommunikation",
    title: "Verwaltungsaufgaben",
    description: "Admin-Aufgaben und Aufgaben-Status verwalten",
    icon: ClipboardList,
    path: "/teacher/admin-tasks",
    color: "hsl(24 90% 55% / 0.1)",
    badge: true,
  },
  {
    category: "Verwaltung & Kommunikation",
    title: "Nachricht Senden",
    description: "Benachrichtigungen an Schüler und Eltern senden",
    icon: Bell,
    path: "/send-notification",
    color: "hsl(48 90% 50% / 0.1)",
  },
  {
    category: "Verwaltung & Kommunikation",
    title: "Schülerübersicht",
    description: "Alle Aufgaben eines Schülers übersichtlich anzeigen",
    icon: UserCheck,
    path: "/teacher/student-overview",
    color: "hsl(239 70% 55% / 0.1)",
  },
  {
    category: "Verwaltung & Kommunikation",
    title: "Dateimanager",
    description: "Dateien und Ordner verwalten, mit Klassen teilen",
    icon: FolderOpen,
    path: "/filemanager",
    color: "hsl(160 50% 40% / 0.1)",
  },
];

function TeacherHome({ user }) {
  const nav = useNavigate();
  const groups = TEACHER_TILES.reduce((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {});
  return (
    <>
      <div className="welcome">
        <h2>Willkommen, {user.name}</h2>
        <p>Wählen Sie einen Bereich aus, um zu beginnen</p>
      </div>
      <div className="groups">
        {Object.entries(groups).map(([cat, tiles]) => (
          <section key={cat}>
            <div className="group-head">
              <h3>{cat}</h3>
              <div className="gold-bar" />
            </div>
            <div className="grid-3">
              {tiles.map((t) => {
                const Icon = t.icon;
                return (
                  <article key={t.path} className="card" onClick={() => nav(t.path)}>
                    <div className="card-h">
                      <h3>
                        <span className="ico">
                          <Icon size={20} />
                        </span>
                        <span>{t.title}</span>
                        {t.badge ? <span className="badge gold">3</span> : null}
                      </h3>
                      <p className="desc">{t.description}</p>
                    </div>
                    <div className="wash" style={{ background: `linear-gradient(to bottom left, ${t.color}, transparent)` }} />
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

const STUDENT_TILES = [
  {
    title: "Meine Klassenräume",
    desc: "Virtuelle Räume, Stundenpläne & Ferienpläne",
    body: "Tritt hier deinen virtuellen Klassenräumen bei.",
    icon: Video,
    path: "/student/classrooms",
  },
  {
    title: "Meine Hausaufgaben",
    desc: "Bearbeite und verwalte deine Klassen-Hausaufgaben",
    body: "Hier findest du alle regulären Hausaufgaben, die dir von deinen Lehrern zugewiesen wurden.",
    icon: BookOpen,
    path: "/student/homework",
  },
  {
    title: "Meine Wahlfach-Aufgaben",
    desc: "Bearbeite deine individuellen Wahlfach-Aufgaben",
    body: "Hier findest du alle Aufgaben aus deinen persönlichen Wahlfächern.",
    icon: ClipboardList,
    path: "/student/modules",
  },
  {
    title: "Meine Kurse",
    desc: "Durcharbeite interaktive Kurse und Skripte",
    body: "Hier findest du alle Kurse, die dir zugewiesen wurden.",
    icon: BookOpen,
    path: "/student/courses",
  },
  {
    title: "Mein Notenbuch",
    desc: "Übersicht deiner Noten und Leistungen",
    body: "Hier siehst du alle deine Noten nach Fächern und Themen sortiert.",
    icon: GraduationCap,
    path: "/student/gradebook",
  },
  {
    title: "Meine Zeugnisse",
    desc: "Freigegebene Zeugnisse einsehen",
    body: "Hier findest du alle Zeugnisse, die von der Schulleitung freigegeben wurden.",
    icon: FileText,
    path: "/student/zeugnisse",
  },
  {
    title: "Meine Tests",
    desc: "Online-Tests und Prüfungen",
    body: "Hier findest du alle Tests, die für dich freigegeben wurden.",
    icon: FileCheck,
    path: "/student/tests",
  },
  {
    title: "Dateimanager",
    desc: "Dateien und Dokumente anzeigen",
    body: "Hier findest du freigegebene Dateien und Dokumente.",
    icon: FolderOpen,
    path: "/filemanager",
  },
];

function StudentHome({ user }) {
  const nav = useNavigate();
  return (
    <>
      <div className="welcome">
        <h2>Willkommen, {user.name}</h2>
        <p>Wähle einen Bereich aus, um mit deinen Aufgaben zu beginnen.</p>
      </div>
      <div className="grid-2" style={{ marginTop: 32 }}>
        {STUDENT_TILES.map((t) => {
          const Icon = t.icon;
          return (
            <article key={t.path} className="card" onClick={() => nav(t.path)}>
              <div className="card-h">
                <div className="ico lg">
                  <Icon size={32} />
                </div>
                <h3>{t.title}</h3>
                <p className="desc" style={{ fontSize: 16 }}>
                  {t.desc}
                </p>
              </div>
              <div className="card-b">
                <p className="desc">{t.body}</p>
                <button className="btn block" type="button">
                  Öffnen
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function Back({ to, label = "Zurück zum Dashboard" }) {
  const nav = useNavigate();
  return (
    <button className="btn ghost back" type="button" onClick={() => nav(to)}>
      ← {label}
    </button>
  );
}

function Empty({ title, text }) {
  return (
    <div className="empty">
      <h1>{title}</h1>
      <p>{text || "Noch keine Einträge vorhanden."}</p>
    </div>
  );
}

function HomeworkTeacher({ user }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Mathematik");
  const [due, setDue] = useState("2026-08-28");
  const [text, setText] = useState("");
  const db = getDb();
  const nav = useNavigate();
  return (
    <>
      <Back to="/teacher" />
      <h1>Hausaufgaben-Management</h1>
      <p className="muted">Hausaufgaben erstellen, bearbeiten und Schüler-Abgaben verwalten</p>
      <form
        className="hw"
        style={{ marginTop: 16 }}
        onSubmit={(e) => {
          e.preventDefault();
          addHomework({ title, subject, due, text, createdBy: user.id });
          setTitle("");
          setText("");
        }}
      >
        <h3>Neue Aufgabe</h3>
        <div className="stack">
          <label className="field">
            Titel
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className="field">
            Fach
            <input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </label>
          <label className="field">
            Fällig
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </label>
          <label className="field">
            Text
            <textarea value={text} onChange={(e) => setText(e.target.value)} />
          </label>
          <button className="btn" type="submit">
            Anlegen
          </button>
        </div>
      </form>
      <div className="stack" style={{ marginTop: 24 }}>
        {db.homework.map((h) => (
          <article key={h.id} className="hw" style={{ cursor: "pointer" }} onClick={() => nav(`/teacher/homework/${h.id}`)}>
            <h3>{h.title}</h3>
            <p className="muted">
              {h.subject} · bis {h.due}
            </p>
            <p>{h.text}</p>
          </article>
        ))}
      </div>
    </>
  );
}

function HomeworkTeacherDetail() {
  const { id } = useParams();
  const db = getDb();
  const h = db.homework.find((x) => x.id === id);
  const subs = db.submissions.filter((s) => s.homeworkId === id);
  const [grade, setGrade] = useState("80");
  const [feedback, setFeedback] = useState("Gute Arbeit.");
  if (!h) return <p>Nicht gefunden.</p>;
  return (
    <>
      <Back to="/teacher/homework" label="Zurück zu Hausaufgaben" />
      <h1>{h.title}</h1>
      <p className="muted">{h.text}</p>
      <table style={{ marginTop: 16 }}>
        <thead>
          <tr>
            <th>Schüler</th>
            <th>Status</th>
            <th>Datei</th>
            <th>Note</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>
          {subs.map((s) => {
            const stu = db.users.find((u) => u.id === s.studentId);
            return (
              <tr key={s.id}>
                <td>{stu?.name}</td>
                <td>{s.status}</td>
                <td>{s.fileName || "–"}</td>
                <td>{s.grade ?? "–"}</td>
                <td>
                  <button className="btn" type="button" onClick={() => gradeHomework(s.id, grade, feedback)}>
                    Bewerten
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="row" style={{ marginTop: 12 }}>
        <label className="field">
          Note %
          <input value={grade} onChange={(e) => setGrade(e.target.value)} style={{ width: 80 }} />
        </label>
        <label className="field">
          Feedback
          <input value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        </label>
      </p>
    </>
  );
}

function HomeworkStudent({ user }) {
  const db = getDb();
  const sid = viewStudentId(user);
  const mine = db.submissions.filter((s) => s.studentId === sid);
  const [tab, setTab] = useState("aktuell");
  const rows = mine.filter((s) => (tab === "archiv" ? s.status === "Bewertet" : s.status !== "Bewertet"));
  return (
    <>
      <Back to={homePath(user)} />
      <h1>Meine Hausaufgaben</h1>
      <div className="tabs">
        <button type="button" className={tab === "aktuell" ? "on" : ""} onClick={() => setTab("aktuell")}>
          Aktuell ({mine.filter((s) => s.status !== "Bewertet").length})
        </button>
        <button type="button" className={tab === "archiv" ? "on" : ""} onClick={() => setTab("archiv")}>
          <Archive size={14} /> Archiv ({mine.filter((s) => s.status === "Bewertet").length})
        </button>
      </div>
      {rows.map((s) => {
        const h = db.homework.find((x) => x.id === s.homeworkId);
        if (!h) return null;
        return (
          <article className="hw" key={s.id}>
            <h3>{h.title}</h3>
            <p className="muted">
              {h.subject} · bis {h.due} · <span className="badge">{s.status}</span>
            </p>
            <p>{h.text}</p>
            {s.status === "Offen" ? (
              <button className="btn" type="button" onClick={() => submitHomework(h.id, sid, "abgabe.pdf")}>
                PDF einreichen
              </button>
            ) : (
              <p className="ok">
                {s.status}
                {s.grade != null ? ` · ${s.grade}%` : ""} {s.feedback}
              </p>
            )}
          </article>
        );
      })}
      {rows.length === 0 ? <p className="muted">Keine Hausaufgaben in dieser Ansicht.</p> : null}
    </>
  );
}

function Chat({ user }) {
  const db = getDb();
  const rooms = db.rooms.filter((r) => r.members.includes(user.id));
  const [active, setActive] = useState(rooms[0]?.id);
  const [text, setText] = useState("");
  const msgs = db.messages.filter((m) => m.roomId === active);
  useEffect(() => {
    if (active) markRoomRead(user.id, active);
  }, [active, user.id, msgs.length]);
  const name = (id) => db.users.find((u) => u.id === id)?.name || id;
  const home = homePath(user);
  return (
    <>
      <Back to={home} />
      <h1>Nachrichten</h1>
      <div className="split" style={{ marginTop: 16 }}>
        <div className="list">
          <p className="muted">Klassenräume</p>
          {rooms.map((r) => (
            <button key={r.id} type="button" className={r.id === active ? "active" : ""} onClick={() => setActive(r.id)}>
              {r.name}
            </button>
          ))}
        </div>
        <div className="thread">
          {msgs.map((m) => (
            <div className="msg" key={m.id}>
              <strong>{name(m.senderId)}</strong>
              <div>{m.text}</div>
              <div className="muted">{new Date(m.createdAt).toLocaleString("de-DE")}</div>
            </div>
          ))}
          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim() || !active) return;
              sendMessage(active, user.id, text.trim());
              setText("");
            }}
          >
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nachricht eingeben…" />
            <button className="btn" type="submit">
              Senden
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function Grades({ user }) {
  const db = getDb();
  const sid = viewStudentId(user);
  const rows = user.role === "lehrer" ? db.grades : db.grades.filter((g) => g.studentId === sid);
  const home = homePath(user);
  return (
    <>
      <Back to={home} />
      <h1>Notenbuch</h1>
      {rows.length === 0 ? (
        <p className="muted" style={{ marginTop: 16 }}>
          Noch keine Noten vorhanden.
        </p>
      ) : (
        <table style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Schüler</th>
              <th>Fach</th>
              <th>Titel</th>
              <th>%</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((g) => (
              <tr key={g.id}>
                <td>{db.users.find((u) => u.id === g.studentId)?.name}</td>
                <td>{g.subject}</td>
                <td>{g.title}</td>
                <td>{g.percent}</td>
                <td>{g.letter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function Files({ user }) {
  const db = getDb();
  const [name, setName] = useState("Arbeitsblatt.pdf");
  const home = homePath(user);
  return (
    <>
      <Back to={home} />
      <h1>Dateimanager</h1>
      <p className="muted">Allgemeine Infos, Bibliothek, Leistungsbewertung, Organisatorisches</p>
      {user.role === "lehrer" ? (
        <form
          className="row"
          style={{ margin: "16px 0" }}
          onSubmit={(e) => {
            e.preventDefault();
            addFile(name, "Unterricht", user.id);
          }}
        >
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn" type="submit">
            Datei anlegen
          </button>
        </form>
      ) : null}
      <ul className="stack">
        {db.files.map((f) => (
          <li key={f.id} className="hw">
            {f.folder} / {f.name}
          </li>
        ))}
      </ul>
    </>
  );
}

function Notify() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <>
      <Back to="/teacher" />
      <h1>Nachricht senden</h1>
      <p className="muted">Benachrichtigungen an Schüler und Eltern senden</p>
      <form
        className="hw"
        style={{ marginTop: 16 }}
        onSubmit={(e) => {
          e.preventDefault();
          sendNotice(title, body);
          setTitle("");
          setBody("");
          setSent(true);
        }}
      >
        <label className="field">
          Titel
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="field" style={{ marginTop: 12 }}>
          Text
          <textarea value={body} onChange={(e) => setBody(e.target.value)} required />
        </label>
        <p style={{ marginTop: 12 }}>
          <button className="btn" type="submit">
            Senden
          </button>
        </p>
        {sent ? <p className="ok">Nachricht gesendet.</p> : null}
      </form>
    </>
  );
}

function Rooms({ user }) {
  const db = getDb();
  const home = user.role === "lehrer" ? "/teacher" : "/student/dashboard";
  return (
    <>
      <Back to={home} />
      <h1>Klassenräume</h1>
      <p className="muted">Virtuelle Räume, Stundenpläne & Ferienpläne</p>
      <article className="hw" style={{ marginTop: 16 }}>
        <h3>{db.zoom.name}</h3>
        <p>
          <a className="btn" href={db.zoom.url} target="_blank" rel="noreferrer">
            Zoom öffnen
          </a>
        </p>
        <p className="muted">{db.zoom.note}</p>
      </article>
    </>
  );
}

function Profile({ user }) {
  const home = homePath(user);
  const roleLabel = user.role === "lehrer" ? "Lehrer" : user.role === "eltern" ? "Elternteil" : "Schüler";
  return (
    <>
      <Back to={home} />
      <h1>Mein Profil</h1>
      <article className="hw" style={{ marginTop: 16 }}>
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>E-Mail:</strong> {user.email}
        </p>
        <p>
          <strong>Rolle:</strong> {roleLabel}
        </p>
        {user.className ? (
          <p>
            <strong>Klasse:</strong> {user.className}
          </p>
        ) : null}
      </article>
    </>
  );
}

function Stub({ user, title, text }) {
  const home = user.role === "lehrer" ? "/teacher" : "/student/dashboard";
  return (
    <>
      <Back to={home} />
      <Empty title={title} text={text} />
    </>
  );
}

function TeacherShell({ user, setUser, children }) {
  return (
    <Guard user={user} role="lehrer">
      <Shell user={user} setUser={setUser} label="Lehrer-Dashboard">
        {children}
      </Shell>
    </Guard>
  );
}

function StudentShell({ user, setUser, children }) {
  return (
    <Guard user={user} role="schueler">
      <Shell user={user} setUser={setUser} label="Schüler Dashboard">
        {children}
      </Shell>
    </Guard>
  );
}

function ParentShell({ user, setUser, children }) {
  return (
    <Guard user={user} role="eltern">
      <Shell user={user} setUser={setUser} label="Eltern-Dashboard">
        {children}
      </Shell>
    </Guard>
  );
}

export default function App() {
  const { user, setUser, ready } = useUser();
  if (!ready) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="hdr">
            <p className="lede">Laden …</p>
          </div>
        </div>
      </div>
    );
  }
  const home = homePath(user);

  return (
    <ErrorBoundary>
    <Routes>
      <Route path="/login" element={<Login user={user} setUser={setUser} />} />
      <Route path="/teacher" element={<TeacherShell user={user} setUser={setUser}><TeacherHome user={user} /></TeacherShell>} />
      <Route path="/teacher/classrooms" element={<TeacherShell user={user} setUser={setUser}><RoomsFull user={user} /></TeacherShell>} />
      <Route path="/teacher/rooms" element={<Navigate to="/teacher/classrooms" replace />} />
      <Route path="/teacher/homework" element={<TeacherShell user={user} setUser={setUser}><HomeworkTeacher user={user} /></TeacherShell>} />
      <Route path="/teacher/homework/:id" element={<TeacherShell user={user} setUser={setUser}><HomeworkTeacherDetail /></TeacherShell>} />
      <Route path="/teacher/homework-questions" element={<TeacherShell user={user} setUser={setUser}><HomeworkQuestions user={user} /></TeacherShell>} />
      <Route path="/teacher/themen" element={<TeacherShell user={user} setUser={setUser}><Topics /></TeacherShell>} />
      <Route path="/teacher/modules" element={<TeacherShell user={user} setUser={setUser}><ModulesTeacher /></TeacherShell>} />
      <Route path="/teacher/script-generator" element={<TeacherShell user={user} setUser={setUser}><Scripts /></TeacherShell>} />
      <Route path="/teacher/test-generator" element={<TeacherShell user={user} setUser={setUser}><TestsTeacher /></TeacherShell>} />
      <Route path="/teacher/offline-tests" element={<TeacherShell user={user} setUser={setUser}><OfflineTeacher /></TeacherShell>} />
      <Route path="/teacher/theme-grading" element={<TeacherShell user={user} setUser={setUser}><ThemeGrading /></TeacherShell>} />
      <Route path="/teacher/gradebook" element={<TeacherShell user={user} setUser={setUser}><Grades user={user} /></TeacherShell>} />
      <Route path="/teacher/grades" element={<Navigate to="/teacher/gradebook" replace />} />
      <Route path="/teacher/zeugnisse" element={<TeacherShell user={user} setUser={setUser}><ReportsTeacher /></TeacherShell>} />
      <Route path="/teacher/admin-tasks" element={<TeacherShell user={user} setUser={setUser}><AdminTasks /></TeacherShell>} />
      <Route path="/send-notification" element={<TeacherShell user={user} setUser={setUser}><Notify /></TeacherShell>} />
      <Route path="/teacher/notify" element={<Navigate to="/send-notification" replace />} />
      <Route path="/teacher/student-overview" element={<TeacherShell user={user} setUser={setUser}><StudentOverview /></TeacherShell>} />
      <Route path="/teacher/profile" element={<TeacherShell user={user} setUser={setUser}><Profile user={user} /></TeacherShell>} />
      <Route path="/teacher/files" element={<Navigate to="/filemanager" replace />} />
      <Route path="/teacher/chat" element={<Navigate to="/chat" replace />} />

      <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
      <Route path="/student/dashboard" element={<StudentShell user={user} setUser={setUser}><StudentHome user={user} /></StudentShell>} />
      <Route path="/student/classrooms" element={<StudentShell user={user} setUser={setUser}><RoomsFull user={user} /></StudentShell>} />
      <Route path="/student/homework" element={<StudentShell user={user} setUser={setUser}><HomeworkStudent user={user} /></StudentShell>} />
      <Route path="/student/modules" element={<StudentShell user={user} setUser={setUser}><ModulesStudent user={user} /></StudentShell>} />
      <Route path="/student/courses" element={<StudentShell user={user} setUser={setUser}><Courses user={user} /></StudentShell>} />
      <Route path="/student/gradebook" element={<StudentShell user={user} setUser={setUser}><Grades user={user} /></StudentShell>} />
      <Route path="/student/grades" element={<Navigate to="/student/gradebook" replace />} />
      <Route path="/student/zeugnisse" element={<StudentShell user={user} setUser={setUser}><ReportsStudent user={user} /></StudentShell>} />
      <Route path="/student/tests" element={<StudentShell user={user} setUser={setUser}><TestsStudent user={user} /></StudentShell>} />
      <Route path="/student/offline-tests" element={<StudentShell user={user} setUser={setUser}><OfflineStudent user={user} /></StudentShell>} />
      <Route path="/student/profile" element={<StudentShell user={user} setUser={setUser}><Profile user={user} /></StudentShell>} />
      <Route path="/student/files" element={<Navigate to="/filemanager" replace />} />
      <Route path="/student/chat" element={<Navigate to="/chat" replace />} />

      <Route
        path="/parent"
        element={
          <ParentShell user={user} setUser={setUser}>
            <ParentHome user={user} />
          </ParentShell>
        }
      />
      <Route
        path="/parent/child/:id"
        element={
          <ParentShell user={user} setUser={setUser}>
            <ParentChild user={user} />
          </ParentShell>
        }
      />
      <Route path="/parent/homework" element={<ParentShell user={user} setUser={setUser}><HomeworkStudent user={user} /></ParentShell>} />
      <Route path="/parent/offline-tests" element={<ParentShell user={user} setUser={setUser}><OfflineStudent user={user} /></ParentShell>} />
      <Route path="/parent/modules" element={<ParentShell user={user} setUser={setUser}><ModulesStudent user={user} /></ParentShell>} />
      <Route path="/parent/gradebook" element={<ParentShell user={user} setUser={setUser}><Grades user={user} /></ParentShell>} />
      <Route path="/parent/zeugnisse" element={<ParentShell user={user} setUser={setUser}><ReportsStudent user={user} /></ParentShell>} />
      <Route path="/parent/classrooms" element={<ParentShell user={user} setUser={setUser}><ScheduleBoard user={user} /></ParentShell>} />
      <Route
        path="/parent/child/:id/classrooms"
        element={
          <ParentShell user={user} setUser={setUser}>
            <ScheduleBoard user={user} />
          </ParentShell>
        }
      />
      <Route path="/parent/profile" element={<ParentShell user={user} setUser={setUser}><Profile user={user} /></ParentShell>} />
      <Route path="/parent/zahlungen" element={<ParentShell user={user} setUser={setUser}><Payments /></ParentShell>} />

      <Route
        path="/filemanager"
        element={
          <Guard user={user}>
            <Shell
              user={user}
              setUser={setUser}
              label={user?.role === "lehrer" ? "Lehrer-Dashboard" : user?.role === "eltern" ? "Eltern-Dashboard" : "Schüler Dashboard"}
            >
              <Files user={user} />
            </Shell>
          </Guard>
        }
      />
      <Route
        path="/chat"
        element={
          <Guard user={user}>
            <Shell
              user={user}
              setUser={setUser}
              label={user?.role === "lehrer" ? "Lehrer-Dashboard" : user?.role === "eltern" ? "Eltern-Dashboard" : "Schüler Dashboard"}
            >
              <Chat user={user} />
            </Shell>
          </Guard>
        }
      />
      <Route path="/" element={<Navigate to={home} replace />} />
      <Route path="*" element={<Navigate to={home} replace />} />
    </Routes>
    </ErrorBoundary>
  );
}
