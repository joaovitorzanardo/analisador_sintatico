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