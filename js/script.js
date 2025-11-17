// Carregar medicamentos da API
var medicamentos = {};

function fetchMedicamentos(callback) {
    medicamentos = getLocalMedicamentos();
    if (typeof callback === 'function') callback();
    
    fetch('/api/medicamentos')
        .then(function(response) {
            if (response.ok) {
                return response.json();
            } else {
                console.error('Erro ao buscar medicamentos:', response.statusText);
                return medicamentos;
            }
        })
        .then(function(data) {
            medicamentos = data;
            if (typeof callback === 'function') callback();
        })
        .catch(function(error) {
            console.error('Erro de conexão com a API de medicamentos:', error);
            if (typeof callback === 'function') callback();
        });
}

// Dados locais dos medicamentos como fallback
function getLocalMedicamentos() {
    return {
        "analgesicos": [
            { nome: "Paracetamol IV", uso: "Dor leve a moderada, febre", quantidade: 150, status: "in-stock" },
            { nome: "Dipirona IV", uso: "Dor e febre", quantidade: 200, status: "in-stock" },
            { nome: "Morfina IV", uso: "Dor intensa", quantidade: 80, status: "in-stock" },
            { nome: "Fentanil IV", uso: "Dor intensa, analgesia em UTI", quantidade: 45, status: "low-stock" },
            { nome: "Tramadol IV", uso: "Dor moderada a intensa", quantidade: 120, status: "in-stock" },
            { nome: "Midazolam IV", uso: "Sedação, crises convulsivas", quantidade: 60, status: "low-stock" },
            { nome: "Propofol IV", uso: "Sedação profunda em UTI ou anestesia", quantidade: 30, status: "low-stock" }
        ],
        "antibioticos": [
            { nome: "Ceftriaxona IV", uso: "Infecções bacterianas graves", quantidade: 100, status: "in-stock" },
            { nome: "Cefepime IV", uso: "Infecções hospitalares, Pseudomonas", quantidade: 75, status: "in-stock" },
            { nome: "Meropenem IV", uso: "Infecções graves resistentes", quantidade: 40, status: "low-stock" },
            { nome: "Vancomicina IV", uso: "Infecções por MRSA", quantidade: 50, status: "low-stock" },
            { nome: "Piperacilina-tazobactam IV", uso: "Infecções graves, abrange gram-positivos e negativos", quantidade: 65, status: "in-stock" },
            { nome: "Amicacina IV", uso: "Infecções por gram-negativos resistentes", quantidade: 35, status: "low-stock" },
            { nome: "Metronidazol IV", uso: "Infecções anaeróbicas, intra-abdominais", quantidade: 90, status: "in-stock" }
        ],
        "cardiovasculares": [
            { nome: "Adrenalina (epinefrina) IV", uso: "Parada cardíaca, anafilaxia", quantidade: 25, status: "low-stock" },
            { nome: "Noradrenalina IV", uso: "Choque séptico", quantidade: 30, status: "low-stock" },
            { nome: "Dopamina IV", uso: "Suporte circulatório em choque", quantidade: 40, status: "low-stock" },
            { nome: "Dobutamina IV", uso: "Insuficiência cardíaca, choque cardiogênico", quantidade: 35, status: "low-stock" },
            { nome: "Atropina IV", uso: "Bradicardia grave", quantidade: 50, status: "in-stock" },
            { nome: "Lidocaína IV", uso: "Arritmias ventriculares", quantidade: 20, status: "low-stock" },
            { nome: "Amiodarona IV", uso: "Arritmias graves, fibrilação ventricular", quantidade: 15, status: "out-of-stock" }
        ],
        "solucoes": [
            { nome: "Soro fisiológico 0,9%", uso: "Reposição de líquidos, hidratação", quantidade: 500, status: "in-stock" },
            { nome: "Ringer lactato", uso: "Reposição de líquidos e eletrólitos", quantidade: 300, status: "in-stock" },
            { nome: "Cloreto de potássio IV", uso: "Hipocalemia, reposição eletrolítica", quantidade: 80, status: "in-stock" },
            { nome: "Bicarbonato de sódio IV", uso: "Acidose metabólica grave", quantidade: 60, status: "in-stock" },
            { nome: "Cloreto de cálcio IV", uso: "Hipocalcemia, paralisia por hipercalemia", quantidade: 40, status: "low-stock" },
            { nome: "Sulfato de magnésio IV", uso: "Pré-eclâmpsia, arritmias, broncoespasmo grave", quantidade: 35, status: "low-stock" }
        ],
        "anticoagulantes": [
            { nome: "Heparina IV", uso: "Prevenção e tratamento de tromboses", quantidade: 70, status: "in-stock" },
            { nome: "Ácido tranexâmico IV", uso: "Hemorragias graves", quantidade: 45, status: "low-stock" },
            { nome: "Clopidogrel IV", uso: "Em algumas situações de UTI ou cardiologia", quantidade: 25, status: "low-stock" }
        ],
        "anticonvulsivantes": [
            { nome: "Fenitoína IV", uso: "Convulsões prolongadas, epilepsia", quantidade: 55, status: "in-stock" },
            { nome: "Levetiracetam IV", uso: "Convulsões, alternativa moderna", quantidade: 40, status: "low-stock" },
            { nome: "Valproato de sódio IV", uso: "Crises convulsivas, status epilepticus", quantidade: 30, status: "low-stock" }
        ],
        "corticoides": [
            { nome: "Dexametasona IV", uso: "Alergias graves, choque séptico, inflamação", quantidade: 85, status: "in-stock" },
            { nome: "Metilprednisolona IV", uso: "Crises agudas, inflamação severa", quantidade: 60, status: "in-stock" },
            { nome: "Hidrocortisona IV", uso: "Insuficiência adrenal, choque séptico", quantidade: 45, status: "low-stock" }
        ],
        "antiemeticos": [
            { nome: "Ondansetrona IV", uso: "Náuseas e vômitos, quimioterapia", quantidade: 95, status: "in-stock" },
            { nome: "Metoclopramida IV", uso: "Náuseas e vômitos, gastroparesia", quantidade: 70, status: "in-stock" },
            { nome: "Dimenidrinato IV", uso: "Náuseas graves", quantidade: 50, status: "in-stock" }
        ],
        "outros": [
            { nome: "Insulina IV", uso: "Controle de hiperglicemia em UTI", quantidade: 110, status: "in-stock" },
            { nome: "Glucose 10% ou 25% IV", uso: "Hipoglicemia grave, nutrição", quantidade: 200, status: "in-stock" },
            { nome: "Furosemida IV", uso: "Edema, insuficiência cardíaca, diurético", quantidade: 65, status: "in-stock" },
            { nome: "Manitol IV", uso: "Edema cerebral, pressão intracraniana", quantidade: 30, status: "low-stock" },
            { nome: "Naloxona IV", uso: "Reversão de efeito de opioides", quantidade: 25, status: "low-stock" },
            { nome: "Flumazenil IV", uso: "Reversão de benzodiazepínicos", quantidade: 20, status: "low-stock" }
        ]
    };
}

