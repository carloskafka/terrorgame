// Adicionar após a função updateAchievementPanel() no eldoria.html

function updateSkillHotbar() {
    const hotbar = document.getElementById('skillHotbar');
    if (!hotbar) return;
    
    hotbar.innerHTML = '';
    
    const skills = [
        { id: 'fireball', key: 'Z', icon: '🔥', name: 'Fireball', cooldown: 1000 },
        { id: 'iceblast', key: 'X', icon: '❄️', name: 'Ice Blast', cooldown: 1500 },
        { id: 'thunder', key: 'C', icon: '⚡', name: 'Thunder', cooldown: 3000 },
        { id: 'heal', key: 'V', icon: '💚', name: 'Heal', cooldown: 5000 },
        { id: 'shield', key: 'B', icon: '🛡️', name: 'Shield', cooldown: 8000 },
        { id: 'berserk', key: 'N', icon: '💢', name: 'Berserk', cooldown: 15000 }
    ];
    
    const now = Date.now();
    
    skills.forEach(skill => {
        if (learnedSkills[skill.id]) {
            const remaining = Math.max(0, skillCooldowns[skill.id] + skill.cooldown - now);
            const cdPercent = remaining / skill.cooldown * 100;
            
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot' + (remaining > 0 ? '' : ' active');
            slot.innerHTML = `
                <span class="key">${skill.key}</span>
                <span class="icon">${skill.icon}</span>
                <div class="cd" style="width: ${cdPercent}%"></div>
            `;
            slot.title = `${skill.name} (${remaining > 0 ? (remaining/1000).toFixed(1) + 's' : 'Pronto!'})`;
            hotbar.appendChild(slot);
        }
    });
}

// Adicionar teclas para habilidades adicionais
// No window.onkeydown, adicionar:
// if(e.key.toLowerCase()===\"v\") useHeal();
// if(e.key.toLowerCase()===\"b\") useShield();
// if(e.key.toLowerCase()===\"n\") useBerserk();
