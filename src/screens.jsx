import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Globe,
  GraduationCap,
  HeartPulse,
  MessageCircle,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  addAbsence,
  addModule,
  addModuleTask,
  addOfflineTest,
  addReport,
  addScript,
  addTest,
  addTopic,
  answerQuestion,
  askQuestion,
  completeAdminTask,
  generateThemeGrade,
  getDb,
  gradeOffline,
  markPaymentPaid,
  releaseReport,
  submitModuleTask,
  submitOffline,
  submitTest,
} from "./store.js";

function Back({ to, label = "Zurück zum Dashboard" }) {
  const nav = useNavigate();
  return (
    <button className="btn ghost back" type="button" onClick={() => nav(to)}>
      ← {label}
    </button>
  );
}

function homeOf(user) {
  if (user.role === "lehrer") return "/teacher";
  if (user.role === "eltern") return "/parent";
  return "/student/dashboard";
}

export function HomeworkQuestions({ user }) {
  const db = getDb();
  const [answer, setAnswer] = useState("Ja. Dann bleibt x = ±sqrt(-c/a).");
  const open = db.questions.filter((q) => !q.answer);
  const done = db.questions.filter((q) => q.answer);
  return (
    <>
      <Back to="/teacher" />
      <h1>Offene Hausaufgaben-Fragen</h1>
      <p className="muted">Alle unbeantworteten Schülerfragen im Überblick</p>
      {open.length === 0 ? <p className="muted">Keine unbeantworteten Schülerfragen.</p> : null}
      {open.map((q) => {
        const h = db.homework.find((x) => x.id === q.homeworkId);
        const s = db.users.find((u) => u.id === q.studentId);
        return (
          <article className="hw" key={q.id}>
            <h3>{h?.title}</h3>
            <p className="muted">{s?.name}</p>
            <p>{q.text}</p>
            <div className="row">
              <input value={answer} onChange={(e) => setAnswer(e.target.value)} />
              <button className="btn" type="button" onClick={() => answerQuestion(q.id, answer)}>
                Antworten
              </button>
            </div>
          </article>
        );
      })}
      {done.map((q) => (
        <article className="hw" key={q.id}>
          <p>
            <strong>Frage:</strong> {q.text}
          </p>
          <p className="ok">Antwort: {q.answer}</p>
        </article>
      ))}
    </>
  );
}

export function StudentAsk({ user }) {
  const db = getDb();
  const [text, setText] = useState("");
  const hw = db.homework[0];
  const mine = db.questions.filter((q) => q.studentId === user.id);
  return (
    <>
      <Back to={homeOf(user)} />
      <h1>Nachfrage stellen</h1>
      <form
        className="hw"
        onSubmit={(e) => {
          e.preventDefault();
          if (!hw || !text.trim()) return;
          askQuestion(hw.id, user.id, text.trim());
          setText("");
        }}
      >
        <label className="field">
          Frage zu {hw?.title}
          <textarea value={text} onChange={(e) => setText(e.target.value)} required />
        </label>
        <p>
          <button className="btn" type="submit">
            Senden
          </button>
        </p>
      </form>
      {mine.map((q) => (
        <article className="hw" key={q.id}>
          <p>{q.text}</p>
          <p className="muted">{q.answer || "Noch keine Antwort."}</p>
        </article>
      ))}
    </>
  );
}

export function Topics() {
  const db = getDb();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("Mathematik");
  return (
    <>
      <Back to="/teacher" />
      <h1>Themen-Verwaltung</h1>
      <form
        className="hw"
        onSubmit={(e) => {
          e.preventDefault();
          addTopic({ name, subject, quarter: "Q3" });
          setName("");
        }}
      >
        <div className="row">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Thema" required />
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Fach" />
          <button className="btn" type="submit">
            Anlegen
          </button>
        </div>
      </form>
      {db.topics.map((t) => (
        <article className="hw" key={t.id}>
          <h3>{t.name}</h3>
          <p className="muted">
            {t.subject} · {t.quarter}
          </p>
        </article>
      ))}
    </>
  );
}

