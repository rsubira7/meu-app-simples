const fs = require("node:fs/promises");
const path = require("node:path");

const DATA_DIR = path.join(__dirname, "..", "data");
const FILE = path.join(DATA_DIR, "notes.json");

// garante pasta + arquivo inicial
async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FILE);
  } catch {
    const initial = { seq: 1, items: [] };
    await fs.writeFile(FILE, JSON.stringify(initial, null, 2));
  }
}

async function readAll() {
  await ensureFile();
  const raw = await fs.readFile(FILE, "utf8");
  const data = JSON.parse(raw || "{}");
  // sanity check mínimo
  if (!Array.isArray(data.items) || typeof data.seq !== "number") {
    return { seq: 1, items: [] };
  }
  return data;
}

async function writeAll(data) {
  await fs.writeFile(FILE, JSON.stringify(data, null, 2));
}

async function listNotes() {
  const { items } = await readAll();
  return items;
}

async function addNote(text) {
  const data = await readAll();
  const note = { id: data.seq++, text, createdAt: new Date().toISOString() };
  data.items.push(note);
  await writeAll(data);
  return note;
}

async function deleteNote(id) {
  const data = await readAll();
  const idx = data.items.findIndex(n => n.id === id);
  if (idx === -1) return null;
  const [removed] = data.items.splice(idx, 1);
  await writeAll(data);
  return removed;
}

module.exports = { listNotes, addNote, deleteNote };
