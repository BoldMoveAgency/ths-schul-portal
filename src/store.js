import { supabase } from "./supabase.js";

const KEY = "ths-demo-v2";
const CLOUD_ID = "v1";

const now = () => new Date().toISOString();

const seed = {
  users: [
    {
      id: "t1",
      email: "lehrer@ths-demo.schule",
      password: "LehrDemo11",
      name: "Ezra Schiesl",
      role: "lehrer",
    },
    {
      id: "s1",
      email: "schueler@ths-demo.schule",
      password: "SchuelerDemo11",
      name: "Noah Keller",
      role: "schueler",
      className: "Klasse 11 a",
    },
    {
      id: "p1",
      email: "eltern@ths-demo.schule",
      password: "ElternDemo11",
      name: "Lea Keller",
      role: "eltern",
      childId: "s1",
    },
  ],
  rooms: [
    { id: "r-k11", type: "klasse", name: "Klasse 11", members: ["t1", "s1", "p1"] },
    { id: "r-dm", type: "direkt", name: "Ezra Schiesl · Noah Keller", members: ["t1", "s1", "p1"] },
  ],
  messages: [
    {
      id: "m1",
      roomId: "r-k11",
      senderId: "t1",
      text: "Willkommen im Demo-Klassenraum. Ungelesen wird beim Öffnen als gelesen markiert.",
      createdAt: "2026-08-18T08:00:00.000Z",
    },
  ],
  homework: [
    {
      id: "h1",
      title: "Blatt 01 – Quadratische Gleichungen",
      subject: "Mathematik",
      due: "2026-08-25",
      text: "Bitte die Aufgaben 1–6 handschriftlich lösen und als PDF hochladen.",
      createdBy: "t1",
    },
    {
      id: "h2",
      title: "Urban Literacy",
      subject: "Social Studies",
      due: "2026-08-22",
      text: "Zwei Kapitel lesen und die Fragen beantworten.",
      createdBy: "t1",
    },
  ],
  submissions: [
    { id: "sub1", homeworkId: "h2", studentId: "s1", status: "Offen", fileName: "", grade: null, feedback: "" },
    { id: "sub2", homeworkId: "h1", studentId: "s1", status: "Offen", fileName: "", grade: null, feedback: "" },
  ],
  questions: [
    {
      id: "q1",
      homeworkId: "h1",
      studentId: "s1",
      text: "Gilt die Mitternachtsformel auch wenn b = 0 ist?",
      answer: "",
      createdAt: "2026-08-19T10:00:00.000Z",
    },
  ],
  files: [
    { id: "f1", name: "Stundenplan Klasse 11.pdf", folder: "Stundenpläne", by: "t1" },
    { id: "f2", name: "Ferienplan 2026.pdf", folder: "Organisatorisches", by: "t1" },
  ],
  notices: [
    { id: "n1", title: "Infostunde", body: "Elternabend digital am Donnerstag 19 Uhr.", to: ["s1", "p1"], read: [] },
  ],
  grades: [{ id: "g1", studentId: "s1", subject: "Mathematik", title: "Themennote Q3", percent: 82, letter: "B" }],
  topics: [
    { id: "tp1", name: "Quadratische Gleichungen", subject: "Mathematik", quarter: "Q3" },
    { id: "tp2", name: "Urban Literacy", subject: "Social Studies", quarter: "Q3" },
  ],
  modules: [{ id: "mod1", name: "KI-Tutor Klasse 11", teacherId: "t1", seats: 10 }],
  moduleTasks: [
    {
      id: "mt1",
      moduleId: "mod1",
      title: "Prompt-Protokoll Woche 1",
      due: "2026-08-27",
      studentId: "s1",
      status: "Offen",
    },
  ],
  scripts: [
    {
      id: "sc1",
      title: "Einführung quadratische Gleichungen",
      subject: "Mathematik",
      body: "1. Wiederholung lineare Gleichungen\n2. Die Normalform ax² + bx + c = 0\n3. Mitternachtsformel mit drei Beispielen\n4. Übungsblatt",
    },
  ],
  tests: [
    {
      id: "tst1",
      title: "Kurztest Quadratische Gleichungen",
      subject: "Mathematik",
      questions: [
        { q: "Wie viele Lösungen hat x² = 9?", options: ["0", "1", "2"], answer: 2 },
        { q: "Die Diskriminante von x² + 2x + 1 ist", options: ["0", "1", "4"], answer: 0 },
      ],
    },
  ],
  testAttempts: [],
  offlineTests: [{ id: "ot1", title: "PDF-Test Algebra", subject: "Mathematik", fileName: "offline-algebra.pdf" }],
  offlineSubs: [{ id: "os1", testId: "ot1", studentId: "s1", status: "Offen", fileName: "", grade: null }],
  reportCards: [
    {
      id: "rc1",
      studentId: "s1",
      title: "Halbjahreszeugnis Klasse 11",
      released: true,
      body: "Noah arbeitet zuverlässig mit. Mathematik 82 % (B).",
      percent: 82,
    },
  ],
  adminTasks: [
    { id: "at1", title: "Anwesenheit Klasse 11 prüfen", body: "Bitte die Anwesenheit der letzten Woche abschließen.", status: "offen" },
    { id: "at2", title: "Ferienplan teilen", body: "Ferienplan 2026 im Dateimanager ablegen.", status: "offen" },
    { id: "at3", title: "Zoom-Raum prüfen", body: "Link im Klassenraum prüfen. Kein Passwort im Klartext.", status: "offen" },
  ],
  payments: [
    { id: "pay1", title: "Schulbeitrag August 2026", amount: "180,00 €", status: "offen", date: "2026-08-01" },
    { id: "pay2", title: "Schulbeitrag Juli 2026", amount: "180,00 €", status: "bezahlt", date: "2026-07-01" },
  ],
  absences: [],
  zoom: { name: "Raum Klasse 11", url: "https://zoom.us/j/0000000000", note: "Link nur. Kein Passwort im Klartext." },
  reads: { t1: {}, s1: {}, p1: {} },
};

