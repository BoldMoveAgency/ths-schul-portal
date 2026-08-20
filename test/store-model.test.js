import test from "node:test";
import assert from "node:assert/strict";
import {
  gradePercentFor,
  isDirectPair,
  normalizeRoom,
  parsePercent,
  roomDisplayName,
  unreadChatCount,
} from "../src/store-model.js";

const users = [
  { id: "t1", name: "Teacher", role: "lehrer" },
  { id: "s1", name: "Student", role: "schueler" },
  { id: "p1", name: "Parent", role: "eltern", childId: "s1" },
];

test("normalizes room membership without leaking direct messages or courses to parents", () => {
  assert.deepEqual(normalizeRoom({ id: "dm", type: "direkt", members: ["t1", "s1", "p1"] }, users).members, ["t1", "s1"]);
  assert.deepEqual(normalizeRoom({ id: "course", type: "kurs", members: ["t1", "s1", "p1"] }, users).members, ["t1", "s1"]);
  assert.deepEqual(normalizeRoom({ id: "class", type: "klasse", members: ["t1", "s1"] }, users).members, ["t1", "s1", "p1"]);
});

test("derives a direct-message label for the current viewer", () => {
  const room = { type: "direkt", name: "Student", members: ["t1", "s1"] };
  assert.equal(roomDisplayName(room, "t1", users), "Student");
  assert.equal(roomDisplayName(room, "s1", users), "Teacher");
});

test("reuses only an exact two-person direct room", () => {
  assert.equal(isDirectPair({ type: "direkt", members: ["t1", "s1"] }, "t1", "s1"), true);
  assert.equal(isDirectPair({ type: "direkt", members: ["t1", "s1", "p1"] }, "t1", "p1"), false);
});

test("accepts only percentages from zero through one hundred", () => {
  assert.equal(parsePercent("0"), 0);
  assert.equal(parsePercent("100"), 100);
  assert.equal(parsePercent("-1"), null);
  assert.equal(parsePercent("101"), null);
  assert.equal(parsePercent("not a number"), null);
  assert.equal(gradePercentFor("Offen", "80"), null);
  assert.equal(gradePercentFor("Eingereicht", "80"), 80);
});

test("counts chat messages without folding notices into the chat badge", () => {
  const db = {
    rooms: [{ id: "r1", members: ["s1"] }],
    messages: [{ roomId: "r1", senderId: "t1", createdAt: "2026-08-20T10:00:00.000Z" }],
    notices: [{ to: ["s1"], read: [] }],
    reads: { s1: {} },
  };
  assert.equal(unreadChatCount(db, "s1"), 1);
});
