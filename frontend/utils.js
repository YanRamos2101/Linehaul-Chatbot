// utils.js — funções utilitárias compartilhadas entre script.js e consulta.js

// Escapa texto antes de injetar no HTML, prevenindo ataques XSS
function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}