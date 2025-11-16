// Dados dos medicamentos para uso no backend
module.exports = {
    analgesicos: [
        { nome: "Paracetamol IV", uso: "Dor leve a moderada, febre", quantidade: 150, status: "in-stock" },
        { nome: "Dipirona IV", uso: "Dor e febre", quantidade: 200, status: "in-stock" },
        { nome: "Morfina IV", uso: "Dor intensa", quantidade: 80, status: "in-stock" },
        { nome: "Fentanil IV", uso: "Dor intensa, analgesia em UTI", quantidade: 45, status: "low-stock" },
        { nome: "Tramadol IV", uso: "Dor moderada a intensa", quantidade: 120, status: "in-stock" },
        { nome: "Midazolam IV", uso: "Sedação, crises convulsivas", quantidade: 60, status: "low-stock" },
        { nome: "Propofol IV", uso: "Sedação profunda em UTI ou anestesia", quantidade: 30, status: "low-stock" }
    ],
    antibioticos: [
        { nome: "Ceftriaxona IV", uso: "Infecções bacterianas graves", quantidade: 100, status: "in-stock" },
        { nome: "Cefepime IV", uso: "Infecções hospitalares, Pseudomonas", quantidade: 75, status: "in-stock" },
        { nome: "Meropenem IV", uso: "Infecções graves resistentes", quantidade: 40, status: "low-stock" },
        { nome: "Vancomicina IV", uso: "Infecções por MRSA", quantidade: 50, status: "low-stock" },
        { nome: "Piperacilina-tazobactam IV", uso: "Infecções graves, abrange gram-positivos e negativos", quantidade: 65, status: "in-stock" },
        { nome: "Amicacina IV", uso: "Infecções por gram-negativos resistentes", quantidade: 35, status: "low-stock" },
        { nome: "Metronidazol IV", uso: "Infecções anaeróbicas, intra-abdominais", quantidade: 90, status: "in-stock" }
    ],
    cardiovasculares: [
        { nome: "Adrenalina (epinefrina) IV", uso: "Parada cardíaca, anafilaxia", quantidade: 25, status: "low-stock" },
        { nome: "Noradrenalina IV", uso: "Choque séptico", quantidade: 30, status: "low-stock" },
        { nome: "Dopamina IV", uso: "Suporte circulatório em choque", quantidade: 40, status: "low-stock" },
        { nome: "Dobutamina IV", uso: "Insuficiência cardíaca, choque cardiogênico", quantidade: 35, status: "low-stock" },
        { nome: "Atropina IV", uso: "Bradicardia grave", quantidade: 50, status: "in-stock" },
        { nome: "Lidocaína IV", uso: "Arritmias ventriculares", quantidade: 20, status: "low-stock" },
        { nome: "Amiodarona IV", uso: "Arritmias graves, fibrilação ventricular", quantidade: 15, status: "out-of-stock" }
    ],
    solucoes: [
        { nome: "Soro fisiológico 0,9%", uso: "Reposição de líquidos, hidratação", quantidade: 500, status: "in-stock" },
        { nome: "Ringer lactato", uso: "Reposição de líquidos e eletrólitos", quantidade: 300, status: "in-stock" },
        { nome: "Cloreto de potássio IV", uso: "Hipocalemia, reposição eletrolítica", quantidade: 80, status: "in-stock" },
        { nome: "Bicarbonato de sódio IV", uso: "Acidose metabólica grave", quantidade: 60, status: "in-stock" },
        { nome: "Cloreto de cálcio IV", uso: "Hipocalcemia, paralisia por hipercalemia", quantidade: 40, status: "low-stock" },
        { nome: "Sulfato de magnésio IV", uso: "Pré-eclâmpsia, arritmias, broncoespasmo grave", quantidade: 35, status: "low-stock" }
    ],
    anticoagulantes: [
        { nome: "Heparina IV", uso: "Prevenção e tratamento de tromboses", quantidade: 70, status: "in-stock" },
        { nome: "Ácido tranexâmico IV", uso: "Hemorragias graves", quantidade: 45, status: "low-stock" }
    ]
};
