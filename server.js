const express = require('express');
const cors = require('cors');           // manteremos por já existir, mas não será necessário na mesma origem
const path = require('path');

const app = express();
app.use(express.json());

// (Opcional p/ dev local file://) — CORS permissivo só no dev:
const allowed = [ 'http://localhost:5173', 'http://localhost:3000', null ]; // null = file://
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  }
}));

// Servir front estático
app.use(express.static(path.join(__dirname, 'public')));

// --- suas rotas /notes (GET/POST/DELETE) continuam aqui ---
// Rotas
app.get("/hello", (req, res) => {
  res.json({ message: "Olá do Express!" });
});

app.get("/time", (req, res) => {
  res.json({ now: new Date().toISOString() });
});

app.get("/echo", (req, res) => {
  const msg = req.query.msg ?? "";
  res.json({ echo: msg });
});

app.get("/sum", (req, res) => {
  const a = Number(req.query.a);
  const b = Number(req.query.b);
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return res.status(400).json({ error: "Parâmetros a e b devem ser números" });
  }
  res.json({ result: a + b });
});

// ===== Mini-API de Notas (em memória) =====

// "banco de dados" em memória (reset a cada reinício)
//const notes = [];
//let seq = 1;

const repo = require("./notesRepo");

// GET /notes
app.get("/notes", async (_req, res) => {
  try {
    const items = await repo.listNotes();
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: "Falha ao ler notas" });
  }
});

// POST /notes
app.post("/notes", async (req, res) => {
  const text = String(req.body?.text ?? "").trim();
  if (!text) return res.status(400).json({ error: "Campo 'text' é obrigatório" });
  if (text.length > 500) return res.status(400).json({ error: "Máximo de 500 caracteres" });

  try {
    const note = await repo.addNote(text);
    res.status(201).json(note);
  } catch (e) {
    res.status(500).json({ error: "Falha ao gravar nota" });
  }
});

// DELETE /notes/:id
app.delete("/notes/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "ID inválido" });

  try {
    const removed = await repo.deleteNote(id);
    if (!removed) return res.status(404).json({ error: "Nota não encontrada" });
    res.json({ removed });
  } catch (e) {
    res.status(500).json({ error: "Falha ao deletar nota" });
  }
});


// Fallback para SPA (se precisar)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 padrão
app.use((req, res) => res.status(404).json({ error: "Rota não encontrada" }));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