export function ModulesTeacher() {
  const db = getDb();
  const [name, setName] = useState("Wahlfach Kunst");
  const [task, setTask] = useState("Skizze einreichen");
  return (
    <>
      <Back to="/teacher" />
      <h1>Meine Wahlfächer</h1>
      <form
        className="hw"
        onSubmit={(e) => {
          e.preventDefault();
          addModule(name);
          setName("");
        }}
      >
        <div className="row">
          <input value={name} onChange={(e) => setName(e.target.value)} required />
          <button className="btn" type="submit">
            Wahlfach anlegen
          </button>
        </div>
      </form>
      {db.modules.map((m) => (
        <article className="hw" key={m.id}>
          <h3>{m.name}</h3>
          <p className="muted">{db.moduleTasks.filter((t) => t.moduleId === m.id).length} Aufgaben</p>
          <div className="row">
            <input value={task} onChange={(e) => setTask(e.target.value)} />
            <button className="btn" type="button" onClick={() => addModuleTask({ moduleId: m.id, title: task, due: "2026-09-01" })}>
              Aufgabe zuweisen
            </button>
          </div>
        </article>
      ))}
    </>
  );
}

export function ModulesStudent({ user }) {
  const db = getDb();
  const sid = user.role === "eltern" ? user.childId : user.id;
  const mine = db.moduleTasks.filter((t) => t.studentId === sid);
  return (
    <>
      <Back to={homeOf(user)} />
      <h1>Meine Wahlfach-Aufgaben</h1>
      {mine.length === 0 ? <p className="muted">0 Aufgaben.</p> : null}
      {mine.map((t) => {
        const mod = db.modules.find((m) => m.id === t.moduleId);
        return (
          <article className="hw" key={t.id}>
            <h3>{t.title}</h3>
            <p className="muted">
              {mod?.name} · bis {t.due} · {t.status}
            </p>
            {t.status === "Offen" ? (
              <button className="btn" type="button" onClick={() => submitModuleTask(t.id)}>
                Einreichen
              </button>
            ) : (
              <p className="ok">Eingereicht</p>
            )}
          </article>
        );
      })}
    </>
  );
}

export function Scripts() {
  const db = getDb();
  const [title, setTitle] = useState("Neues Skript");
  const [subject, setSubject] = useState("Mathematik");
  return (
    <>
      <Back to="/teacher" />
      <h1>Skript-Generator</h1>
      <p className="muted">Erzeugt ein Demo-Skript lokal. Kein externes Modell.</p>
      <form
        className="hw"
        onSubmit={(e) => {
          e.preventDefault();
          addScript({ title, subject });
        }}
      >
        <div className="row">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input value={subject} onChange={(e) => setSubject(e.target.value)} />
          <button className="btn" type="submit">
            Skript erzeugen
          </button>
        </div>
      </form>
      {db.scripts.map((s) => (
        <article className="hw" key={s.id}>
          <h3>{s.title}</h3>
          <p className="muted">{s.subject}</p>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{s.body}</pre>
        </article>
      ))}
    </>
  );
}

export function TestsTeacher() {
  const db = getDb();
  const [title, setTitle] = useState("Kurztest");
  return (
    <>
      <Back to="/teacher" />
      <h1>Test-Generator</h1>
      <form
        className="hw"
        onSubmit={(e) => {
          e.preventDefault();
          addTest({
            title,
            subject: "Mathematik",
            questions: [
              { q: "2 + 2 = ?", options: ["3", "4", "5"], answer: 1 },
              { q: "Wurzel aus 16?", options: ["2", "4", "8"], answer: 1 },
            ],
          });
        }}
      >
        <div className="row">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          <button className="btn" type="submit">
            Test anlegen
          </button>
        </div>
      </form>
      {db.tests.map((t) => (
        <article className="hw" key={t.id}>
          <h3>{t.title}</h3>
          <p className="muted">
            {t.subject} · {t.questions.length} Fragen · {db.testAttempts.filter((a) => a.testId === t.id).length} Versuche
          </p>
        </article>
      ))}
    </>
  );
}

