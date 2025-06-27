const alphabet = ['a', 'b', 'c', 'd'];

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
        'a': 'C → aD',
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
    'C → aD': ['a', 'D'],
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
let analysisCompleted = false;

function initializeAnalysis() {
    const inputString = document.getElementById('inputSentenca').value.trim();

    if (!isInputValid(inputString)) {
        return;
    }
   
    if (analysisInitiated && !analysisCompleted) {
        stepByStepAnalysis();
        return;
    }
    
    analysisInitiated = true;
    analysisCompleted = false;
    stack = ['$', 'S'];
    input = inputString + '$';
    inputPointer = 0;
    steps = [];
    currentStep = 0;
    
    stepByStepAnalysis();
}

function isTerminal(symbol) {
    return !['S', 'A', 'B', 'C', 'D'].includes(symbol);
}

function stepByStepAnalysis() {
    if (analysisCompleted) {
        return;
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
                action: `Lê '${top}' - removido da pilha`
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

    if (stack.length <= 1 && input.substring(inputPointer) === '$') {
        const row = document.createElement('div');
        row.innerHTML = `
            <p>Aceita em ${currentStep} passos</p>
        `;
        document.getElementById('analysisTableBody').appendChild(row);
        analysisCompleted = true;
    }
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

function isInputValid(inputString) {
    if (!inputString || inputString === '') {
        alert("A sentença não pode ser vazia!")
        return false;
    }

    if (![...inputString].every(char => alphabet.includes(char))) {
        alert("A sentença deve conter apenas os caracteres 'a', 'b', 'c' e 'd'");
        return false;
    }

    return true;
}

function resetAnalysis() {
    analysisInitiated = false;
    analysisCompleted = false;
    stack = [];
    input = '';
    inputPointer = 0;
    steps = [];
    currentStep = 0;
    document.getElementById('inputSentenca').value = '';
    updateDisplay();   
}