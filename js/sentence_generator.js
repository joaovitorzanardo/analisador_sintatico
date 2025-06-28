const grammar = {
    S: [
        { production: "a C b", nextStates: ["C"], symbols: ["a"], suffix: ["b"] },
        { production: "b A", nextStates: ["A"], symbols: ["b"], suffix: [] },
        { production: "c B c", nextStates: ["B"], symbols: ["c"], suffix: ["c"] }
    ],
    A: [
        { production: "a B", nextStates: ["B"], symbols: ["a"], suffix: [] },
        { production: "e", nextStates: [], symbols: [], suffix: [] }
    ],
    B: [
        { production: "a A c", nextStates: ["A"], symbols: ["a"], suffix: ["c"] },
        { production: "b C b", nextStates: ["C"], symbols: ["b"], suffix: ["b"] }
    ],
    C: [
        { production: "a D", nextStates: ["D"], symbols: ["a"], suffix: [] },
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
let currentDerivation = [];

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
    
    currentDerivation.push({ state, ruleIndex });
    
    if (rule.nextStates.length === 0) {
        const sentence = generateSentenceFromDerivation();
        document.getElementById('inputSentenca').value = sentence;
        currentDerivation = [];
        return;
    }
    
    currentState = rule.nextStates[0];
    visitedStates.add(currentState);
    
    updateAvailableRules();
}

function generateSentenceFromDerivation() {
    const steps = [];
    
    for (const step of currentDerivation) {
        const rule = grammar[step.state][step.ruleIndex];
        steps.push({
            nonTerminal: step.state,
            production: rule.production.split(' ')
        });
    }
    
    let current = ['S'];
    
    for (const step of steps) {
        const index = current.findIndex(sym => sym === step.nonTerminal);
        if (index === -1) continue;
        
        current = [
            ...current.slice(0, index),
            ...step.production,
            ...current.slice(index + 1)
        ];
    }
    
    return current
        .filter(sym => !grammar[sym])
        .join('').replace('e', '');
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.rule-cell').forEach(cell => {
        cell.addEventListener('click', function() {
            selectRule(this);
        });
    });
    
    initializeAutomaton();
});

function generateValidSentence() {
    currentState = 'S';
    document.getElementById('inputSentenca').value = '';
    visitedStates = new Set(['S']);
    currentDerivation = [];

    function deriveRandom(state) {
        if (!grammar[state]) return;

        const rules = grammar[state];
        
        const shuffledRules = [...rules].sort(() => Math.random() - 0.5);
        
        for (const rule of shuffledRules) {
            const ruleIndex = rules.indexOf(rule);
            currentDerivation.push({ state, ruleIndex });
            
            const currentSentence = generateSentenceFromDerivation();
            if (currentSentence.length > 15) {
                currentDerivation.pop(); 
                continue; 
            }
            
            if (rule.nextStates.length > 0) {
                deriveRandom(rule.nextStates[0]);
                const finalSentence = generateSentenceFromDerivation();
                if (finalSentence.length <= 15) {
                    return; 
                }
            } else {
                return; 
            }
            
            currentDerivation.pop();
        }
    }
    
    deriveRandom('S');
    
    if (currentDerivation.length === 0 && grammar['S'] && grammar['S'].length > 0) {
        currentDerivation = [{ state: 'S', ruleIndex: 0 }];
    }
    
    const sentence = generateSentenceFromDerivation();
    document.getElementById('inputSentenca').value = sentence;
    
    return sentence;
}
