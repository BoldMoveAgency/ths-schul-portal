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
  Award,
  Bell,
  BookOpen,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileCheck,
  FileCode,
  FileText,
  FolderOpen,
  GraduationCap,
  List,
  LogOut,
  MessageCircle,
  MessageSquare,
  Moon,
  Plus,
  ScrollText,
  Search,
  Send,
  Sun,
  TriangleAlert,
  Upload,
  User,
  UserCheck,
  Video,
} from "lucide-react";
import {
  addCourseRoom,
  addDirectRoom,
  addFile,
  addHomework,
  askQuestion,
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

function formatDE(iso) {
  if (!iso) return "–";
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  if (!d) return iso;
  return `${d}.${m}.${y}`;
}

function letterFromPercent(n) {
  const p = Number(n);
  if (!Number.isFinite(p)) return "–";
  if (p >= 90) return "A";
  if (p >= 80) return "B";
  if (p >= 70) return "C";
  if (p >= 60) return "D";
  return "F";
}

function statusClass(status) {
  if (status === "Offen") return "st-open";
  if (status === "Eingereicht") return "st-in";
  if (status === "Bewertet") return "st-ok";
  if (status === "Erledigt") return "st-done";
  if (status === "Überarbeitung nötig") return "st-rev";
  return "";
}

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
  const [openForm, setOpenForm] = useState(false);
  const [tab, setTab] = useState("aktuell");
  const db = getDb();
  const nav = useNavigate();
  const rows = db.homework.map((h) => {
    const subs = db.submissions.filter((s) => s.homeworkId === h.id);
    const done = subs.filter((s) => s.status !== "Offen").length;
    return { h, subs, done, total: subs.length };
  });
  const shown = rows.filter((r) => (tab === "archiv" ? r.done === r.total && r.total > 0 : !(r.done === r.total && r.total > 0)));
  return (
    <>
      <Back to="/teacher" />
      <div className="page-head">
        <div>
          <h1>Hausaufgaben-Management</h1>
          <p className="muted">Hausaufgaben erstellen, bearbeiten und Schüler-Abgaben verwalten</p>
        </div>
        <button className="btn" type="button" onClick={() => setOpenForm((v) => !v)}>
          Neue Aufgabe
        </button>
      </div>
      <div className="tabs">
        <button type="button" className={tab === "aktuell" ? "on" : ""} onClick={() => setTab("aktuell")}>
          Aktuell ({rows.filter((r) => !(r.done === r.total && r.total > 0)).length})
        </button>
        <button type="button" className={tab === "archiv" ? "on" : ""} onClick={() => setTab("archiv")}>
          <Archive size={14} /> Archiv
        </button>
      </div>
      {openForm ? (
        <form
          className="hw"
          style={{ marginTop: 16 }}
          onSubmit={(e) => {
            e.preventDefault();
            addHomework({ title, subject, due, text, createdBy: user.id });
            setTitle("");
            setText("");
            setOpenForm(false);
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
              Fälligkeit
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </label>
            <label className="field">
              Aufgabenstellung
              <textarea value={text} onChange={(e) => setText(e.target.value)} />
            </label>
            <button className="btn" type="submit">
              Anlegen
            </button>
          </div>
        </form>
      ) : null}
      <div className="table-wrap" style={{ marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>Titel</th>
              <th>Fach</th>
              <th>Klasse/Zug</th>
              <th>Typ</th>
              <th>Fälligkeit</th>
              <th>Fortschritt</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={7} className="muted" style={{ textAlign: "center", padding: 32 }}>
                  Keine Hausaufgaben gefunden
                </td>
              </tr>
            ) : (
              shown.map(({ h, done, total }) => (
                <tr key={h.id}>
                  <td className="strong">{h.title}</td>
                  <td>
                    <span className="badge">{h.subject}</span>
                  </td>
                  <td className="muted">Klasse 11 a</td>
                  <td>
                    <span className="badge">Abgabe</span>
                  </td>
                  <td>{formatDE(h.due)}</td>
                  <td>
                    <div className="progress">
                      <span className="progress-bar" style={{ width: `${total ? Math.round((done / total) * 100) : 0}%` }} />
                    </div>
                    <span className="muted">
                      {done}/{total}
                    </span>
                  </td>
                  <td>
                    <button className="btn outline" type="button" onClick={() => nav(`/teacher/homework/${h.id}`)}>
                      Öffnen
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
  const done = subs.filter((s) => s.status !== "Offen").length;
  return (
    <>
      <Back to="/teacher/homework" label="Zurück zu Hausaufgaben" />
      <div className="page-head">
        <div>
          <h1>{h.title}</h1>
          <p className="muted">
            {h.subject} · Klasse 11 a · Fällig {formatDE(h.due)}
          </p>
        </div>
        <span className="badge">
          {done}/{subs.length} abgegeben
        </span>
      </div>
      <p className="brief">{h.text}</p>
      <div className="table-wrap" style={{ marginTop: 16 }}>
        <table>
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
                  <td className="strong">{stu?.name}</td>
                  <td>
                    <span className={`badge ${statusClass(s.status)}`}>{s.status}</span>
                  </td>
                  <td>{s.fileName || "–"}</td>
                  <td>{s.grade != null ? `${s.grade}%` : "–"}</td>
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
      </div>
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
  const parentView = user.role === "eltern";
  const teacher = db.users.find((u) => u.role === "lehrer");
  const rows = db.submissions
    .filter((s) => s.studentId === sid)
    .map((sub) => ({ sub, hw: db.homework.find((x) => x.id === sub.homeworkId) }))
    .filter((r) => r.hw);
  const [tab, setTab] = useState("aktuell");
  const [layout, setLayout] = useState("list");
  const [fach, setFach] = useState("all");
  const [status, setStatus] = useState("all");
  const [sel, setSel] = useState(rows[0]?.sub.id || null);
  const [fileName, setFileName] = useState("");
  const [comment, setComment] = useState("");
  const [question, setQuestion] = useState("");
  const archived = (st) => st === "Bewertet" || st === "Erledigt";
  const aktuell = rows.filter((r) => !archived(r.sub.status));
  const archiv = rows.filter((r) => archived(r.sub.status));
  const pool = tab === "archiv" ? archiv : aktuell;
  const subjects = [...new Set(pool.map((r) => r.hw.subject))];
  const filtered = pool.filter((r) => {
    if (fach !== "all" && r.hw.subject !== fach) return false;
    if (status !== "all" && r.sub.status !== status) return false;
    return true;
  });
  const selected = filtered.find((r) => r.sub.id === sel) || filtered[0] || null;
  const count = (st) => pool.filter((r) => r.sub.status === st).length;
  const qs = selected ? db.questions.filter((q) => q.homeworkId === selected.hw.id && q.studentId === sid) : [];
  const groups = tab === "archiv"
    ? [
        ["Bewertet", "Bewertet", CheckCircle2],
        ["Erledigt", "Erledigt", CheckCircle2],
      ]
    : [
        ["Offen", "Offene Aufgaben", Clock],
        ["Eingereicht", "Eingereicht", CheckCircle2],
        ["Überarbeitung nötig", "Überarbeitung nötig", TriangleAlert],
      ];

  return (
    <>
      <Back to={homePath(user)} />
      <div className="hw-split">
        <aside className="hw-side">
          <div className="hw-side-h">
            <h2>
              <FileText size={18} /> Meine Hausaufgaben
            </h2>
            <span className="muted">
              {filtered.length} von {pool.length} Hausaufgabe{pool.length === 1 ? "" : "n"}
            </span>
            <div className="tabs">
              <button type="button" className={tab === "aktuell" ? "on" : ""} onClick={() => { setTab("aktuell"); setStatus("all"); }}>
                Aktuell ({aktuell.length})
              </button>
              <button type="button" className={tab === "archiv" ? "on" : ""} onClick={() => { setTab("archiv"); setStatus("all"); }}>
                <Archive size={12} /> Archiv ({archiv.length})
              </button>
            </div>
            <div className="row">
              <button type="button" className={`btn ${layout === "list" ? "" : "outline"}`} style={{ height: 32, fontSize: 12, flex: 1 }} onClick={() => setLayout("list")}>
                <List size={12} /> Liste
              </button>
              <button type="button" className={`btn ${layout === "themen" ? "" : "outline"}`} style={{ height: 32, fontSize: 12, flex: 1 }} onClick={() => setLayout("themen")}>
                <BookOpen size={12} /> Themen
              </button>
            </div>
            <select value={fach} onChange={(e) => setFach(e.target.value)}>
              <option value="all">Alle Fächer</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="chip-row">
              <button type="button" className={status === "all" ? "mini on" : "mini"} onClick={() => setStatus("all")}>
                Alle
              </button>
              {(tab === "aktuell" ? ["Offen", "Eingereicht"] : ["Bewertet", "Erledigt"]).map((st) => (
                <button key={st} type="button" className={status === st ? "mini on" : "mini"} onClick={() => setStatus(st)}>
                  {st}
                  {count(st) ? <span className={`dot-n ${statusClass(st)}`}>{count(st)}</span> : null}
                </button>
              ))}
            </div>
          </div>
          <div className="hw-list">
            {filtered.length === 0 ? (
              <div className="empty">
                <FileText size={40} />
                <p>{pool.length === 0 ? (tab === "archiv" ? "Keine archivierten Hausaufgaben" : "Keine aktuellen Hausaufgaben") : "Keine Hausaufgaben für die gewählten Filter"}</p>
              </div>
            ) : layout === "themen" ? (
              subjects.filter((s) => fach === "all" || s === fach).map((s) => (
                <div key={s} className="hw-group">
                  <h3>
                    <BookOpen size={14} /> {s}
                  </h3>
                  {filtered.filter((r) => r.hw.subject === s).map((r) => (
                    <button
                      key={r.sub.id}
                      type="button"
                      className={`hw-item ${selected?.sub.id === r.sub.id ? "on" : ""}`}
                      onClick={() => setSel(r.sub.id)}
                    >
                      <strong>{r.hw.title}</strong>
                      <span className="muted">
                        <Calendar size={12} /> {formatDE(r.hw.due)}
                      </span>
                    </button>
                  ))}
                </div>
              ))
            ) : (
              groups.map(([st, label, Icon]) => {
                const items = filtered.filter((r) => r.sub.status === st);
                if (!items.length) return null;
                return (
                  <div key={st} className="hw-group">
                    <h3>
                      <Icon size={14} /> {label} ({items.length})
                    </h3>
                    {items.map((r) => (
                      <button
                        key={r.sub.id}
                        type="button"
                        className={`hw-item ${selected?.sub.id === r.sub.id ? "on" : ""}`}
                        onClick={() => setSel(r.sub.id)}
                      >
                        <strong>{r.hw.title}</strong>
                        <span>{r.hw.subject}</span>
                        <span className="muted">
                          <Calendar size={12} /> {formatDE(r.hw.due)}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </aside>
        <section className="hw-detail">
          {!selected ? (
            <div className="empty">
              <FileText size={48} />
              <p>Wählen Sie eine Hausaufgabe aus der Liste aus</p>
              <p className="muted">um Details zu sehen und Ihre Lösung einzureichen</p>
            </div>
          ) : (
            <>
              <article className="hw">
                <div className="page-head">
                  <div>
                    <h2>{selected.hw.title}</h2>
                    <p className="muted">
                      Klasse 11 a • {selected.hw.subject}
                    </p>
                  </div>
                  <span className={`badge ${statusClass(selected.sub.status)}`}>{selected.sub.status}</span>
                </div>
                <p className="muted" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
                  <Calendar size={16} /> Fällig: {formatDE(selected.hw.due)}
                </p>
                <h4>Aufgabenstellung:</h4>
                <p className="brief">{selected.hw.text}</p>
                <p className="muted">Erstellt von: {teacher?.name}</p>
                <div className="file-row">
                  <FileText size={16} />
                  <span>{selected.hw.title}.pdf</span>
                  <span className="muted">Arbeitsblatt</span>
                </div>
                {selected.sub.fileName ? (
                  <div>
                    <h4>Eingereichte Dateien:</h4>
                    <div className="file-row">
                      <FileText size={16} />
                      <span>{selected.sub.fileName}</span>
                    </div>
                  </div>
                ) : null}
                {selected.sub.status === "Eingereicht" ? (
                  <div className="note blue">
                    <CheckCircle2 size={18} />
                    <div>
                      <strong>Aufgabe eingereicht</strong>
                      <p>Nach der Abgabe sind keine Änderungen mehr möglich, bis dein Lehrer eine Überarbeitung anfordert.</p>
                    </div>
                  </div>
                ) : null}
                {selected.sub.status === "Bewertet" ? (
                  <div className="note green">
                    <Award size={18} />
                    <div>
                      <strong>Deine Bewertung</strong>
                      <p className="grade-lg">
                        {letterFromPercent(selected.sub.grade)} <span>{selected.sub.grade}%</span>
                      </p>
                      {selected.sub.feedback ? (
                        <>
                          <h4>Feedback vom Lehrer:</h4>
                          <p>{selected.sub.feedback}</p>
                        </>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </article>
              {!parentView && (selected.sub.status === "Offen" || selected.sub.status === "Überarbeitung nötig") ? (
                <article className="hw">
                  <h3>
                    <Upload size={18} /> Lösung einreichen
                  </h3>
                  <p className="muted">Laden Sie Ihre bearbeiteten Lösungsdateien hoch</p>
                  <label className="drop">
                    <Upload size={20} /> Mehrere Lösungsdateien auswählen
                    <input
                      type="file"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setFileName(f.name);
                      }}
                    />
                  </label>
                  <p className="muted">Unterstützte Formate: PDF, DOC, DOCX, JPG, PNG · Max. 10MB</p>
                  {fileName ? <p className="ok">Ausgewählt: {fileName}</p> : null}
                  <label className="field">
                    Kommentar zur Einreichung an den Lehrer (optional)
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Falls Sie dem Lehrer etwas mitteilen möchten…" />
                  </label>
                  <button
                    className="btn block"
                    type="button"
                    disabled={!fileName}
                    onClick={() => {
                      submitHomework(selected.hw.id, sid, fileName);
                      setFileName("");
                      setComment("");
                    }}
                  >
                    <Upload size={16} /> Datei einreichen
                  </button>
                  <details className="hw-chat">
                    <summary>
                      <MessageSquare size={16} /> Hausaufgaben Chat (Nachfrage an Lehrer)
                      {qs.length ? <span className="badge">{qs.length}</span> : null}
                    </summary>
                    {qs.map((q) => (
                      <div className="q-bubble" key={q.id}>
                        <p className="q-you">{q.text}</p>
                        {q.answer ? <p className="q-teacher">{q.answer}</p> : <p className="muted">Noch keine Antwort</p>}
                      </div>
                    ))}
                    <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Stelle hier deine Frage..." rows={3} />
                    <button
                      className="btn outline"
                      type="button"
                      disabled={!question.trim()}
                      onClick={() => {
                        askQuestion(selected.hw.id, sid, question.trim());
                        setQuestion("");
                      }}
                    >
                      Frage senden
                    </button>
                  </details>
                </article>
              ) : null}
              {parentView ? <p className="muted">Nur Leseansicht – Eltern können keine Abgaben senden.</p> : null}
            </>
          )}
        </section>
      </div>
    </>
  );
}

function Chat({ user }) {
  const db = getDb();
  const rooms = db.rooms.filter((r) => r.members.includes(user.id));
  const [active, setActive] = useState(null);
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState({ klasse: true, kurs: true, gruppe: true, direkt: true });
  const [dm, setDm] = useState(false);
  const [kursName, setKursName] = useState("");
  const [newKurs, setNewKurs] = useState(false);
  const msgs = db.messages.filter((m) => m.roomId === active);
  useEffect(() => {
    if (active) markRoomRead(user.id, active);
  }, [active, user.id, msgs.length]);
  const name = (id) => db.users.find((u) => u.id === id)?.name || id;
  const lastOf = (roomId) => db.messages.filter((m) => m.roomId === roomId).at(-1);
  const unreadOf = (roomId) => {
    const last = (db.reads[user.id] || {})[roomId] || "";
    return db.messages.filter((m) => m.roomId === roomId && m.createdAt > last && m.senderId !== user.id).length;
  };
  const match = (r) => !q || r.name.toLowerCase().includes(q.toLowerCase());
  const groups = [
    ["klasse", "Klassenräume", rooms.filter((r) => r.type === "klasse" && match(r))],
    ["kurs", "Kursräume", rooms.filter((r) => r.type === "kurs" && match(r))],
    ["direkt", "Direktnachrichten", rooms.filter((r) => r.type === "direkt" && match(r))],
  ];
  const room = rooms.find((r) => r.id === active);
  const others = db.users.filter((u) => u.id !== user.id && !rooms.some((r) => r.type === "direkt" && r.members.includes(u.id) && r.members.includes(user.id)));
  const home = homePath(user);
  return (
    <>
      <Back to={home} />
      <div className="chat-head">
        <h1>
          <MessageCircle size={22} /> Nachrichten
        </h1>
        <p className="muted">Klassengruppen & Direktnachrichten</p>
      </div>
      <div className="chat-shell">
        <aside className="chat-side">
          <div className="chat-side-h">
            <div className="row">
              {user.role === "lehrer" ? (
                <button className="icon-btn" type="button" title="Neuen Kursraum erstellen" onClick={() => setNewKurs(true)}>
                  <BookOpen size={16} />
                </button>
              ) : null}
              <button className="icon-btn" type="button" title="Neue Direktnachricht" onClick={() => setDm(true)}>
                <Plus size={16} />
              </button>
            </div>
            <label className="search">
              <Search size={14} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suchen..." />
            </label>
          </div>
          <div className="chat-rooms">
            {rooms.length === 0 ? <p className="muted">Keine Chats vorhanden</p> : null}
            {groups.map(([id, label, list]) =>
              list.length || id === "kurs" ? (
                <div key={id} className="chat-sec">
                  <button type="button" className="sec-h" onClick={() => setOpen((o) => ({ ...o, [id]: !o[id] }))}>
                    {open[id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    {label}
                  </button>
                  {open[id]
                    ? list.map((r) => {
                        const last = lastOf(r.id);
                        const n = unreadOf(r.id);
                        return (
                          <button key={r.id} type="button" className={`room-item ${active === r.id ? "on" : ""}`} onClick={() => setActive(r.id)}>
                            <span className="avatar">{initials(r.name)}</span>
                            <span className="room-meta">
                              <strong>{r.name}</strong>
                              <em>{last ? last.text : "Keine Nachrichten"}</em>
                            </span>
                            {n ? <span className="badge gold">{n}</span> : null}
                          </button>
                        );
                      })
                    : null}
                  {id === "kurs" && open[id] && list.length === 0 ? <p className="muted" style={{ padding: "0 12px" }}>Noch keine Kursräume erstellt</p> : null}
                </div>
              ) : null
            )}
          </div>
        </aside>
        <section className="chat-main">
          {!active ? (
            <div className="empty">
              <MessageCircle size={64} />
              <p>Wähle einen Chat aus</p>
              <p className="muted">oder starte eine neue Unterhaltung</p>
            </div>
          ) : (
            <>
              <div className="chat-main-h">
                <span className="avatar">{initials(room?.name)}</span>
                <div>
                  <strong>{room?.name}</strong>
                  <p className="muted">{room?.type === "klasse" ? "Klassenraum" : room?.type === "kurs" ? "Kursraum" : "Direktnachricht"}</p>
                </div>
              </div>
              <div className="bubbles">
                {msgs.map((m) => (
                  <div key={m.id} className={`bubble ${m.senderId === user.id ? "me" : ""}`}>
                    {m.senderId !== user.id ? <span className="who">{name(m.senderId)}</span> : null}
                    <p>{m.text}</p>
                    <time>{new Date(m.createdAt).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</time>
                  </div>
                ))}
              </div>
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
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </section>
      </div>
      {dm ? (
        <div className="modal-scrim" onClick={() => setDm(false)}>
          <article className="hw modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Neue Direktnachricht</h3>
            {others.length === 0 ? <p className="muted">Keine weiteren Empfänger.</p> : null}
            {others.map((u) => (
              <button
                key={u.id}
                className="hw-item"
                type="button"
                onClick={() => {
                  setActive(addDirectRoom(user.id, u.id));
                  setDm(false);
                }}
              >
                <strong>{u.name}</strong>
                <span>{u.role === "lehrer" ? "Lehrer" : u.role === "eltern" ? "Eltern" : "Schüler"}</span>
              </button>
            ))}
            <button className="btn outline" type="button" onClick={() => setDm(false)}>
              Abbrechen
            </button>
          </article>
        </div>
      ) : null}
      {newKurs ? (
        <div className="modal-scrim" onClick={() => setNewKurs(false)}>
          <article className="hw modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Neuen Kursraum erstellen</h3>
            <label className="field">
              Name
              <input value={kursName} onChange={(e) => setKursName(e.target.value)} />
            </label>
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn outline" type="button" onClick={() => setNewKurs(false)}>
                Abbrechen
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  if (!kursName.trim()) return;
                  setActive(addCourseRoom(kursName.trim(), user.id));
                  setKursName("");
                  setNewKurs(false);
                }}
              >
                Erstellen
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
}

function Grades({ user }) {
  const db = getDb();
  const sid = viewStudentId(user);
  const rows = user.role === "lehrer" ? db.grades : db.grades.filter((g) => g.studentId === sid);
  const home = homePath(user);
  const [tab, setTab] = useState("subjects");
  const bySubject = {};
  for (const g of rows) {
    (bySubject[g.subject] ||= []).push(g);
  }
  const subjects = Object.entries(bySubject);
  const byTopic = {};
  for (const g of rows) {
    const key = g.topic || g.title;
    (byTopic[key] ||= []).push(g);
  }
  const kindLabel = { hausaufgabe: "Hausaufgaben", thema: "Themennoten", manuell: "Manuelle Noten", online_test: "Online-Tests", offline_test: "Offline-Tests" };
  return (
    <>
      <Back to={home} />
      <div className="welcome plain">
        <h2 style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <GraduationCap size={32} /> Mein Notenbuch
        </h2>
        <p>Übersicht über alle deine Noten und Leistungen</p>
      </div>
      <div className="tabs" style={{ marginTop: 16 }}>
        <button type="button" className={tab === "subjects" ? "on" : ""} onClick={() => setTab("subjects")}>
          Nach Fächern
        </button>
        <button type="button" className={tab === "themes" ? "on" : ""} onClick={() => setTab("themes")}>
          Nach Themen
        </button>
      </div>
      {rows.length === 0 ? (
        <article className="hw">
          <p className="muted" style={{ textAlign: "center" }}>
            Noch keine Noten vorhanden
          </p>
        </article>
      ) : tab === "subjects" ? (
        subjects.map(([fach, notes]) => {
          const avg = Math.round(notes.reduce((a, g) => a + Number(g.percent || 0), 0) / notes.length);
          const groups = {};
          for (const g of notes) (groups[g.kind || "hausaufgabe"] ||= []).push(g);
          return (
            <article className="hw" key={fach}>
              <div className="page-head">
                <h3>{fach}</h3>
                <span className="badge">
                  Ø {avg}% · {notes.length} {notes.length === 1 ? "Note" : "Noten"}
                </span>
              </div>
              {Object.entries(groups).map(([kind, list]) => (
                <div key={kind} style={{ marginTop: 16 }}>
                  <h4 className="muted" style={{ textTransform: "uppercase", letterSpacing: "0.04em", fontSize: 12 }}>
                    {kindLabel[kind] || kind}
                  </h4>
                  {list.map((g) => (
                    <div className="grade-row" key={g.id}>
                      <div>
                        <p className="strong">{g.title}</p>
                        {g.topic ? <p className="muted">{g.topic}</p> : null}
                        <p className="muted">{formatDE(g.date)}</p>
                      </div>
                      <div className="grade-val">
                        <strong>{g.letter}</strong>
                        <span>{g.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </article>
          );
        })
      ) : (
        Object.entries(byTopic).map(([topic, list]) => (
          <article className="hw" key={topic}>
            <h3>{topic}</h3>
            {list.map((g) => (
              <div className="grade-row" key={g.id}>
                <div>
                  <p className="strong">{g.title}</p>
                  <p className="muted">{g.subject}</p>
                </div>
                <div className="grade-val">
                  <strong>{g.letter}</strong>
                  <span>{g.percent}%</span>
                </div>
              </div>
            ))}
          </article>
        ))
      )}
    </>
  );
}

function Files({ user }) {
  const db = getDb();
  const [name, setName] = useState("Arbeitsblatt.pdf");
  const folders = [...new Set(db.files.map((f) => f.folder))];
  const [folder, setFolder] = useState(folders[0] || "Allgemeine Infos");
  const home = homePath(user);
  const shown = db.files.filter((f) => f.folder === folder);
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
            addFile(name, folder, user.id);
          }}
        >
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn" type="submit">
            Datei anlegen
          </button>
        </form>
      ) : null}
      <div className="hw-split" style={{ marginTop: 16 }}>
        <aside className="hw-side">
          <div className="hw-side-h">
            <h2>
              <FolderOpen size={18} /> Ordner
            </h2>
          </div>
          <div className="hw-list">
            {folders.map((f) => (
              <button key={f} type="button" className={`hw-item ${folder === f ? "on" : ""}`} onClick={() => setFolder(f)}>
                <strong>{f}</strong>
                <span>{db.files.filter((x) => x.folder === f).length} Datei(en)</span>
              </button>
            ))}
          </div>
        </aside>
        <section>
          <article className="hw" style={{ marginTop: 0 }}>
            <h3>{folder}</h3>
            {shown.length === 0 ? <p className="muted">Keine Dateien in diesem Ordner.</p> : null}
            {shown.map((f) => (
              <div className="file-row" key={f.id}>
                <FileText size={16} />
                <span>{f.name}</span>
              </div>
            ))}
          </article>
        </section>
      </div>
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
      <h1>Nachricht Senden</h1>
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
      <article className="hw profile-card" style={{ marginTop: 16 }}>
        <div className="profile-top">
          <span className="avatar lg">{initials(user.name)}</span>
          <div>
            <h2>{user.name}</h2>
            <p className="muted">{roleLabel}</p>
          </div>
        </div>
        <dl className="profile-dl">
          <div>
            <dt>Name</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt>E-Mail</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Rolle</dt>
            <dd>{roleLabel}</dd>
          </div>
          {user.className ? (
            <div>
              <dt>Klasse</dt>
              <dd>{user.className}</dd>
            </div>
          ) : null}
        </dl>
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