// Função para renderizar os medicamentos na tela
function renderMedicines(category = 'all', searchTerm = '') {
    const medicinesContainer = document.getElementById('medicines-container');
    if (!medicinesContainer) {
        console.error('Container de medicamentos não encontrado');
        return;
    }
    
    medicinesContainer.innerHTML = '';
    let medicinesToShow = [];
    
    if (category === 'all') {
        for (const cat in medicamentos) {
            medicinesToShow = medicinesToShow.concat(medicamentos[cat]);
        }
    } else {
        medicinesToShow = medicamentos[category] || [];
    }
    
    if (searchTerm) {
        medicinesToShow = medicinesToShow.filter(function(med) {
            return med.nome.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }
    
    if (medicinesToShow.length === 0) {
        medicinesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-pills"></i>
                <h4>Nenhum medicamento encontrado</h4>
                <p>Tente alterar o filtro ou termo de pesquisa</p>
            </div>
        `;
        return;
    }
    
    medicinesToShow.forEach(function(med) {
        var medicineCard = document.createElement('div');
        medicineCard.className = 'medicine-card';
        
        const safeMed = {
            nome: med.nome || '',
            uso: med.uso || '',
            quantidade: med.quantidade || 0,
            status: med.status || 'in-stock'
        };
        
        medicineCard.innerHTML = `
            <div class="medicine-header">
                <h3 class="medicine-name">${safeMed.nome}</h3>
                <span class="medicine-category">${category === 'all' ? getCategoryNameFromMedicine(med) : getCategoryName(category)}</span>
            </div>
            <div class="medicine-body">
                <div class="medicine-info">
                    <div class="info-item">
                        <span class="info-label">Uso:</span>
                        <span>${safeMed.uso}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Quantidade:</span>
                        <span>${safeMed.quantidade} unidades</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status:</span>
                        <span class="stock-status ${safeMed.status}">${getStatusText(safeMed.status)}</span>
                    </div>
                </div>
                <div class="medicine-actions">
                    <button class="btn btn-primary edit-quantity" data-medicine='${JSON.stringify(safeMed).replace(/'/g, "&apos;")}'>
                        <i class="fas fa-edit"></i>
                        Alterar Quantidade
                    </button>
                </div>
            </div>
        `;
        medicinesContainer.appendChild(medicineCard);
    });

    document.querySelectorAll('.edit-quantity').forEach(btn => {
        btn.addEventListener('click', function() {
            try {
                const medicineData = JSON.parse(this.getAttribute('data-medicine').replace(/&apos;/g, "'"));
                openQuantityModal(medicineData, this.closest('.medicine-card'));
            } catch (error) {
                console.error('Erro ao processar dados do medicamento:', error);
                showToast('Erro ao carregar dados do medicamento', 'error');
            }
        });
    });
}

function getCategoryNameFromMedicine(med) {
    for (const category in medicamentos) {
        if (medicamentos[category].some(m => m.nome === med.nome)) {
            return getCategoryName(category);
        }
    }
    return 'Medicamento';
}

function getCategoryName(categoryKey) {
    const categoryNames = {
        'analgesicos': 'Analgésicos e Sedativos',
        'antibioticos': 'Antibióticos',
        'cardiovasculares': 'Cardiovasculares',
        'solucoes': 'Soluções e Eletrólitos',
        'anticoagulantes': 'Anticoagulantes',
        'anticonvulsivantes': 'Anticonvulsivantes',
        'corticoides': 'Corticoides',
        'antiemeticos': 'Antieméticos',
        'outros': 'Outros Essenciais'
    };
    return categoryNames[categoryKey] || 'Medicamento';
}

function getStatusText(status) {
    const statusTexts = {
        'in-stock': 'EM ESTOQUE',
        'low-stock': 'ESTOQUE BAIXO',
        'out-of-stock': 'FORA DE ESTOQUE'
    };
    return statusTexts[status] || 'DESCONHECIDO';
}

// Variáveis globais
let currentCategory = 'all';
let currentMedicine = null;
let currentMedicineElement = null;

// Títulos das páginas
const pageTitles = {
    'estoque': 'Controle de Estoque - Medicamentos',
    'prontuario': 'Prontuário Eletrônico',
    'prontuarios-salvos': 'Prontuários Salvos',
    'checklist': 'Checklist de Plantão - Passagem',
    'configuracoes': 'Configurações do Sistema'
};

// DADOS INICIAIS PARA DEMONSTRAÇÃO
let teamMembers = [
    { id: 1, name: "Dra. Ana Silva", role: "Médica Plantonista", status: "present" },
    { id: 2, name: "Enf. Carlos Santos", role: "Enfermeiro Chefe", status: "present" },
    { id: 3, name: "Téc. Maria Oliveira", role: "Técnica de Enfermagem", status: "present" },
    { id: 4, name: "Téc. João Pereira", role: "Técnico de Enfermagem", status: "absent" }
];

let patients = [
    { 
        id: 1, 
        name: "João da Silva", 
        bed: "Leito 201 - Enfermaria A", 
        diagnosis: "Pneumonia bacteriana com dificuldade respiratória - Monitorar SpO2 a cada 2h", 
        priority: "high" 
    },
    { 
        id: 2, 
        name: "Maria Santos", 
        bed: "Leito 205 - Enfermaria A", 
        diagnosis: "Pós-operatório de colecistectomia - Controle de dor e verificação de curativo", 
        priority: "medium" 
    },
    { 
        id: 3, 
        name: "Pedro Oliveira", 
        bed: "Leito 208 - Enfermaria A", 
        diagnosis: "Hipertensão arterial controlada - Medicações de rotina", 
        priority: "low" 
    },
    { 
        id: 4, 
        name: "Ana Costa", 
        bed: "Leito 210 - Enfermaria A", 
        diagnosis: "ICC descompensada - Restrição hídrica rigorosa, diurese horária", 
        priority: "high" 
    }
];

// ========== SISTEMA DE PRONTUÁRIOS SALVOS ==========

let prontuariosSalvos = JSON.parse(localStorage.getItem('prontuariosSalvos')) || [];

// Salvar prontuário
function salvarProntuario() {
    const patientNameInput = document.getElementById('patient-name');
    if (!patientNameInput) {
        showToast('Campo de nome do paciente não encontrado!', 'error');
        return;
    }
    
    const patientName = patientNameInput.value.trim();
    if (!patientName) {
        showToast('Preencha o nome do paciente antes de salvar!', 'error');
        return;
    }

    const prontuario = {
        id: Date.now(),
        paciente: {
            nome: patientName,
            info: (document.getElementById('patient-info')?.value || '').trim()
        },
        vitais: coletarSinaisVitais(),
        historico: (document.getElementById('current-illness')?.value || '').trim(),
        exameFisico: (document.getElementById('physical-exam')?.value || '').trim(),
        diagnostico: (document.getElementById('diagnosis')?.value || '').trim(),
        tratamento: (document.getElementById('treatment')?.value || '').trim(),
        evolucao: (document.getElementById('evolution')?.value || '').trim(),
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
    };

    prontuariosSalvos.unshift(prontuario);
    localStorage.setItem('prontuariosSalvos', JSON.stringify(prontuariosSalvos));
    renderProntuariosSalvos();
    limparFormularioProntuario();
    navegarParaPagina('prontuarios-salvos');
    showToast('Prontuário salvo com sucesso!', 'success');
}

// Coletar sinais vitais
function coletarSinaisVitais() {
    const vitalInputs = document.querySelectorAll('.vital-input');
    const vitalLabels = document.querySelectorAll('.vital-label');
    const vitais = {};
    
    vitalInputs.forEach((input, index) => {
        const label = vitalLabels[index]?.textContent?.toLowerCase().replace(' ', '_') || `vital_${index}`;
        vitais[label] = (input.value || '').trim() || '--';
    });
    
    return vitais;
}

// Limpar formulário do prontuário
function limparFormularioProntuario() {
    const formInputs = document.querySelectorAll('#prontuario-page input, #prontuario-page textarea');
    formInputs.forEach(input => {
        input.value = '';
    });
}

// Renderizar prontuários salvos
function renderProntuariosSalvos() {
    const prontuariosGrid = document.getElementById('prontuarios-grid');
    const emptyState = document.getElementById('empty-prontuarios');
    
    if (!prontuariosGrid) return;
    
    prontuariosGrid.innerHTML = '';
    
    if (prontuariosSalvos.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    prontuariosSalvos.forEach(prontuario => {
        const prontuarioCard = document.createElement('div');
        prontuarioCard.className = 'prontuario-card';
        prontuarioCard.innerHTML = `
            <div class="prontuario-header">
                <div class="prontuario-paciente">
                    <div class="prontuario-nome">${prontuario.paciente.nome}</div>
                    <div class="prontuario-info">${prontuario.paciente.info || 'Sem informações adicionais'}</div>
                </div>
                <div class="prontuario-data">${formatarData(prontuario.dataCriacao)}</div>
            </div>
            
            <div class="prontuario-content">
                <div class="prontuario-resumo">
                    ${prontuario.historico ? (prontuario.historico.substring(0, 100) + '...') : 'Sem histórico registrado'}
                </div>
                ${prontuario.diagnostico ? `
                    <div class="prontuario-diagnostico">
                        <strong>Diagnóstico:</strong> ${prontuario.diagnostico.substring(0, 80)}${prontuario.diagnostico.length > 80 ? '...' : ''}
                    </div>
                ` : ''}
            </div>
            
            <div class="prontuario-actions">
                <button class="btn btn-sm btn-view" onclick="visualizarProntuario(${prontuario.id})">
                    <i class="fas fa-eye"></i> Ver
                </button>
                <button class="btn btn-sm btn-primary" onclick="imprimirProntuarioSalvo(${prontuario.id})">
                    <i class="fas fa-print"></i> Imprimir
                </button>
                <button class="btn btn-sm btn-delete" onclick="deletarProntuario(${prontuario.id})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        `;
        prontuariosGrid.appendChild(prontuarioCard);
    });
}