function isDb(value) {
  return value && typeof value === "object" && Array.isArray(value.users) && value.users.length > 0 && Array.isArray(value.homework);
}

function ensure(db) {
  const out = { ...db };
  for (const key of Object.keys(seed)) {
    if (out[key] == null) out[key] = structuredClone(seed[key]);
  }
  if (!out.users.some((u) => u.id === "p1")) {
    out.users = [...out.users, seed.users.find((u) => u.id === "p1")];
  }
  out.reads = out.reads || {};
  for (const u of out.users) out.reads[u.id] = out.reads[u.id] || {};
  for (const r of out.rooms) {
    if (!r.members.includes("p1")) r.members = [...r.members, "p1"];
  }
  return out;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isDb(parsed)) return ensure(parsed);
    }
  } catch {
    /* ignore */
  }
  localStorage.setItem(KEY, JSON.stringify(seed));
  return structuredClone(seed);
}

function save(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
  window.dispatchEvent(new Event("ths-db"));
  if (supabase) {
    supabase
      .from("ths_demo_state")
      .upsert({ id: CLOUD_ID, payload: db, updated_at: now() })
      .then(({ error }) => {
        if (error) console.warn("ths cloud save", error.message);
      });
  }
}

export async function hydrateCloud() {
  if (!supabase) return load();
  const { data, error } = await supabase.from("ths_demo_state").select("payload").eq("id", CLOUD_ID).maybeSingle();
  if (error) {
    console.warn("ths cloud load", error.message);
    return load();
  }
  if (isDb(data?.payload)) {
    const next = ensure(data.payload);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("ths-db"));
    return next;
  }
  const local = load();
  await supabase.from("ths_demo_state").upsert({ id: CLOUD_ID, payload: local, updated_at: now() });
  return local;
}

export function login(email, password) {
  const db = load();
  const user = db.users.find(
    (u) => (u.email || "").toLowerCase() === email.trim().toLowerCase() && u.password === password
  );
  if (!user) return null;
  sessionStorage.setItem("ths-user", user.id);
  return user;
}

