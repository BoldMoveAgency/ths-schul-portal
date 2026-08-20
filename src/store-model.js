export function normalizeRoom(room, users) {
  const knownIds = new Set(users.map((user) => user.id));
  let members = [...new Set((room.members || []).filter((id) => knownIds.has(id)))];

  if (room.type === "direkt") {
    members = members.slice(0, 2);
  } else if (room.type === "kurs") {
    const parents = new Set(users.filter((user) => user.role === "eltern").map((user) => user.id));
    members = members.filter((id) => !parents.has(id));
  } else if (room.type === "klasse") {
    for (const parent of users.filter((user) => user.role === "eltern")) {
      if (parent.childId && members.includes(parent.childId) && !members.includes(parent.id)) {
        members.push(parent.id);
      }
    }
  }

  return { ...room, members };
}

export function roomDisplayName(room, viewerId, users) {
  if (room?.type !== "direkt") return room?.name || "Chat";
  const otherId = (room.members || []).find((id) => id !== viewerId);
  return users.find((user) => user.id === otherId)?.name || room.name || "Direktnachricht";
}

export function isDirectPair(room, firstId, secondId) {
  return room.type === "direkt"
    && room.members.length === 2
    && room.members.includes(firstId)
    && room.members.includes(secondId);
}

export function parsePercent(value) {
  const percent = Number(value);
  return Number.isFinite(percent) && percent >= 0 && percent <= 100 ? percent : null;
}

export function gradePercentFor(status, value) {
  return status === "Eingereicht" ? parsePercent(value) : null;
}

export function unreadChatCount(db, userId) {
  const reads = db.reads[userId] || {};
  let count = 0;
  for (const room of db.rooms.filter((candidate) => candidate.members.includes(userId))) {
    const lastRead = reads[room.id] || "";
    count += db.messages.filter(
      (message) => message.roomId === room.id && message.createdAt > lastRead && message.senderId !== userId
    ).length;
  }
  return count;
}