export function TestsStudent({ user }) {
  const db = getDb();
  const [pick, setPick] = useState({});
  const sid = user.role === "eltern" ? user.childId : user.id;
  return (
    <>
      <Back to={homeOf(user)} />
      <h1>Meine Tests</h1>
      {db.tests.map((t) => {
        const att = db.testAttempts.find((a) => a.testId === t.id && a.studentId === sid);
        return (
          <article className="hw" key={t.id}>
            <h3>{t.title}</h3>
            {att ? (
              <p className="ok">Abgeschlossen · {att.score} %</p>
            ) : (
              <>
                {t.questions.map((q, i) => (
                  <p key={i}>
                    {q.q}{" "}
                    <select
                      value={pick[t.id]?.[i] ?? ""}
                      onChange={(e) =>
                        setPick({ ...pick, [t.id]: { ...(pick[t.id] || {}), [i]: e.target.value } })
                      }
                    >
                      <option value="">–</option>
                      {q.options.map((o, oi) => (
                        <option key={oi} value={oi}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </p>
                ))}
                <button
                  className="btn"
                  type="button"
                  onClick={() => submitTest(t.id, sid, t.questions.map((_, i) => pick[t.id]?.[i]))}
                >
                  Abgeben
                </button>
              </>
            )}
          </article>
        );
      })}
    </>
  );
}

export function OfflineTeacher() {
  const db = getDb();
  const [title, setTitle] = useState("PDF-Test");
  return (
    <>
      <Back to="/teacher" />
      <h1>Offline-Tests</h1>
      <form
        className="hw"
        onSubmit={(e) => {
          e.preventDefault();
          addOfflineTest({ title, subject: "Mathematik", fileName: "test.pdf" });
          setTitle("");
        }}
      >
        <div className="row">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          <button className="btn" type="submit">
            PDF-Test anlegen
          </button>
        </div>
      </form>
      {db.offlineTests.map((t) => (
        <article className="hw" key={t.id}>
          <h3>{t.title}</h3>
          {db.offlineSubs
            .filter((s) => s.testId === t.id)
            .map((s) => {
              const stu = db.users.find((u) => u.id === s.studentId);
              return (
                <p key={s.id} className="row">
                  {stu?.name} · {s.status} {s.grade != null ? `· ${s.grade}%` : ""}
                  {s.status === "Eingereicht" ? (
                    <button className="btn" type="button" onClick={() => gradeOffline(s.id, 75)}>
                      75 % bewerten
                    </button>
                  ) : null}
                </p>
              );
            })}
        </article>
      ))}
    </>
  );
}

export function OfflineStudent({ user }) {
  const db = getDb();
  const sid = user.role === "eltern" ? user.childId : user.id;
  const mine = db.offlineSubs.filter((s) => s.studentId === sid);
  return (
    <>
      <Back to={homeOf(user)} />
      <h1>Offline-Tests</h1>
      {mine.map((s) => {
        const t = db.offlineTests.find((x) => x.id === s.testId);
        return (
          <article className="hw" key={s.id}>
            <h3>{t?.title}</h3>
            <p className="muted">
              {t?.fileName} · {s.status}
            </p>
            {s.status === "Offen" ? (
              <button className="btn" type="button" onClick={() => submitOffline(s.id, "scan.pdf")}>
                Scan einreichen
              </button>
            ) : (
              <p className="ok">
                {s.status} {s.grade != null ? `· ${s.grade}%` : ""}
              </p>
            )}
          </article>
        );
      })}
    </>
  );
}

export function ThemeGrading() {
  const db = getDb();
  const [msg, setMsg] = useState("");
  const student = db.users.find((u) => u.role === "schueler");
  return (
    <>
      <Back to="/teacher" />
      <h1>Themennoten-Generierung</h1>
      <p className="muted">Note aus der Erledigungsrate der Hausaufgaben.</p>
      <article className="hw">
        <p>
          {student?.name} · Mathematik
        </p>
        <button
          className="btn"
          type="button"
          onClick={() => {
            const r = generateThemeGrade(student.id, "Mathematik");
            setMsg(r ? `${r.percent} % · ${r.letter}` : "Keine Abgaben.");
          }}
        >
          Note erzeugen
        </button>
        {msg ? <p className="ok">{msg}</p> : null}
      </article>
    </>
  );
}

export function ReportsTeacher() {
  const db = getDb();
  const [title, setTitle] = useState("Jahreszeugnis Klasse 11");
  const student = db.users.find((u) => u.role === "schueler");
  return (
    <>
      <Back to="/teacher" />
      <h1>Zeugnisse prüfen</h1>
      <form
        className="hw"
        onSubmit={(e) => {
          e.preventDefault();
          addReport({ studentId: student.id, title, body: `${student.name}: solide Leistungen in diesem Abschnitt.` });
        }}
      >
        <div className="row">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          <button className="btn" type="submit">
            Anlegen
          </button>
        </div>
      </form>
      {db.reportCards.map((r) => (
        <article className="hw" key={r.id}>
          <h3>{r.title}</h3>
          <p>{r.body}</p>
          <p className="muted">{r.released ? "Freigegeben" : "Entwurf"}</p>
          {!r.released ? (
            <button className="btn" type="button" onClick={() => releaseReport(r.id)}>
              Freigeben
            </button>
          ) : null}
        </article>
      ))}
    </>
  );
}

export function ReportsStudent({ user }) {
  const db = getDb();
  const sid = user.role === "eltern" ? user.childId : user.id;
  const rows = db.reportCards.filter((r) => r.studentId === sid && r.released);
  return (
    <>
      <Back to={homeOf(user)} />
      <h1>Zeugnisse</h1>
      {rows.length === 0 ? <p className="muted">Keine freigegebenen Zeugnisse.</p> : null}
      {rows.map((r) => (
        <article className="hw" key={r.id}>
          <h3>{r.title}</h3>
          <p>{r.body}</p>
        </article>
      ))}
    </>
  );
}

export function AdminTasks() {
  const db = getDb();
  return (
    <>
      <Back to="/teacher" />
      <h1>Verwaltungsaufgaben</h1>
      {db.adminTasks.map((t) => (
        <article className="hw" key={t.id}>
          <h3>
            {t.title} <span className="badge">{t.status}</span>
          </h3>
          <p>{t.body}</p>
          <button className="btn" type="button" onClick={() => completeAdminTask(t.id)}>
            {t.status === "offen" ? "Erledigt" : "Wieder öffnen"}
          </button>
        </article>
      ))}
    </>
  );
}

export function StudentOverview() {
  const db = getDb();
  const s = db.users.find((u) => u.role === "schueler");
  const subs = db.submissions.filter((x) => x.studentId === s.id);
  const grades = db.grades.filter((g) => g.studentId === s.id);
  return (
    <>
      <Back to="/teacher" />
      <h1>Schülerübersicht</h1>
      <p className="muted">
        {s?.name} · {s?.className}
      </p>
      <h3>Hausaufgaben</h3>
      {subs.map((sub) => {
        const h = db.homework.find((x) => x.id === sub.homeworkId);
        return (
          <p key={sub.id}>
            {h?.title}: {sub.status}
          </p>
        );
      })}
      <h3>Noten</h3>
      {grades.map((g) => (
        <p key={g.id}>
          {g.subject} {g.percent}% ({g.letter})
        </p>
      ))}
    </>
  );
}

export function Courses({ user }) {
  const db = getDb();
  return (
    <>
      <Back to={homeOf(user)} />
      <h1>Meine Kurse</h1>
      {db.scripts.map((s) => (
        <article className="hw" key={s.id}>
          <h3>{s.title}</h3>
          <p className="muted">{s.subject}</p>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{s.body}</pre>
        </article>
      ))}
    </>
  );
}

export function RoomsFull({ user }) {
  const db = getDb();
  const [tab, setTab] = useState("raeume");
  const abs = db.absences;
  const tabs = [
    ["raeume", "Klassenräume"],
    ["plan", "Stundenpläne"],
  ];
  if (user.role === "lehrer") tabs.push(["krank", "Krankmeldungen"]);
  return (
    <>
      <Back to={homeOf(user)} />
      <h1>Klassenräume</h1>
      <p className="muted">Virtuelle Räume, Stundenpläne & Ferienpläne</p>
      <div className="tabs">
        {tabs.map(([id, label]) => (
          <button key={id} type="button" className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {tab === "raeume" ? (
        <article className="hw">
          <h3>{db.zoom.name}</h3>
          <p>
            <a className="btn" href={db.zoom.url} target="_blank" rel="noreferrer">
              Zoom öffnen
            </a>
          </p>
          <p className="muted">{db.zoom.note}</p>
        </article>
      ) : null}
      {tab === "plan" ? <ScheduleBoard user={user} embedded /> : null}
      {tab === "krank" ? (
        abs.length ? (
          abs.map((a) => (
            <article className="hw" key={a.id}>
              <h3>{db.users.find((u) => u.id === a.studentId)?.name}</h3>
              <p>
                {a.from} – {a.to}
              </p>
              <p className="muted">
                {a.reason} · {a.status}
              </p>
            </article>
          ))
        ) : (
          <p className="muted">Keine Krankmeldungen.</p>
        )
      ) : null}
    </>
  );
}

export function ParentHome({ user }) {
  const nav = useNavigate();
  const db = getDb();
  const child = db.users.find((u) => u.id === user.childId);
  return (
    <div className="parent-home">
      <div className="parent-hero">
        <Users size={64} className="hero-ico" />
        <h2>Kind auswählen</h2>
        <p className="muted">Wählen Sie das Kind aus, dessen Informationen Sie einsehen möchten.</p>
      </div>
      <div className="parent-pick">
        <article className="pick-card" onClick={() => nav(`/parent/child/${child.id}`)}>
          <div className="pick-ico">
            <Users size={32} />
          </div>
          <div>
            <h3>{child?.name}</h3>
            <p className="muted">{child?.className || "Klasse 11 a"}</p>
          </div>
        </article>
      </div>
      <article className="pick-card pick-pay" onClick={() => nav("/parent/zahlungen")}>
        <div className="pick-ico">
          <Wallet size={32} />
        </div>
        <div>
          <h3>Zahlungen & Belege</h3>
          <p className="muted">Offene Beträge, Zahlungshistorie und PDF-Belege Ihrer Familie</p>
        </div>
      </article>
    </div>
  );
}

const PARENT_TILES = [
  { title: "Kind krankmelden", path: "sick", desc: "Krankmeldung für Ihr Kind einreichen", icon: HeartPulse },
  { title: "Hausaufgaben", path: "/parent/homework", desc: "Hausaufgaben-Status und Abgaben anzeigen", icon: FileText },
  { title: "Offline-Tests", path: "/parent/offline-tests", desc: "Tests herunterladen und einreichen", icon: ClipboardCheck },
  { title: "Modul-Aufgaben", path: "/parent/modules", desc: "Modul-Aufgaben und Fortschritt anzeigen", icon: BookOpen },
  { title: "Notenbuch", path: "/parent/gradebook", desc: "Noten und Leistungsübersicht anzeigen", icon: GraduationCap },
  { title: "Zeugnisse", path: "/parent/zeugnisse", desc: "Freigegebene Zeugnisse ansehen", icon: FileText },
  { title: "Stundenpläne", path: "classrooms", desc: "Stundenpläne & Ferienpläne", icon: Calendar },
  { title: "Profil", path: "/parent/profile", desc: "Profil und persönliche Daten anzeigen", icon: User },
  { title: "Dateimanager", path: "/filemanager", desc: "Dateien und Dokumente anzeigen", icon: FolderOpen },
  { title: "Nachrichten", path: "/chat", desc: "Direkte Kommunikation mit Lehrern", icon: MessageCircle },
];

export function ParentChild({ user }) {
  const nav = useNavigate();
  const db = getDb();
  const child = db.users.find((u) => u.id === user.childId);
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("2026-08-21");
  const [to, setTo] = useState("2026-08-21");
  const [reason, setReason] = useState("Erkältung");
  return (
    <>
      <Back to="/parent" label="Zurück zur Kind-Auswahl" />
      <div className="welcome plain">
        <h2>Dashboard für {child?.name}</h2>
        <p>Wählen Sie einen Bereich aus, um Informationen anzuzeigen</p>
      </div>
      <div className="grid-2 parent-tiles" style={{ marginTop: 24 }}>
        {PARENT_TILES.map((t) => {
          const Icon = t.icon;
          const go = () => {
            if (t.path === "sick") setOpen(true);
            else if (t.path === "classrooms") nav(`/parent/child/${child.id}/classrooms`);
            else nav(t.path);
          };
          return (
            <article
              key={t.title}
              className="card parent-tile"
              onClick={go}
            >
              <div className="card-h">
                <h3>
                  <Icon size={24} className="tile-ico" />
                  {t.title}
                </h3>
                <p className="desc">{t.desc}</p>
              </div>
              <div className="card-b">
                <span className="btn link">Öffnen →</span>
              </div>
              <div className="wash gold-wash" />
            </article>
          );
        })}
      </div>
      {open ? (
        <div className="modal-scrim" onClick={() => setOpen(false)}>
          <article className="hw modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Kind krankmelden</h3>
            <p className="muted">Krankmeldung für {child?.name} einreichen</p>
            <div className="row" style={{ marginTop: 12 }}>
              <label className="field">
                Von
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label className="field">
                Bis
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
            </div>
            <label className="field" style={{ marginTop: 12 }}>
              Grund
              <input value={reason} onChange={(e) => setReason(e.target.value)} />
            </label>
            <div className="row" style={{ marginTop: 16 }}>
              <button className="btn outline" type="button" onClick={() => setOpen(false)}>
                Abbrechen
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  addAbsence({ studentId: child.id, from, to, reason });
                  setOpen(false);
                }}
              >
                Abmeldung senden
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
}

export function Payments() {
  const db = getDb();
  return (
    <>
      <Back to="/parent" />
      <h1>Zahlungen & Belege</h1>
      <p className="muted">Überweisung an das Demo-Konto. Karte und PayPal sind aus.</p>
      <article className="hw">
        <h3>Wise-Überweisung</h3>
        <p>Empfänger: THS Homeschooling Demo</p>
        <p>IBAN: DE00 0000 0000 0000 0000 00</p>
        <p>BIC: DEMOXXXX</p>
        <p>Verwendungszweck: RE--Familie Keller</p>
      </article>
      {db.payments.map((p) => (
        <article className="hw" key={p.id}>
          <h3>{p.title}</h3>
          <p>
            {p.amount} · {p.status} · {p.date}
          </p>
          {p.status === "offen" ? (
            <button className="btn" type="button" onClick={() => markPaymentPaid(p.id)}>
              Als bezahlt markieren
            </button>
          ) : (
            <p className="ok">Bezahlt · Beleg PDF</p>
          )}
        </article>
      ))}
    </>
  );
}

const SCHEDULES = [
  { id: "all", title: "Allgemeiner Stundenplan", kind: "allgemein", src: "/schedules/allgemein.svg" },
  { id: "k11", title: "Klasse 11 a", kind: "klasse", src: "/schedules/klasse-11.svg" },
  { id: "ferien", title: "Ferienplan 2026", kind: "ferien", src: "/schedules/ferienplan.svg" },
];

export function ScheduleBoard({ user, embedded }) {
  const [open, setOpen] = useState(null);
  const childId = user?.childId;
  const back = user?.role === "eltern" && childId ? `/parent/child/${childId}` : homeOf(user);
  const general = SCHEDULES.filter((s) => s.kind === "allgemein");
  const klass = SCHEDULES.filter((s) => s.kind === "klasse");
  const ferien = SCHEDULES.filter((s) => s.kind === "ferien");
  return (
    <>
      {embedded ? null : (
        <>
          <Back to={back} label="Zurück zum Dashboard" />
          <h1>Stundenpläne</h1>
          <p className="muted">Stundenpläne & Ferienpläne</p>
        </>
      )}
      <section className="sched-sec">
        <h3>
          <Globe size={20} /> Allgemeiner Stundenplan
        </h3>
        <div className="sched-grid">
          {general.map((s) => (
            <button key={s.id} type="button" className="sched-card" onClick={() => setOpen(s)}>
              <img src={s.src} alt={s.title} />
              <span>{s.title}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="sched-sec">
        <h3>
          <Users size={20} /> Mein Klassenstundenplan
        </h3>
        <div className="sched-grid">
          {klass.map((s) => (
            <button key={s.id} type="button" className="sched-card" onClick={() => setOpen(s)}>
              <img src={s.src} alt={s.title} />
              <span>{s.title}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="sched-sec">
        <h3 className="ferien-h">
          <Calendar size={20} /> Ferienpläne
        </h3>
        <div className="sched-grid">
          {ferien.map((s) => (
            <button key={s.id} type="button" className="sched-card" onClick={() => setOpen(s)}>
              <div className="sched-thumb">
                <img src={s.src} alt={s.title} />
                <em className="pdf-tag">PDF</em>
              </div>
              <span>{s.title}</span>
            </button>
          ))}
        </div>
      </section>
      {open ? (
        <div className="lightbox" onClick={() => setOpen(null)}>
          <button className="icon-btn lb-close" type="button" onClick={() => setOpen(null)}>
            <X size={20} />
          </button>
          <img src={open.src} alt={open.title} onClick={(e) => e.stopPropagation()} />
        </div>
      ) : null}
    </>
  );
}
