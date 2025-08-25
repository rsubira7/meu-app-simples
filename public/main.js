// === Config ===
const API_BASE = ''; // mesma origem
async function fetchNotes() {
  const res = await fetch(`${API_BASE}/notes`);
  if (!res.ok) throw new Error('Falha ao carregar notas');
  const data = await res.json();
  // suporta tanto array quanto {items}
  return Array.isArray(data) ? data : data.items;
}

async function addNote(text) {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error('Falha ao adicionar nota');
  return res.json();
}


// === Seletores ===
const noteForm = document.getElementById("noteForm");
const noteText = document.getElementById("noteText");
const noteList = document.getElementById("noteList");
const noteStatus = document.getElementById("noteStatus");

// === Util ===
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// === Carregar notas ===
async function loadNotes() {
  noteStatus.textContent = "Carregando notas…";
  try {
    const res = await fetch(`${API}/notes`);
    const data = await res.json();
    noteList.innerHTML = data.items.map(n => `
      <li data-id="${n.id}">
        <span>${escapeHtml(n.text)}</span>
        <button class="delete">Excluir</button>
      </li>
    `).join("");
    noteStatus.textContent = data.items.length ? "" : "Sem notas ainda.";
  } catch (e) {
    noteStatus.textContent = "Falha ao carregar notas.";
  }
}

// === Criar nota ===
noteForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = noteText.value.trim();
  if (!text) return;

  noteStatus.textContent = "Enviando…";
  const res = await fetch(`${API}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    noteStatus.textContent = err.error || "Erro ao criar nota.";
    return;
  }

  noteText.value = "";
  await loadNotes();
});

// === Deletar nota (delegação) ===
noteList?.addEventListener("click", async (e) => {
  if (!e.target.matches("button.delete")) return;
  const li = e.target.closest("li");
  const id = li?.dataset.id;
  if (!id) return;

  const res = await fetch(`${API}/notes/${id}`, { method: "DELETE" });
  if (res.ok) {
    li.remove();
    if (!noteList.children.length) noteStatus.textContent = "Sem notas ainda.";
  } else {
    noteStatus.textContent = "Erro ao deletar.";
  }
});

// === Inicialização ===
document.addEventListener("DOMContentLoaded", loadNotes);