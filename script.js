function analisarSentenca() {
    const inputElement = document.getElementById("inputSentenca");
    const sentenca = inputElement.value.trim();
    
    if (!sentenca) {
        alert("Por favor, digite uma sentença para análise.");
        inputElement.focus();
        return;
    }
    
    console.log("Análise da sentença:", sentenca);
}

function gerarSentenca() {
    console.log("Sentença adicionada!");
}

const grammar = {
    S: [
        { production: "a C b", nextStates: ["C"], symbols: ["a"], suffix: ["b"] },
        { production: "b A", nextStates: ["A"], symbols: ["b"], suffix: [] },
        { production: "c B c", nextStates: ["B"], symbols: ["c"], suffix: ["c"] }
    ],
    A: [
        { production: "a B", nextStates: ["B"], symbols: ["a"], suffix: [] },
        { production: "e", nextStates: [], symbols: [], suffix: [] } // epsilon
    ],
    B: [
        { production: "a A c", nextStates: ["A"], symbols: ["a"], suffix: ["c"] },
        { production: "b C b", nextStates: ["C"], symbols: ["b"], suffix: ["b"] }
    ],
    C: [
        { production: "a A", nextStates: ["A"], symbols: ["a"], suffix: [] },
        { production: "c A b", nextStates: ["A"], symbols: ["c"], suffix: ["b"] }
    ],
    D: [
        { production: "a B", nextStates: ["B"], symbols: ["a"], suffix: [] },
        { production: "b A", nextStates: ["A"], symbols: ["b"], suffix: [] },
        { production: "d A", nextStates: ["A"], symbols: ["d"], suffix: [] }
    ]
};

let currentState = 'S';
let derivationHistory = [];
let stepCount = 0;
let visitedStates = new Set(['S']);

function initializeAutomaton() {
    updateAvailableRules();
}

function updateAvailableRules() {
    const allRules = document.querySelectorAll('.rule-cell');
    
    allRules.forEach(cell => {
        cell.classList.remove('available', 'selected');
        cell.classList.add('disabled');
    });
    
    const currentStateRules = document.querySelectorAll(`[data-state="${currentState}"]`);
    currentStateRules.forEach(cell => {
        if (!cell.classList.contains('empty-cell')) {
            cell.classList.remove('disabled');
            cell.classList.add('available');
        }
    });
}

function selectRule(element) {
    if (element.classList.contains('disabled')) {
        return;
    }
    
    const state = element.dataset.state;
    const ruleIndex = parseInt(element.dataset.rule);
    const production = element.dataset.production;
    
    if (state !== currentState) {
        return;
    }
    
    document.querySelectorAll('.rule-cell.selected').forEach(cell => {
        cell.classList.remove('selected');
    });
    
    element.classList.add('selected');
    
    executeRule(state, ruleIndex, production);
}

function executeRule(state, ruleIndex, production) {
    const rule = grammar[state][ruleIndex];
    
    if (rule.nextStates.length > 0) {
        currentState = rule.nextStates[0];
        visitedStates.add(currentState);    
    }
    
    updateAvailableRules();
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.rule-cell').forEach(cell => {
        cell.addEventListener('click', function() {
            selectRule(this);
        });
    });
    
    initializeAutomaton();
});

const parsingTable = {
    'S': {
        'a': 'S → aCb',
        'b': 'S → bA',
        'c': 'S → cBc'
    },
    'A': {
        'a': 'A → aB',
        'b': 'A → ε',
        'c': 'A → ε',
        '$': 'A → ε'
    },
    'B': {
        'a': 'B → aAc',
        'b': 'B → bCb',
        'c': 'B → ε'
    },
    'C': {
        'a': 'C → aA',
        'b': 'C → ε',
        'c': 'C → cAb'
    },
    'D': {
        'a': 'D → aB',
        'b': 'D → bA',
        'd': 'D → dA'
    }
};

const productions = {
    'S → aCb': ['a', 'C', 'b'],
    'S → bA': ['b', 'A'],
    'S → cBc': ['c', 'B', 'c'],
    'A → aB': ['a', 'B'],
    'A → ε': [],
    'B → aAc': ['a', 'A', 'c'],
    'B → bCb': ['b', 'C', 'b'],
    'B → ε': [],
    'C → aA': ['a', 'A'],
    'C → cAb': ['c', 'A', 'b'],
    'C → ε': [],
    'D → aB': ['a', 'B'],
    'D → bA': ['b', 'A'],
    'D → dA': ['d', 'A']
};

let stack = ['$', 'S'];
let input = '';
let inputPointer = 0;
let steps = [];
let currentStep = 0;
let analysisInitiated = false;

function initializeAnalysis() {
    if (analysisInitiated) {
        stepByStepAnalysis();
        return;
    }
    analysisInitiated = true;
    const inputString = document.getElementById('inputSentenca').value.trim();
    stack = ['$', 'S'];
    input = inputString + '$';
    inputPointer = 0;
    steps = [];
    currentStep = 0;
    
    steps.push({
        step: 0,
        stack: [...stack],
        input: input.substring(inputPointer),
        action: 'Configuração inicial'
    });
    console.log("Analise iniciada...");
    updateDisplay();
    stepByStepAnalysis();
}

function isTerminal(symbol) {
    return !['S', 'A', 'B', 'C', 'D'].includes(symbol);
}

function stepByStepAnalysis() {
    console.log("Passo a passo...");
    if (stack.length <= 1) {
        return input.substring(inputPointer) === '$';
    }
    
    const top = stack[stack.length - 1];
    const currentInputChar = input[inputPointer];
    
    currentStep++;
    
    if (isTerminal(top)) {
        if (top === currentInputChar) {
            stack.pop();
            inputPointer++;
            
            steps.push({
                step: currentStep,
                stack: [...stack],
                input: input.substring(inputPointer),
                action: `Match '${top}' - removido da pilha`
            });
        } else {
            steps.push({
                step: currentStep,
                stack: [...stack],
                input: input.substring(inputPointer),
                action: `ERRO: Esperado '${top}', encontrado '${currentInputChar}'`
            });
            updateDisplay();
            return false;
        }
    } else {
        const production = parsingTable[top] && parsingTable[top][currentInputChar];
        
        if (production) {
            stack.pop();
            
            const productionSymbols = productions[production];
            if (productionSymbols.length > 0) {
                for (let i = productionSymbols.length - 1; i >= 0; i--) {
                    stack.push(productionSymbols[i]);
                }
            }
            
            steps.push({
                step: currentStep,
                stack: [...stack],
                input: input.substring(inputPointer),
                action: `Aplicar ${production}`
            });
        } else {
            steps.push({
                step: currentStep,
                stack: [...stack],
                input: input.substring(inputPointer),
                action: `ERRO: Não há produção para ${top} com entrada '${currentInputChar}'`
            });
            updateDisplay();
            return false;
        }
    }
    
    updateDisplay();
    return null;
}

function updateDisplay() {
    const tableBody = document.getElementById('analysisTableBody');
    tableBody.innerHTML = '';
    
    steps.forEach((step, index) => {
        const row = document.createElement('tr');
        if (index === steps.length - 1) {
            row.classList.add('current-step');
        }
        
        row.innerHTML = `
            <td class="step-cell">${step.step}</td>
            <td class="stack-cell">${step.stack.join(' ')}</td>
            <td class="input-cell">${step.input}</td>
            <td class="action-cell">${step.action}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    const table = document.getElementById('analysisTable');
    table.scrollTop = table.scrollHeight;
    
}