export function currentUser() {
  const id = sessionStorage.getItem("ths-user");
  if (!id) return null;
  return load().users.find((u) => u.id === id) || null;
}

export function logout() {
  sessionStorage.removeItem("ths-user");
}

export function getDb() {
  return load();
}

export function homePath(user) {
  if (!user) return "/login";
  if (user.role === "lehrer") return "/teacher";
  if (user.role === "eltern") return "/parent";
  return "/student/dashboard";
}

export function viewStudentId(user) {
  if (!user) return null;
  return user.role === "eltern" ? user.childId : user.id;
}

export function unreadCount(userId) {
  const db = load();
  const reads = db.reads[userId] || {};
  let n = 0;
  for (const room of db.rooms.filter((r) => r.members.includes(userId))) {
    const last = reads[room.id] || "";
    n += db.messages.filter((m) => m.roomId === room.id && m.createdAt > last && m.senderId !== userId).length;
  }
  n += db.notices.filter((x) => x.to.includes(userId) && !x.read.includes(userId)).length;
  return n;
}

export function markRoomRead(userId, roomId) {
  const db = load();
  db.reads[userId] = db.reads[userId] || {};
  db.reads[userId][roomId] = now();
  save(db);
}

export function sendMessage(roomId, senderId, text) {
  const db = load();
  db.messages.push({ id: crypto.randomUUID(), roomId, senderId, text, createdAt: now() });
  save(db);
}

export function addHomework({ title, subject, due, text, createdBy }) {
  const db = load();
  const id = crypto.randomUUID();
  db.homework.push({ id, title, subject, due, text, createdBy });
  for (const s of db.users.filter((u) => u.role === "schueler")) {
    db.submissions.push({
      id: crypto.randomUUID(),
      homeworkId: id,
      studentId: s.id,
      status: "Offen",
      fileName: "",
      grade: null,
      feedback: "",
    });
  }
  save(db);
  return id;
}

export function submitHomework(homeworkId, studentId, fileName) {
  const db = load();
  const row = db.submissions.find((x) => x.homeworkId === homeworkId && x.studentId === studentId);
  if (!row) return;
  row.status = "Eingereicht";
  row.fileName = fileName;
  save(db);
}

export function gradeHomework(subId, grade, feedback) {
  const db = load();
  const row = db.submissions.find((x) => x.id === subId);
  if (!row) return;
  const n = Number(grade);
  if (!Number.isFinite(n)) return;
  row.grade = n;
  row.feedback = feedback;
  row.status = "Bewertet";
  save(db);
}

export function askQuestion(homeworkId, studentId, text) {
  const db = load();
  db.questions.push({ id: crypto.randomUUID(), homeworkId, studentId, text, answer: "", createdAt: now() });
  save(db);
}

export function answerQuestion(id, answer) {
  const db = load();
  const q = db.questions.find((x) => x.id === id);
  if (!q) return;
  q.answer = answer;
  save(db);
}

export function addFile(name, folder, by) {
  const db = load();
  db.files.push({ id: crypto.randomUUID(), name, folder, by });
  save(db);
}

export function sendNotice(title, body) {
  const db = load();
  const to = db.users.filter((u) => u.role !== "lehrer").map((u) => u.id);
  db.notices.unshift({ id: crypto.randomUUID(), title, body, to, read: [] });
  save(db);
}

export function markNoticeRead(userId, id) {
  const db = load();
  const n = db.notices.find((x) => x.id === id);
  if (n && !n.read.includes(userId)) n.read.push(userId);
  save(db);
}

export function addTopic({ name, subject, quarter }) {
  const db = load();
  db.topics.push({ id: crypto.randomUUID(), name, subject, quarter });
  save(db);
}

export function addModule(name) {
  const db = load();
  db.modules.push({ id: crypto.randomUUID(), name, teacherId: "t1", seats: 10 });
  save(db);
}

export function addModuleTask({ moduleId, title, due }) {
  const db = load();
  for (const s of db.users.filter((u) => u.role === "schueler")) {
    db.moduleTasks.push({ id: crypto.randomUUID(), moduleId, title, due, studentId: s.id, status: "Offen" });
  }
  save(db);
}

