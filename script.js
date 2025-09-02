// Classe principal para gerenciar as tarefas
class GerenciadorDeTarefas {
    constructor() {
        this.tarefas = [];
        this.idEmEdicao = null;
        this.inicializarElementos();
        this.vincularEventos();
        this.atualizarInterface();
    }

    // Inicializa os elementos do DOM
    inicializarElementos() {
        this.inputTarefa = document.getElementById('taskInput');
        this.botaoAdicionar = document.getElementById('addButton');
        this.containerTarefas = document.getElementById('tasksContainer');
        this.estadoVazio = document.getElementById('emptyState');
        this.contadorPendentes = document.getElementById('pendingCount');
        this.contadorConcluidas = document.getElementById('completedCount');
        this.contadorTotal = document.getElementById('totalCount');
        this.rodape = document.getElementById('footer');
    }

    // Adiciona os event listeners
    vincularEventos() {
        this.inputTarefa.addEventListener('input', () => this.atualizarBotaoAdicionar());

        this.inputTarefa.addEventListener('keypress', (evento) => {
            if (evento.key === 'Enter' && !this.botaoAdicionar.disabled) {
                this.adicionarTarefa();
            }
        });

        this.botaoAdicionar.addEventListener('click', () => this.adicionarTarefa());
    }

    atualizarBotaoAdicionar() {
        const temTexto = this.inputTarefa.value.trim().length > 0;
        this.botaoAdicionar.disabled = !temTexto;
    }

    adicionarTarefa() {
        const texto = this.inputTarefa.value.trim();
        if (!texto) return;

        const tarefa = {
            id: Date.now(),
            texto: texto,
            concluida: false,
            criadaEm: new Date().toLocaleDateString('pt-BR')
        };

        this.tarefas.push(tarefa);
        this.inputTarefa.value = '';
        this.atualizarBotaoAdicionar();
        this.atualizarInterface();
    }

    removerTarefa(id) {
        this.tarefas = this.tarefas.filter(tarefa => tarefa.id !== id);
        this.atualizarInterface();
    }

    alternarTarefa(id) {
        const tarefa = this.tarefas.find(t => t.id === id);
        if (tarefa) {
            tarefa.concluida = !tarefa.concluida;
            this.atualizarInterface();
        }
    }

    editarTarefa(id) {
        this.idEmEdicao = id;
        this.renderizarTarefas();
    }

    salvarEdicao(id, novoTexto) {
        const tarefa = this.tarefas.find(t => t.id === id);
        if (tarefa && novoTexto.trim()) {
            tarefa.texto = novoTexto.trim();
        }
        this.idEmEdicao = null;
        this.atualizarInterface();
    }

    cancelarEdicao() {
        this.idEmEdicao = null;
        this.renderizarTarefas();
    }

    atualizarEstatisticas() {
        const pendentes = this.tarefas.filter(t => !t.concluida).length;
        const concluidas = this.tarefas.filter(t => t.concluida).length;
        const total = this.tarefas.length;

        this.contadorPendentes.textContent = `📝 ${pendentes} pendente${pendentes !== 1 ? 's' : ''}`;
        this.contadorConcluidas.textContent = `✅ ${concluidas} concluída${concluidas !== 1 ? 's' : ''}`;
        this.contadorTotal.textContent = total;
    }

    renderizarTarefas() {
        if (this.tarefas.length === 0) {
            this.estadoVazio.style.display = 'block';
            this.rodape.style.display = 'none';
            return;
        }

        this.estadoVazio.style.display = 'none';
        this.rodape.style.display = 'block';

        this.containerTarefas.innerHTML = '';

        this.tarefas.forEach(tarefa => {
            const elemento = this.criarElementoTarefa(tarefa);
            this.containerTarefas.appendChild(elemento);
        });
    }

    criarElementoTarefa(tarefa) {
        const div = document.createElement('div');
        div.className = `task-item${tarefa.concluida ? ' completed' : ''}`;
        
        const emEdicao = this.idEmEdicao === tarefa.id;

        div.innerHTML = `
            <div class="task-content">
                <div class="task-checkbox${tarefa.concluida ? ' completed' : ''}" onclick="gerenciador.alternarTarefa(${tarefa.id})">
                    ${tarefa.concluida ? '✓' : ''}
                </div>
                <div class="task-text-container">
                    ${emEdicao ? `
                        <input type="text" class="task-edit-input" value="${tarefa.texto}" 
                               onkeypress="tratarTeclaEdicao(event, ${tarefa.id})"
                               onblur="gerenciador.salvarEdicao(${tarefa.id}, this.value)" 
                               maxlength="200" autofocus>
                    ` : `
                        <div class="task-text${tarefa.concluida ? ' completed' : ''}">${this.escaparHtml(tarefa.texto)}</div>
                        <div class="task-date">Criada em ${tarefa.criadaEm}</div>
                    `}
                </div>
                <div class="task-actions">
                    ${emEdicao ? `
                        <button class="action-btn save-btn" onclick="gerenciador.salvarEdicao(${tarefa.id}, this.parentElement.parentElement.querySelector('.task-edit-input').value)" title="Salvar">
                            ✓
                        </button>
                        <button class="action-btn cancel-btn" onclick="gerenciador.cancelarEdicao()" title="Cancelar">
                            ✕
                        </button>
                    ` : `
                        <button class="action-btn edit-btn" onclick="gerenciador.editarTarefa(${tarefa.id})" title="Editar">
                            ✏️
                        </button>
                        <button class="action-btn delete-btn" onclick="gerenciador.removerTarefa(${tarefa.id})" title="Remover">
                            🗑️
                        </button>
                    `}
                </div>
            </div>
        `;

        return div;
    }

    escaparHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    atualizarInterface() {
        this.atualizarEstatisticas();
        this.renderizarTarefas();
    }
}

// Função global para teclas na edição
function tratarTeclaEdicao(evento, idTarefa) {
    if (evento.key === 'Enter') {
        gerenciador.salvarEdicao(idTarefa, evento.target.value);
    } else if (evento.key === 'Escape') {
        gerenciador.cancelarEdicao();
    }
}

let gerenciador;

document.addEventListener('DOMContentLoaded', () => {
    gerenciador = new GerenciadorDeTarefas();
});
