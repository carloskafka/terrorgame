// Este script contém as correções e melhorias para o Eldoria.html
// Execute: node fix_eldoria.js

const fs = require('fs');
let content = fs.readFileSync('/workspace/eldoria.html', 'utf8');

// 1. Corrigir ELEMENT_ADVANTAGES para incluir todos os elementos
const newElementAdvantages = `
// Tabela de vantagens elementais (atacante -> defensor: multiplicador)
const ELEMENT_ADVANTAGES = {
    [ELEMENTS.FIRE]: { 
        [ELEMENTS.ICE]: 2.0, 
        [ELEMENTS.EARTH]: 1.5, 
        [ELEMENTS.AIR]: 1.2,
        [ELEMENTS.WATER]: 0.5,
        [ELEMENTS.FIRE]: 0.8 
    },
    [ELEMENTS.WATER]: { 
        [ELEMENTS.FIRE]: 2.0, 
        [ELEMENTS.EARTH]: 1.3,
        [ELEMENTS.LIGHTNING]: 0.7,
        [ELEMENTS.WATER]: 0.8 
    },
    [ELEMENTS.ICE]: { 
        [ELEMENTS.FIRE]: 2.0, 
        [ELEMENTS.EARTH]: 1.4,
        [ELEMENTS.AIR]: 1.3,
        [ELEMENTS.ICE]: 0.8,
        [ELEMENTS.WATER]: 0.9 
    },
    [ELEMENTS.LIGHTNING]: { 
        [ELEMENTS.WATER]: 2.0, 
        [ELEMENTS.ICE]: 1.5,
        [ELEMENTS.AIR]: 1.3,
        [ELEMENTS.EARTH]: 0.5,
        [ELEMENTS.LIGHTNING]: 0.8 
    },
    [ELEMENTS.EARTH]: { 
        [ELEMENTS.LIGHTNING]: 2.0, 
        [ELEMENTS.FIRE]: 0.8,
        [ELEMENTS.EARTH]: 0.9 
    },
    [ELEMENTS.AIR]: { 
        [ELEMENTS.EARTH]: 1.5,
        [ELEMENTS.ICE]: 0.8,
        [ELEMENTS.AIR]: 0.9 
    },
    [ELEMENTS.DARK]: { 
        [ELEMENTS.HOLY]: 2.0, 
        [ELEMENTS.NORMAL]: 1.3,
        [ELEMENTS.DARK]: 0.8 
    },
    [ELEMENTS.HOLY]: { 
        [ELEMENTS.DARK]: 2.0, 
        [ELEMENTS.NORMAL]: 1.3,
        [ELEMENTS.HOLY]: 0.8 
    },
    [ELEMENTS.NORMAL]: { 
        [ELEMENTS.NORMAL]: 1.0,
        [ELEMENTS.DARK]: 0.9,
        [ELEMENTS.HOLY]: 0.9
    }
};
`;

content = content.replace(
    /\/\/ Tabela de vantagens elementais[\s\S]*?const ELEMENT_ADVANTAGES = \{[\s\S]*?\[ELEMENTS\.NORMAL\]: \{ \[ELEMENTS\.NORMAL\]: 1\.0 \}\n\};/,
    newElementAdvantages.trim()
);

// 2. Adicionar função getElementMultiplier completa
const newGetElementMultiplier = `
function getElementMultiplier(attackerElement, defenderElement) {
    if (!attackerElement || !defenderElement) return 1.0;
    if (!ELEMENT_ADVANTAGES[attackerElement]) return 1.0;
    
    const advantages = ELEMENT_ADVANTAGES[attackerElement];
    const multiplier = advantages[defenderElement];
    
    // Retorna o multiplicador ou 1.0 se não houver vantagem/desvantagem
    return multiplier !== undefined ? multiplier : 1.0;
}

// Sistema de reações elementais
const ELEMENTAL_REACTIONS = {
    'fire+water': { name: 'Steam', damage: 1.2, effect: 'blind' },
    'fire+ice': { name: 'Melt', damage: 1.5, effect: 'none' },
    'fire+earth': { name: 'Lava', damage: 1.3, effect: 'burn' },
    'fire+air': { name: 'Inferno', damage: 1.4, effect: 'spread' },
    'water+lightning': { name: 'Electrify', damage: 2.0, effect: 'stun' },
    'water+ice': { name: 'Freeze', damage: 1.0, effect: 'freeze' },
    'water+earth': { name: 'Mud', damage: 0.8, effect: 'slow' },
    'ice+lightning': { name: 'Shatter', damage: 1.6, effect: 'break' },
    'ice+earth': { name: 'Permafrost', damage: 1.2, effect: 'root' },
    'lightning+earth': { name: 'Conduct', damage: 1.5, effect: 'chain' },
    'lightning+air': { name: 'Storm', damage: 1.4, effect: 'aoe' },
    'dark+holy': { name: 'Void', damage: 2.5, effect: 'explode' },
    'dark+fire': { name: 'Doom', damage: 1.3, effect: 'curse' },
    'holy+fire': { name: 'Purify', damage: 1.4, effect: 'cleanse' }
};

function createElementalReaction(elem1, elem2) {
    if (!elem1 || !elem2) return null;
    const key1 = elem1.toLowerCase() + '+' + elem2.toLowerCase();
    const key2 = elem2.toLowerCase() + '+' + elem1.toLowerCase();
    return ELEMENTAL_REACTIONS[key1] || ELEMENTAL_REACTIONS[key2] || null;
}
`;

content = content.replace(
    /function getElementMultiplier\(attackerElement, defenderElement\) \{[\s\S]*?return mult \|\| 1\.0;\n\}/,
    newGetElementMultiplier.trim()
);

// 3. Adicionar sistema de spawn por horário
const newSpawnMonster = `
function getMonsterPoolForTime() {
    const hour = Math.floor(gameTime / 100);
    let pool = [];
    
    // Amanhecer (5-8h): monstros comuns + alguns noturnos fugindo
    if (hour >= 5 && hour < 8) {
        pool = monsterTypes[currentBiome].filter(m => 
            m.element !== ELEMENTS.DARK
        );
    }
    // Dia (8-17h): monstros normais
    else if (hour >= 8 && hour < 17) {
        pool = monsterTypes[currentBiome];
    }
    // Entardecer (17-20h): predadores, criaturas agressivas
    else if (hour >= 17 && hour < 20) {
        pool = monsterTypes[currentBiome].filter(m => 
            m.baseAtk >= 15 || m.canBeMob
        );
    }
    // Noite (20-23h): mortos-vivos, demônios, caçadores
    else if (hour >= 20 && hour < 23) {
        pool = monsterTypes[currentBiome].filter(m => 
            m.element === ELEMENTS.DARK || m.name.includes('Wolf') || m.name.includes('Spider')
        );
        if (pool.length === 0) pool = monsterTypes[currentBiome];
    }
    // Meia-noite (23-5h): elites, eventos raros
    else {
        pool = monsterTypes[currentBiome].filter(m => 
            m.element === ELEMENTS.DARK || m.baseHp >= 150
        );
        if (pool.length === 0) pool = monsterTypes[currentBiome];
    }
    
    return pool;
}
`;

// Inserir após a definição de monsterTypes
content = content.replace(
    "(const monsterTypes = \\{[\\s\\S]*?^\\};)",
    "$1\n" + newSpawnMonster
);

// Escrever arquivo corrigido
fs.writeFileSync('/workspace/eldoria_fixed.html', content);
console.log('Arquivo corrigido criado: eldoria_fixed.html');