// Visualizar prontuário
function visualizarProntuario(id) {
    const prontuario = prontuariosSalvos.find(p => p.id === id);
    if (!prontuario) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content prontuario-modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Prontuário - ${prontuario.paciente.nome}</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="prontuario-modal-body">
                <div class="prontuario-view">
                    <div class="prontuario-view-section">
                        <h4 class="prontuario-view-title">Dados do Paciente</h4>
                        <div class="prontuario-view-content">
                            <p><strong>Nome:</strong> ${prontuario.paciente.nome}</p>
                            <p><strong>Informações:</strong> ${prontuario.paciente.info || 'Não informado'}</p>
                            <p><strong>Data do Atendimento:</strong> ${formatarDataCompleta(prontuario.dataCriacao)}</p>
                        </div>
                    </div>
                    
                    <div class="prontuario-view-section">
                        <h4 class="prontuario-view-title">Sinais Vitais</h4>
                        <div class="vitais-grid">
                            ${Object.entries(prontuario.vitais).map(([key, value]) => `
                                <div class="vital-view-item">
                                    <div class="vital-value">${value}</div>
                                    <div class="vital-label">${formatarLabelVital(key)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="prontuario-view-section">
                        <h4 class="prontuario-view-title">História da Doença Atual</h4>
                        <div class="prontuario-view-content">${prontuario.historico || 'Não informado'}</div>
                    </div>
                    
                    <div class="prontuario-view-section">
                        <h4 class="prontuario-view-title">Exame Físico</h4>
                        <div class="prontuario-view-content">${prontuario.exameFisico || 'Não informado'}</div>
                    </div>
                    
                    <div class="prontuario-view-section">
                        <h4 class="prontuario-view-title">Diagnóstico</h4>
                        <div class="prontuario-view-content">${prontuario.diagnostico || 'Não informado'}</div>
                    </div>
                    
                    <div class="prontuario-view-section">
                        <h4 class="prontuario-view-title">Conduta e Prescrições</h4>
                        <div class="prontuario-view-content">${prontuario.tratamento || 'Não informado'}</div>
                    </div>
                    
                    <div class="prontuario-view-section">
                        <h4 class="prontuario-view-title">Evolução</h4>
                        <div class="prontuario-view-content">${prontuario.evolucao || 'Não informado'}</div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Fechar</button>
                <button class="btn btn-primary" onclick="imprimirProntuarioSalvo(${prontuario.id})">
                    <i class="fas fa-print"></i> Imprimir
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Deletar prontuário
function deletarProntuario(id) {
    if (confirm('Tem certeza que deseja excluir este prontuário?')) {
        prontuariosSalvos = prontuariosSalvos.filter(p => p.id !== id);
        localStorage.setItem('prontuariosSalvos', JSON.stringify(prontuariosSalvos));
        renderProntuariosSalvos();
        showToast('Prontuário excluído com sucesso!', 'success');
    }
}

// Imprimir prontuário salvo
function imprimirProntuarioSalvo(id) {
    const prontuario = prontuariosSalvos.find(p => p.id === id);
    if (!prontuario) {
        showToast('Prontuário não encontrado!', 'error');
        return;
    }

    const vitaisHTML = Object.entries(prontuario.vitais).map(([key, value]) => `
        <div style="flex: 1; text-align: center; padding: 10px; border: 1px solid #ddd; margin: 5px; border-radius: 5px;">
            <div style="font-weight: bold; color: #2c7fb8;">${formatarLabelVital(key)}</div>
            <div style="font-size: 1.2em; margin-top: 5px;">${value}</div>
        </div>
    `).join('');

    const printContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; border-bottom: 3px solid #2c7fb8; padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="color: #2c7fb8; margin-bottom: 10px;">PRONTUÁRIO MÉDICO</h1>
                <p><strong>Hospital MedControl</strong></p>
                <p>${formatarDataCompleta(prontuario.dataCriacao)}</p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h2 style="color: #2c7fb8; border-bottom: 2px solid #2c7fb8; padding-bottom: 8px; margin-bottom: 15px;">DADOS DO PACIENTE</h2>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2c7fb8;">
                    <p><strong>Nome:</strong> ${prontuario.paciente.nome}</p>
                    <p><strong>Informações:</strong> ${prontuario.paciente.info || 'Não informado'}</p>
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h2 style="color: #2c7fb8; border-bottom: 2px solid #2c7fb8; padding-bottom: 8px; margin-bottom: 15px;">SINAIS VITAIS</h2>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0; justify-content: space-between;">${vitaisHTML}</div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h2 style="color: #2c7fb8; border-bottom: 2px solid #2c7fb8; padding-bottom: 8px; margin-bottom: 15px;">HISTÓRIA DA DOENÇA ATUAL</h2>
                <div style="background: #fafafa; border: 1px solid #e0e0e0; padding: 15px; border-radius: 5px; min-height: 80px; white-space: pre-wrap;">${prontuario.historico || 'Não informado'}</div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h2 style="color: #2c7fb8; border-bottom: 2px solid #2c7fb8; padding-bottom: 8px; margin-bottom: 15px;">EXAME FÍSICO</h2>
                <div style="background: #fafafa; border: 1px solid #e0e0e0; padding: 15px; border-radius: 5px; min-height: 80px; white-space: pre-wrap;">${prontuario.exameFisico || 'Não informado'}</div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h2 style="color: #2c7fb8; border-bottom: 2px solid #2c7fb8; padding-bottom: 8px; margin-bottom: 15px;">DIAGNÓSTICO</h2>
                <div style="background: #fafafa; border: 1px solid #e0e0e0; padding: 15px; border-radius: 5px; min-height: 80px; white-space: pre-wrap;">${prontuario.diagnostico || 'Não informado'}</div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h2 style="color: #2c7fb8; border-bottom: 2px solid #2c7fb8; padding-bottom: 8px; margin-bottom: 15px;">CONDUTA E PRESCRIÇÕES</h2>
                <div style="background: #fafafa; border: 1px solid #e0e0e0; padding: 15px; border-radius: 5px; min-height: 80px; white-space: pre-wrap;">${prontuario.tratamento || 'Não informado'}</div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h2 style="color: #2c7fb8; border-bottom: 2px solid #2c7fb8; padding-bottom: 8px; margin-bottom: 15px;">EVOLUÇÃO</h2>
                <div style="background: #fafafa; border: 1px solid #e0e0e0; padding: 15px; border-radius: 5px; min-height: 80px; white-space: pre-wrap;">${prontuario.evolucao || 'Não informado'}</div>
            </div>
            
            <div style="margin-top: 60px; text-align: center;">
                <div style="border-top: 1px solid #000; width: 300px; margin: 40px auto 10px auto; padding-top: 10px;"></div>
                <p><strong>Dr(a). karol</strong></p>
                <p>Médica Plantonista | CRM: XX/XXXXX</p>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
                <p>Documento gerado automaticamente pelo Sistema MedControl</p>
                <p>Data de emissão: ${new Date().toLocaleString('pt-BR')}</p>
            </div>
        </div>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
        showToast('Permita popups para imprimir!', 'error');
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Prontuário - ${prontuario.paciente.nome}</title>
            <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                @media print {
                    body { margin: 0; padding: 15px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            ${printContent}
            <div class="no-print" style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #2c7fb8; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
                    🖨️ Imprimir
                </button>
                <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
                    ❌ Fechar
                </button>
            </div>
            <script>
                window.onload = function() {
                    setTimeout(() => {
                        window.print();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    showToast('Abrindo impressão...', 'success');
}

// Função para imprimir prontuário atual
function printProntuario() {
    const patientNameInput = document.getElementById('patient-name');
    if (!patientNameInput) {
        showToast('Campo de nome do paciente não encontrado!', 'error');
        return;
    }
    
    const patientName = patientNameInput.value;
    if (!patientName) {
        showToast('Preencha o nome do paciente antes de imprimir!', 'error');
        return;
    }

    const patientInfo = (document.getElementById('patient-info')?.value || 'Não informado');
    const currentIllness = (document.getElementById('current-illness')?.value || 'Não informado');
    const physicalExam = (document.getElementById('physical-exam')?.value || 'Não informado');
    const diagnosis = (document.getElementById('diagnosis')?.value || 'Não informado');
    const treatment = (document.getElementById('treatment')?.value || 'Não informado');
    const evolution = (document.getElementById('evolution')?.value || 'Não informado');
    
    const vitalInputs = document.querySelectorAll('.vital-input');
    const vitalLabels = document.querySelectorAll('.vital-label');
    let vitaisHTML = '';
    
    vitalInputs.forEach((input, index) => {
        const valor = input.value || '--';
        const label = vitalLabels[index]?.textContent || `Vital ${index + 1}`;
        vitaisHTML += `
            <div style="flex: 1; text-align: center; padding: 10px; border: 1px solid #ddd; margin: 5px; border-radius: 5px;">
                <div style="font-weight: bold; color: #2c7fb8;">${label}</div>
                <div style="font-size: 1.2em; margin-top: 5px;">${valor}</div>
            </div>
        `;
    });

    const printContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; border-bottom: 3px solid #2c7fb8; padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="color: #2c7fb8; margin-bottom: 10px;">PRONTUÁRIO MÉDICO</h1>
                <p><strong>Hospital MedControl</strong></p>
                <p>${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h2 style="color: #2c7fb8; border-bottom: 2px solid #2c7fb8; padding-bottom: 8px; margin-bottom: 15px;">DADOS DO PACIENTE</h2>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2c7fb8;">
                    <p><strong>Nome:</strong> ${patientName}</p>
                    <p><strong>Informações:</strong> ${patientInfo}</p>
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h2 style="color: #2c7fb8; border-bottom: 2px solid #2c7fb8; padding-bottom: 8px; margin-bottom: 15px;">SINAIS VITAIS</h2>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0; justify-content: space-between;">${vitaisHTML}</div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h2 style="color: #2c7fb8; border-bottom: 2px solid #2c7fb8; padding-bottom: 8px; margin-bottom: 15px;">HISTÓRIA DA DOENÇA ATUAL</h2>
                <div style="background: #fafafa; border: 1px solid #e0e0e0; padding: 15px; border-radius: 5px; min-height: 80px; white-space: pre-wrap;">${currentIllness}</div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h2 style="color: #2c7fb8; border-bottom: 2px solid #2c7fb8; padding-bottom: 8px; margin-bottom: 15px;">EXAME FÍSICO</h2>
                <div style="background: #fafafa; border: 1px solid #e0e0e0; padding: 15px; border-radius: 5px; min-height: 80px; white-space: pre-wrap;">${physicalExam}</div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h2 style="color: #2c7fb8; border-bottom: 2px solid #2c7fb8; padding-bottom: 8px; margin-bottom: 15px;">DIAGNÓSTICO</h2>
                <div style="background: #fafafa; border: 1px solid #e0e0e0; padding: 15px; border-radius: 5px; min-height: 80px; white-space: pre-wrap;">${diagnosis}</div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h2 style="color: #2c7fb8; border-bottom: 2px solid #2c7fb8; padding-bottom: 8px; margin-bottom: 15px;">CONDUTA E PRESCRIÇÕES</h2>
                <div style="background: #fafafa; border: 1px solid #e0e0e0; padding: 15px; border-radius: 5px; min-height: 80px; white-space: pre-wrap;">${treatment}</div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h2 style="color: #2c7fb8; border-bottom: 2px solid #2c7fb8; padding-bottom: 8px; margin-bottom: 15px;">EVOLUÇÃO</h2>
                <div style="background: #fafafa; border: 1px solid #e0e0e0; padding: 15px; border-radius: 5px; min-height: 80px; white-space: pre-wrap;">${evolution}</div>
            </div>
            
            <div style="margin-top: 60px; text-align: center;">
                <div style="border-top: 1px solid #000; width: 300px; margin: 40px auto 10px auto; padding-top: 10px;"></div>
                <p><strong>Dr(a). karol</strong></p>
                <p>Médica Plantonista | CRM: XX/XXXXX</p>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
                <p>Documento gerado automaticamente pelo Sistema MedControl</p>
                <p>Data de emissão: ${new Date().toLocaleString('pt-BR')}</p>
            </div>
        </div>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
        showToast('Permita popups para imprimir!', 'error');
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Prontuário - ${patientName}</title>
            <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                @media print {
                    body { margin: 0; padding: 15px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            ${printContent}
            <div class="no-print" style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #2c7fb8; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
                    🖨️ Imprimir
                </button>
                <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
                    ❌ Fechar
                </button>
            </div>
            <script>
                window.onload = function() {
                    setTimeout(() => {
                        window.print();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    showToast('Abrindo impressão...', 'success');
}

// Funções auxiliares
function formatarData(dataISO) {
    return new Date(dataISO).toLocaleDateString('pt-BR');
}

function formatarDataCompleta(dataISO) {
    return new Date(dataISO).toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatarLabelVital(key) {
    const labels = {
        'peso': 'Peso',
        'altura': 'Altura',
        'imc': 'IMC',
        'pressão': 'Pressão',
        'freq._cardíaca': 'Freq. Cardíaca',
        'temperatura': 'Temperatura'
    };
    return labels[key] || key;
}

// ========== FUNÇÕES PARA CONTROLE DE TAMANHO DA FONTE ==========

function applyFontSize(size) {
    document.documentElement.style.setProperty('--base-font-size', size + 'px');
    localStorage.setItem('fontSize', size.toString());
    updateFontSizeControls(size);
}

function updateFontSizeControls(currentSize) {
    const slider = document.getElementById('fontSizeSlider');
    const valueDisplay = document.getElementById('fontSizeValue');
    const presetButtons = document.querySelectorAll('.font-size-btn');
    
    if (slider) slider.value = currentSize;
    if (valueDisplay) valueDisplay.textContent = currentSize + 'px';
    
    presetButtons.forEach(btn => {
        btn.classList.remove('active');
        const btnSize = parseInt(btn.getAttribute('data-size'));
        if (btnSize === currentSize) btn.classList.add('active');
    });
}

function loadSavedFontSize() {
    const savedSize = localStorage.getItem('fontSize');
    applyFontSize(savedSize ? parseInt(savedSize) : 16);
}

function initializeFontSizeControls() {
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontSizePresets = document.querySelectorAll('.font-size-btn');
    
    if (fontSizeSlider) {
        fontSizeSlider.addEventListener('input', function() {
            applyFontSize(parseInt(this.value));
        });
    }
    
    fontSizePresets.forEach(btn => {
        btn.addEventListener('click', function() {
            const size = parseInt(this.getAttribute('data-size'));
            applyFontSize(size);
            showToast(`Tamanho da fonte alterado para ${this.textContent.toLowerCase()}`, 'success');
        });
    });
    
    loadSavedFontSize();
}

// ========== FUNÇÕES PARA CONTROLE DE TEMA ==========

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', theme);
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    updateThemePreviews(savedTheme);
}

function updateThemePreviews(activeTheme) {
    const themePreviews = document.querySelectorAll('.theme-preview');
    themePreviews.forEach(preview => {
        preview.classList.remove('active');
        if (preview.getAttribute('data-theme') === activeTheme) {
            preview.classList.add('active');
        }
    });
}

function initializeThemeControls() {
    const themePreviews = document.querySelectorAll('.theme-preview');
    
    themePreviews.forEach(preview => {
        preview.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            applyTheme(theme);
            updateThemePreviews(theme);
            showToast(`Tema ${theme === 'dark' ? 'escuro' : 'claro'} aplicado!`, 'success');
        });
    });
    
    loadSavedTheme();
}

// ========== FUNÇÃO PARA REDEFINIR CONFIGURAÇÕES ==========

function resetAppearanceSettings() {
    if (confirm('Tem certeza que deseja redefinir todas as configurações de aparência para os padrões?')) {
        localStorage.removeItem('fontSize');
        applyFontSize(16);
        localStorage.removeItem('theme');
        applyTheme('light');
        showToast('Configurações de aparência redefinidas para os padrões!', 'success');
    }
}

// ========== FUNÇÕES EXISTENTES DO SISTEMA ==========

function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('pt-BR', options);
    }
}

function openQuantityModal(medicine, medicineElement) {
    currentMedicine = medicine;
    currentMedicineElement = medicineElement;
    
    const quantityModalTitle = document.getElementById('quantityModalTitle');
    const currentQuantityDisplay = document.getElementById('current-quantity');
    const newQuantityInput = document.getElementById('new-quantity');
    const quantityModal = document.getElementById('quantityModal');
    
    if (quantityModalTitle) quantityModalTitle.textContent = `Alterar Quantidade - ${medicine.nome}`;
    if (currentQuantityDisplay) currentQuantityDisplay.textContent = `${medicine.quantidade} unidades`;
    if (newQuantityInput) newQuantityInput.value = medicine.quantidade;
    
    updateStockStatusPreview(medicine.quantidade);
    
    if (quantityModal) quantityModal.style.display = 'flex';
}

function updateStockStatusPreview(quantity) {
    const stockStatusPreview = document.getElementById('stock-status-preview');
    if (!stockStatusPreview) return;
    
    let status, text;
    
    if (quantity === 0) {
        status = 'out-of-stock';
        text = 'FORA DE ESTOQUE';
    } else if (quantity < 50) {
        status = 'low-stock';
        text = 'ESTOQUE BAIXO';
    } else {
        status = 'in-stock';
        text = 'EM ESTOQUE';
    }
    
    stockStatusPreview.className = `stock-status ${status}`;
    stockStatusPreview.textContent = text;
}

function saveQuantity() {
    const newQuantityInput = document.getElementById('new-quantity');
    if (!newQuantityInput) return;
    
    const newQuantity = parseInt(newQuantityInput.value);
    
    if (isNaN(newQuantity) || newQuantity < 0) {
        showToast('Por favor, insira uma quantidade válida!', 'error');
        return;
    }
    
    if (!currentMedicine || !currentMedicineElement) {
        showToast('Erro ao atualizar quantidade!', 'error');
        return;
    }
    
    currentMedicine.quantidade = newQuantity;
    
    if (newQuantity === 0) {
        currentMedicine.status = 'out-of-stock';
    } else if (newQuantity < 50) {
        currentMedicine.status = 'low-stock';
    } else {
        currentMedicine.status = 'in-stock';
    }
    
    const quantityDisplay = currentMedicineElement.querySelector('.info-item:nth-child(2) span:last-child');
    const statusDisplay = currentMedicineElement.querySelector('.stock-status');
    
    if (quantityDisplay) quantityDisplay.textContent = `${newQuantity} unidades`;
    if (statusDisplay) {
        statusDisplay.className = `stock-status ${currentMedicine.status}`;
        statusDisplay.textContent = getStatusText(currentMedicine.status);
    }
    
    showToast('Quantidade atualizada com sucesso!', 'success');
    
    const quantityModal = document.getElementById('quantityModal');
    if (quantityModal) quantityModal.style.display = 'none';
}

// Navegação entre páginas
function navegarParaPagina(pagina) {
    const navLinks = document.querySelectorAll('.nav-link');
    const pageContents = document.querySelectorAll('.page-content');
    const pageTitle = document.getElementById('pageTitle');
    
    if (!navLinks || !pageContents) return;
    
    navLinks.forEach(l => l.classList.remove('active'));
    pageContents.forEach(page => page.classList.remove('active'));
    
    const linkAtivo = Array.from(navLinks).find(link => link.getAttribute('data-page') === pagina);
    if (linkAtivo) {
        linkAtivo.classList.add('active');
    }
    
    const pageElement = document.getElementById(`${pagina}-page`);
    if (pageElement) {
        pageElement.classList.add('active');
    }
    
    if (pageTitle && pageTitles[pagina]) {
        pageTitle.textContent = pageTitles[pagina];
    }
    
    if (pagina === 'prontuarios-salvos') {
        renderProntuariosSalvos();
    }
    
    showToast(`Acessando ${pageTitles[pagina] || pagina}`, 'success');
}

// Adiciona item de menu para Prontuários Salvos
function adicionarMenuItemProntuariosSalvos() {
    const navMenu = document.querySelector('.nav-menu');
    const itemChecklist = document.querySelector('.nav-item [data-page="checklist"]')?.closest('.nav-item');
    
    if (!navMenu || !itemChecklist) return;
    
    const existingItem = document.querySelector('.nav-item [data-page="prontuarios-salvos"]');
    if (existingItem) return;
    
    const novoItem = document.createElement('li');
    novoItem.className = 'nav-item';
    novoItem.innerHTML = `
        <a class="nav-link" data-page="prontuarios-salvos">
            <i class="fas fa-archive"></i>
            <span>Prontuários Salvos</span>
        </a>
    `;
    
    navMenu.insertBefore(novoItem, itemChecklist.nextSibling);
    
    novoItem.querySelector('.nav-link').addEventListener('click', function() {
        navegarParaPagina('prontuarios-salvos');
    });
}

// Função para mostrar notificações toast
function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.className = 'toast';
    
    if (type === 'error') {
        toast.style.background = '#dc3545';
    } else if (type === 'warning') {
        toast.style.background = '#ffc107';
        toast.style.color = '#333';
    } else {
        toast.style.background = '#28a745';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// FUNCIONALIDADES PARA ADIÇÃO DE PROFISSIONAIS E PACIENTES
function initializeChecklistFunctionality() {
    const toggleTeamFormBtn = document.getElementById('toggleTeamForm');
    const teamForm = document.getElementById('teamForm');
    const cancelTeamFormBtn = document.getElementById('cancelTeamForm');
    const addTeamMemberBtn = document.getElementById('addTeamMember');
    const teamMembersList = document.getElementById('teamMembersList');

    const togglePatientFormBtn = document.getElementById('togglePatientForm');
    const patientForm = document.getElementById('patientForm');
    const cancelPatientFormBtn = document.getElementById('cancelPatientForm');
    const addPatientBtn = document.getElementById('addPatient');
    const patientsList = document.getElementById('patientsList');

    if (!toggleTeamFormBtn || !teamForm) return;

    renderTeamMembers();
    renderPatients();

    toggleTeamFormBtn.addEventListener('click', function() {
        teamForm.style.display = teamForm.style.display === 'none' ? 'block' : 'none';
    });

    if (cancelTeamFormBtn) {
        cancelTeamFormBtn.addEventListener('click', function() {
            teamForm.style.display = 'none';
            clearTeamForm();
        });
    }

    if (addTeamMemberBtn) {
        addTeamMemberBtn.addEventListener('click', function() {
            const nameInput = document.getElementById('teamMemberName');
            const roleInput = document.getElementById('teamMemberRole');
            const statusInput = document.getElementById('teamMemberStatus');
            
            if (!nameInput || !roleInput) return;
            
            const name = nameInput.value.trim();
            const role = roleInput.value.trim();
            const status = statusInput ? statusInput.value : 'present';

            if (!name || !role) {
                showToast('Preencha todos os campos obrigatórios!', 'error');
                return;
            }

            const newMember = {
                id: Date.now(),
                name: name,
                role: role,
                status: status
            };

            teamMembers.push(newMember);
            renderTeamMembers();
            teamForm.style.display = 'none';
            clearTeamForm();
            showToast('Profissional adicionado com sucesso!', 'success');
        });
    }

    if (togglePatientFormBtn && patientForm) {
        togglePatientFormBtn.addEventListener('click', function() {
            patientForm.style.display = patientForm.style.display === 'none' ? 'block' : 'none';
        });
    }

    if (cancelPatientFormBtn) {
        cancelPatientFormBtn.addEventListener('click', function() {
            if (patientForm) patientForm.style.display = 'none';
            clearPatientForm();
        });
    }

    if (addPatientBtn) {
        addPatientBtn.addEventListener('click', function() {
            const nameInput = document.getElementById('patientName');
            const bedInput = document.getElementById('patientBed');
            const diagnosisInput = document.getElementById('patientDiagnosis');
            const priorityInput = document.getElementById('patientPriority');
            
            if (!nameInput || !bedInput || !diagnosisInput) return;
            
            const name = nameInput.value.trim();
            const bed = bedInput.value.trim();
            const diagnosis = diagnosisInput.value.trim();
            const priority = priorityInput ? priorityInput.value : 'high';

            if (!name || !bed || !diagnosis) {
                showToast('Preencha todos os campos obrigatórios!', 'error');
                return;
            }

            const newPatient = {
                id: Date.now(),
                name: name,
                bed: bed,
                diagnosis: diagnosis,
                priority: priority
            };

            patients.push(newPatient);
            renderPatients();
            if (patientForm) patientForm.style.display = 'none';
            clearPatientForm();
            showToast('Paciente adicionado com sucesso!', 'success');
        });
    }

    function renderTeamMembers() {
        if (!teamMembersList) return;
        
        teamMembersList.innerHTML = '';

        if (teamMembers.length === 0) {
            teamMembersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h4>Nenhum profissional adicionado</h4>
                    <p>Clique em "Adicionar Profissional" para começar</p>
                </div>
            `;
            return;
        }

        teamMembers.forEach(member => {
            const memberElement = document.createElement('div');
            memberElement.className = `team-member ${member.status}`;
            memberElement.innerHTML = `
                <div class="member-name">${member.name}</div>
                <div class="member-role">${member.role}</div>
                <span class="status-badge status-${member.status}">
                    ${member.status === 'present' ? 'PRESENTE' : 'AUSENTE'}
                </span>
                <button class="delete-btn" data-id="${member.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            teamMembersList.appendChild(memberElement);

            memberElement.addEventListener('click', function(e) {
                if (!e.target.closest('.delete-btn')) {
                    toggleMemberStatus(member.id);
                }
            });

            const deleteBtn = memberElement.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    deleteTeamMember(member.id);
                });
            }
        });
    }

    function renderPatients() {
        if (!patientsList) return;
        
        patientsList.innerHTML = '';

        if (patients.length === 0) {
            patientsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-procedures"></i>
                    <h4>Nenhum paciente adicionado</h4>
                    <p>Clique em "Adicionar Paciente" para começar</p>
                </div>
            `;
            return;
        }

        patients.forEach(patient => {
            const patientElement = document.createElement('div');
            patientElement.className = `patient-item priority-${patient.priority}`;
            patientElement.innerHTML = `
                <div class="patient-name">${patient.name}</div>
                <div class="patient-bed">${patient.bed}</div>
                <div class="patient-diagnosis">${patient.diagnosis}</div>
                <button class="delete-btn" data-id="${patient.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            patientsList.appendChild(patientElement);

            const deleteBtn = patientElement.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function() {
                    deletePatient(patient.id);
                });
            }
        });
    }

    function toggleMemberStatus(id) {
        teamMembers = teamMembers.map(member => {
            if (member.id === id) {
                return {
                    ...member,
                    status: member.status === 'present' ? 'absent' : 'present'
                };
            }
            return member;
        });
        renderTeamMembers();
    }

    function deleteTeamMember(id) {
        if (confirm('Tem certeza que deseja remover este profissional?')) {
            teamMembers = teamMembers.filter(member => member.id !== id);
            renderTeamMembers();
            showToast('Profissional removido com sucesso!', 'success');
        }
    }

    function deletePatient(id) {
        if (confirm('Tem certeza que deseja remover este paciente?')) {
            patients = patients.filter(patient => patient.id !== id);
            renderPatients();
            showToast('Paciente removido com sucesso!', 'success');
        }
    }

    function clearTeamForm() {
        const nameInput = document.getElementById('teamMemberName');
        const roleInput = document.getElementById('teamMemberRole');
        const statusInput = document.getElementById('teamMemberStatus');
        
        if (nameInput) nameInput.value = '';
        if (roleInput) roleInput.value = '';
        if (statusInput) statusInput.value = 'present';
    }

    function clearPatientForm() {
        const nameInput = document.getElementById('patientName');
        const bedInput = document.getElementById('patientBed');
        const diagnosisInput = document.getElementById('patientDiagnosis');
        const priorityInput = document.getElementById('patientPriority');
        
        if (nameInput) nameInput.value = '';
        if (bedInput) bedInput.value = '';
        if (diagnosisInput) diagnosisInput.value = '';
        if (priorityInput) priorityInput.value = 'high';
    }
}

// ========== INICIALIZAÇÃO GERAL ==========

function initializeEventListeners() {
    const navLinks = document.querySelectorAll('.nav-link');
    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (this.id === 'logout-btn') {
                    const logoutModal = document.getElementById('logoutModal');
                    if (logoutModal) logoutModal.style.display = 'flex';
                    return;
                }
                
                const pageId = this.getAttribute('data-page');
                if (pageId) {
                    navegarParaPagina(pageId);
                }
            });
        });
    }

    const categoryButtons = document.querySelectorAll('.category-btn');
    if (categoryButtons) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                currentCategory = this.getAttribute('data-category') || 'all';
                const searchInput = document.querySelector('.search-input');
                renderMedicines(currentCategory, searchInput?.value || '');
            });
        });
    }

    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            renderMedicines(currentCategory, this.value);
        });
    }

    const decreaseBtn = document.getElementById('decrease-btn');
    const increaseBtn = document.getElementById('increase-btn');
    const newQuantityInput = document.getElementById('new-quantity');

    if (decreaseBtn && newQuantityInput) {
        decreaseBtn.addEventListener('click', function() {
            const currentValue = parseInt(newQuantityInput.value) || 0;
            if (currentValue > 0) {
                newQuantityInput.value = currentValue - 1;
                updateStockStatusPreview(newQuantityInput.value);
            }
        });
    }

    if (increaseBtn && newQuantityInput) {
        increaseBtn.addEventListener('click', function() {
            const currentValue = parseInt(newQuantityInput.value) || 0;
            newQuantityInput.value = currentValue + 1;
            updateStockStatusPreview(newQuantityInput.value);
        });
    }

    if (newQuantityInput) {
        newQuantityInput.addEventListener('input', function() {
            updateStockStatusPreview(this.value);
        });
    }

    const saveQuantityBtn = document.getElementById('saveQuantityBtn');
    if (saveQuantityBtn) {
        saveQuantityBtn.addEventListener('click', saveQuantity);
    }

    const cancelQuantityBtn = document.getElementById('cancelQuantityBtn');
    if (cancelQuantityBtn) {
        cancelQuantityBtn.addEventListener('click', function() {
            const quantityModal = document.getElementById('quantityModal');
            if (quantityModal) quantityModal.style.display = 'none';
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logoutModal');
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');

    if (logoutBtn && logoutModal) {
        logoutBtn.addEventListener('click', function() {
            logoutModal.style.display = 'flex';
        });
    }

    if (cancelLogoutBtn && logoutModal) {
        cancelLogoutBtn.addEventListener('click', function() {
            logoutModal.style.display = 'none';
        });
    }

    if (confirmLogoutBtn && logoutModal) {
        confirmLogoutBtn.addEventListener('click', function() {
            logoutModal.style.display = 'none';
            showToast('Saindo do sistema...', 'warning');
            
            setTimeout(() => {
                alert('Você foi desconectado do sistema. Redirecionando para a página de login...');
            }, 2000);
        });
    }

    const saveProntuarioBtn = document.getElementById('save-prontuario');
    if (saveProntuarioBtn) {
        saveProntuarioBtn.addEventListener('click', salvarProntuario);
    }

    const clearFormBtn = document.getElementById('clear-form');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja limpar todos os campos do prontuário?')) {
                limparFormularioProntuario();
                showToast('Formulário limpo!', 'success');
            }
        });
    }

    const closeButtons = document.querySelectorAll('.close-btn');
    if (closeButtons) {
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const logoutModal = document.getElementById('logoutModal');
                const quantityModal = document.getElementById('quantityModal');
                
                if (logoutModal) logoutModal.style.display = 'none';
                if (quantityModal) quantityModal.style.display = 'none';
            });
        });
    }

    window.addEventListener('click', function(event) {
        const logoutModal = document.getElementById('logoutModal');
        const quantityModal = document.getElementById('quantityModal');
        
        if (logoutModal && event.target === logoutModal) {
            logoutModal.style.display = 'none';
        }
        if (quantityModal && event.target === quantityModal) {
            quantityModal.style.display = 'none';
        }
    });

    const startConsultationBtn = document.getElementById('startConsultationBtn');
    let consultationStarted = false;
    let consultationTimer;
    let consultationSeconds = 0;

    if (startConsultationBtn) {
        startConsultationBtn.addEventListener('click', function() {
            if (!consultationStarted) {
                consultationStarted = true;
                this.innerHTML = '<i class="fas fa-pause"></i> Pausar Atendimento';
                this.style.background = '#ffc107';
                this.style.color = '#333';
                
                consultationTimer = setInterval(() => {
                    consultationSeconds++;
                    const hours = Math.floor(consultationSeconds / 3600);
                    const minutes = Math.floor((consultationSeconds % 3600) / 60);
                    const seconds = consultationSeconds % 60;
                    
                    const durationElement = document.querySelector('.duration-time');
                    if (durationElement) {
                        durationElement.textContent = 
                            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    }
                }, 1000);
                
                showToast('Atendimento iniciado!', 'success');
            } else {
                consultationStarted = false;
                this.innerHTML = '<i class="fas fa-play"></i> Retomar Atendimento';
                this.style.background = '#6c757d';
                this.style.color = 'white';
                
                clearInterval(consultationTimer);
                showToast('Atendimento pausado!', 'warning');
            }
        });
    }

    const printBtn = document.getElementById('print-prontuario');
    if (printBtn) {
        printBtn.addEventListener('click', printProntuario);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando Sistema MedControl...');
    
    adicionarMenuItemProntuariosSalvos();
    initializeEventListeners();
    fetchMedicamentos(function() {
        renderMedicines();
    });
    updateCurrentDate();
    initializeFontSizeControls();
    initializeThemeControls();
    initializeChecklistFunctionality();
    
    const resetBtn = document.getElementById('resetAppearanceBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAppearanceSettings);
    }
    
    const switches = document.querySelectorAll('.switch input');
    switches.forEach(switchEl => {
        switchEl.addEventListener('change', function() {
            const labelElement = this.parentElement.querySelector('.option-label');
            const label = labelElement ? labelElement.textContent : 'Opção';
            const status = this.checked ? 'ativado' : 'desativado';
            showToast(`${label} ${status}`, 'success');
        });
    });
    
    document.querySelectorAll('.btn-save').forEach(btn => {
        btn.addEventListener('click', function() {
            showToast('Configurações salvas com sucesso!', 'success');
        });
    });
    
    console.log('Sistema MedControl inicializado com sucesso!');
});
