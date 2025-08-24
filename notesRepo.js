// notesRepo.js
const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'notes.json'); // notesRepo.js fica na raiz

async function ensureFile() {
  try {
    await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, '[]');
  }
}

async function readAll() {
  await ensureFile();
  const raw = await fs.readFile(DB_FILE, 'utf8');
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    // Se corromper, recomeça com array vazio
    await fs.writeFile(DB_FILE, '[]');
    return [];
  }
}

async function writeAll(notes) {
  await fs.writeFile(DB_FILE, JSON.stringify(notes, null, 2));
}

function nextId(notes) {
  const max = notes.reduce((m, n) => Math.max(m, Number(n.id) || 0), 0);
  return max + 1;
}

async function listNotes() {
  return await readAll();
}

async function addNote(text) {
  const notes = await readAll();
  const note = { id: nextId(notes), text, createdAt: new Date().toISOString() };
  notes.push(note);
  await writeAll(notes);
  return note;
}

async function deleteNote(id) {
  const notes = await readAll();
  const idx = notes.findIndex(n => Number(n.id) === Number(id));
  if (idx === -1) return false;
  notes.splice(idx, 1);
  await writeAll(notes);
  return true;
}

module.exports = { listNotes, addNote, deleteNote };