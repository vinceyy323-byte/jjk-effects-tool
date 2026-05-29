// JJK GIMKIT INTEGRATED BATTLE SYSTEM
// Paste this in Gimkit Script Editor alongside the battle bookmarklet

const GITHUB_USER_1 = "vinceyy323-byte"; 
const GITHUB_USER_2 = "YourTeammateUsername";

// =========================================
// GIMKIT DEV TERMINAL WITH BATTLE CONTROLS
// =========================================

function openDevMenu(player) {
    if (player.name !== GITHUB_USER_1 && player.name !== GITHUB_USER_2) return;

    let partnerName = player.name === GITHUB_USER_1 ? GITHUB_USER_2 : GITHUB_USER_1;

    player.showCustomUI({
        id: "jjk_battle_terminal",
        title: `⚡ JJK BATTLE ARENA - Connected to ${partnerName}`,
        components: [
            {
                type: "text",
                value: "🔥 SELECT YOUR CHARACTER:"
            },
            {
                type: "button",
                id: "char_sukuna",
                label: "👹 SUKUNA (Domain Master)",
                color: "#ff1744"
            },
            {
                type: "button",
                id: "char_gojo",
                label: "👓 GOJO (Limitless)",
                color: "#00d4ff"
            },
            {
                type: "button",
                id: "char_yuji",
                label: "🩸 YUJI (Vessel)",
                color: "#ff6b9d"
            },
            {
                type: "button",
                id: "char_todo",
                label: "💪 TODO (Boogie)",
                color: "#9c27b0"
            },
            {
                type: "divider"
            },
            {
                type: "text",
                value: "💬 TEAM COMMUNICATION:"
            },
            {
                type: "input",
                id: "battle_chat",
                placeholder: "Send battle strat...",
                maxLength: 100
            },
            {
                type: "button",
                id: "send_battle_msg",
                label: "📢 Send Strat",
                color: "#4CAF50"
            },
            {
                type: "divider"
            },
            {
                type: "text",
                value: "🎮 BATTLE EFFECTS:"
            },
            {
                type: "button",
                id: "activate_effects",
                label: "🚀 ACTIVATE JJK EFFECTS",
                color: "#E91E63"
            },
            {
                type: "button",
                id: "grant_power",
                label: "⚡ GRANT POWER-UP",
                color: "#FF9800"
            },
            {
                type: "button",
                id: "show_stats",
                label: "📊 SHOW COMBO STATS",
                color: "#2196F3"
            }
        ]
    });
}

// =========================================
// BUTTON CLICK HANDLER
// =========================================

studio.onEvent("ui", "componentClick", (event) => {
    let player = event.player;
    let componentId = event.componentId;
    
    if (player.name !== GITHUB_USER_1 && player.name !== GITHUB_USER_2) return;

    let players = studio.getAllPlayers();
    let targetPlayers = players.filter(p => p.name === GITHUB_USER_1 || p.name === GITHUB_USER_2);

    // CHARACTER SELECTION
    if (componentId.startsWith("char_")) {
        let character = componentId.replace("char_", "").toUpperCase();
        let characterNames = {
            sukuna: "👹 SUKUNA - Shrine Domain Master",
            gojo: "👓 GOJO - Limitless User",
            yuji: "🩸 YUJI - Sukuna's Vessel",
            todo: "💪 TODO - Boogie Woogie Master"
        };
        
        for (let p of targetPlayers) {
            p.showToast(`⚡ ${characterNames[componentId.replace("char_", "")]} SELECTED!`, { color: "#FFD700", duration: 5 });
            p.playSound("Select_Sound");
        }
    }

    // SEND BATTLE MESSAGE
    if (componentId === "send_battle_msg") {
        let msgText = event.getInputValue("battle_chat");
        
        if (msgText && msgText.trim() !== "") {
            for (let p of targetPlayers) {
                p.showToast(`🎯 ${player.name}: ${msgText}`, { duration: 6 });
                p.playSound("Message_Received_Sound");
            }
        }
    }

    // ACTIVATE EFFECTS
    if (componentId === "activate_effects") {
        for (let p of targetPlayers) {
            p.applyStatusEffect("SPEED_BOOST_2", 30);
            p.applyStatusEffect("STRENGTH_BOOST_2", 30);
            p.playSound("Power_Up_Sound");
            p.showToast("🔥 JJK EFFECTS ACTIVATED! Battle Arena Ready!", { color: "#E91E63", duration: 8 });
            
            // Grant bonus rewards
            p.grantCurrency("InGameCash", 5000);
        }
    }

    // GRANT POWER-UP
    if (componentId === "grant_power") {
        for (let p of targetPlayers) {
            p.applyStatusEffect("SPEED_BOOST_3", 20);
            p.applyStatusEffect("STRENGTH_BOOST_3", 20);
            p.grantCurrency("InGameCash", 10000);
            p.playSound("Achievement_Unlock");
            p.showToast("⚡ POWER-UP GRANTED! +10K Cash, Boost Activated!", { color: "#FF9800", duration: 8 });
        }
    }

    // SHOW STATS
    if (componentId === "show_stats") {
        let timestamp = new Date().toLocaleTimeString();
        for (let p of targetPlayers) {
            p.showToast(`📊 Battle Stats Requested at ${timestamp}`, { color: "#2196F3", duration: 5 });
            p.showToast("🎯 Activate the Canvas Battle Arena to see live combo counter!", { color: "#4CAF50", duration: 6 });
        }
    }
});