export function submitModuleTask(id) {
  const db = load();
  const row = db.moduleTasks.find((x) => x.id === id);
  if (!row) return;
  row.status = "Eingereicht";
  save(db);
}

export function addScript({ title, subject }) {
  const db = load();
  db.scripts.push({
    id: crypto.randomUUID(),
    title,
    subject,
    body: `Skript: ${title}\nFach: ${subject}\n\n1. Lernziel\n2. Erklärung\n3. Beispiel\n4. Übung\n5. Transferaufgabe`,
  });
  save(db);
}

export function addTest({ title, subject, questions }) {
  const db = load();
  db.tests.push({ id: crypto.randomUUID(), title, subject, questions });
  save(db);
}

export function submitTest(testId, studentId, answers) {
  const db = load();
  const test = db.tests.find((t) => t.id === testId);
  if (!test) return 0;
  let ok = 0;
  test.questions.forEach((q, i) => {
    if (Number(answers[i]) === q.answer) ok += 1;
  });
  const score = Math.round((ok / test.questions.length) * 100);
  db.testAttempts.push({ id: crypto.randomUUID(), testId, studentId, score, answers, at: now() });
  save(db);
  return score;
}

export function addOfflineTest({ title, subject, fileName }) {
  const db = load();
  const id = crypto.randomUUID();
  db.offlineTests.push({ id, title, subject, fileName });
  for (const s of db.users.filter((u) => u.role === "schueler")) {
    db.offlineSubs.push({ id: crypto.randomUUID(), testId: id, studentId: s.id, status: "Offen", fileName: "", grade: null });
  }
  save(db);
}

export function submitOffline(id, fileName) {
  const db = load();
  const row = db.offlineSubs.find((x) => x.id === id);
  if (!row) return;
  row.status = "Eingereicht";
  row.fileName = fileName;
  save(db);
}

export function gradeOffline(id, grade) {
  const db = load();
  const row = db.offlineSubs.find((x) => x.id === id);
  if (!row) return;
  row.grade = Number(grade);
  row.status = "Bewertet";
  save(db);
}

export function generateThemeGrade(studentId, subject) {
  const db = load();
  const hw = db.homework.filter((h) => h.subject === subject);
  const subs = db.submissions.filter((s) => s.studentId === studentId && hw.some((h) => h.id === s.homeworkId));
  if (!subs.length) return null;
  const done = subs.filter((s) => s.status !== "Offen").length;
  const percent = Math.round((done / subs.length) * 100);
  const letter = percent >= 90 ? "A" : percent >= 80 ? "B" : percent >= 70 ? "C" : percent >= 60 ? "D" : "F";
  db.grades.unshift({
    id: crypto.randomUUID(),
    studentId,
    subject,
    title: `Themennote ${subject}`,
    percent,
    letter,
  });
  save(db);
  return { percent, letter };
}

export function addReport({ studentId, title, body }) {
  const db = load();
  db.reportCards.unshift({ id: crypto.randomUUID(), studentId, title, body, released: false, percent: null });
  save(db);
}

export function releaseReport(id) {
  const db = load();
  const row = db.reportCards.find((x) => x.id === id);
  if (!row) return;
  row.released = true;
  save(db);
}

export function completeAdminTask(id) {
  const db = load();
  const row = db.adminTasks.find((x) => x.id === id);
  if (!row) return;
  row.status = row.status === "offen" ? "erledigt" : "offen";
  save(db);
}

export function addAbsence({ studentId, from, to, reason }) {
  const db = load();
  db.absences.unshift({ id: crypto.randomUUID(), studentId, from, to, reason, status: "Eingegangen" });
  save(db);
}

export function markPaymentPaid(id) {
  const db = load();
  const row = db.payments.find((x) => x.id === id);
  if (!row) return;
  row.status = "bezahlt";
  save(db);
}

export function subscribe(fn) {
  const h = () => fn(load());
  window.addEventListener("ths-db", h);
  window.addEventListener("storage", h);
  return () => {
    window.removeEventListener("ths-db", h);
    window.removeEventListener("storage", h);
  };
}
