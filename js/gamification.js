const Gamification = (function () {
    const POINTS_KEY = "gamePoints";
    const STREAK_KEY = "gameStreak";

    let points = 0;
    let streak = 0;

    function loadFromStorage() {
        points = parseInt(localStorage.getItem(POINTS_KEY)) || 0;
        streak = parseInt(localStorage.getItem(STREAK_KEY)) || 0;
    }

    function saveToStorage() {
        localStorage.setItem(POINTS_KEY, points);
        localStorage.setItem(STREAK_KEY, streak);
    }

    function updateUI() {
        const pointElem = document.getElementById("points-count");
        const streakElem = document.getElementById("streak-count");
        if (pointElem) pointElem.textContent = points;
        if (streakElem) streakElem.textContent = streak;
        checkStreakEffect();
    }

    function addPoints(value = 10) {
        points += value;
        saveToStorage();
        updateUI();
    }

    function resetStreak() {
        streak = 0;
        saveToStorage();
        updateUI();
    }

    function incrementStreak() {
        streak += 1;
        saveToStorage();
        updateUI();
    }

    function resetAll() {
        points = 0;
        streak = 0;
        saveToStorage();
        updateUI();
    }

    function getStatus() {
        return { points, streak };
    }

    function checkStreakEffect() {
        const streakElem = document.getElementById("streak-count");
        const streakBlock = streakElem?.parentElement;
    
        if (!streakElem || !streakBlock) return;
    
        if (streak >= 5) {
            streakBlock.classList.add("glow-streak");
            launchConfetti(); // 🎉 solo cuando se supera o alcanza la racha
        } else {
            streakBlock.classList.remove("glow-streak");
        }
    }

    function launchConfetti() {
        if (typeof confetti === "function") {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }
    

    // Inicialización automática
    loadFromStorage();

    return {
        addPoints,
        resetStreak,
        incrementStreak,
        resetAll,
        getStatus,
        updateUI
    };
})();