// =========================================
// AUTO-OPEN MENU ON SPAWN
// =========================================

studio.onEvent("game", "playerSpawn", (event) => {
    let p = event.player;
    if (p.name === GITHUB_USER_1 || p.name === GITHUB_USER_2) {
        setTimeout(() => {
            openDevMenu(p);
            p.showToast("🎮 Dev Terminal Ready! Select Your Character!", { color: "#FFD700", duration: 4 });
        }, 2000);
    }
});

// =========================================
// HOTKEY TO REOPEN MENU (PRESS 'M')
// =========================================

studio.onEvent("game", "playerUpdate", (event) => {
    // This allows manual menu reopening through input detection
    // Pair with keybind detection if available in your Gimkit version
});

// =========================================
// SCORE TRACKING & COMBO SYSTEM
// =========================================

let comboCounter = {};

studio.onEvent("game", "correctAnswer", (event) => {
    let p = event.player;
    
    if (p.name === GITHUB_USER_1 || p.name === GITHUB_USER_2) {
        comboCounter[p.name] = (comboCounter[p.name] || 0) + 1;
        let combo = comboCounter[p.name];
        
        // COMBO MILESTONES
        if (combo === 5) {
            p.playSound("Achievement_Unlock");
            p.showToast("🔥 5-HIT COMBO! Sukuna Mode Active!", { color: "#ff1744", duration: 4 });
        }
        if (combo === 10) {
            p.playSound("Achievement_Unlock");
            p.showToast("⚡ 10-HIT COMBO! Gojo's Limitless Activated!", { color: "#00d4ff", duration: 4 });
        }
        if (combo === 15) {
            p.playSound("Achievement_Unlock");
            p.showToast("🩸 15-HIT COMBO! Vessel Domain Unlocked!", { color: "#ff6b9d", duration: 4 });
        }
        if (combo === 20) {
            p.playSound("Achievement_Unlock");
            p.showToast("💪 20-HIT COMBO! ULTIMATE POWER!", { color: "#9c27b0", duration: 5 });
            p.grantCurrency("InGameCash", 50000);
        }
    }
});

studio.onEvent("game", "incorrectAnswer", (event) => {
    let p = event.player;
    
    if (p.name === GITHUB_USER_1 || p.name === GITHUB_USER_2) {
        let combo = comboCounter[p.name] || 0;
        comboCounter[p.name] = 0;
        
        if (combo > 0) {
            p.playSound("Error_Sound");
            p.showToast(`💔 Combo Broken! You had ${combo}x Combo!`, { color: "#FF5252", duration: 4 });
        }
    }
});

// =========================================
// TEAM BONUS SYSTEM
// =========================================

studio.onEvent("game", "questionAnswered", (event) => {
    let players = studio.getAllPlayers();
    let devPlayers = players.filter(p => p.name === GITHUB_USER_1 || p.name === GITHUB_USER_2);
    
    if (devPlayers.length === 2) {
        let correctCount = devPlayers.filter(p => event.player.name === p.name).length;
        
        if (correctCount > 0) {
            for (let p of devPlayers) {
                p.grantCurrency("InGameCash", 2000);
            }
        }
    }
});

console.log("✅ JJK Gimkit Integration Loaded!");
console.log("🎮 Type openDevMenu(player) or press M to open Battle Terminal");
