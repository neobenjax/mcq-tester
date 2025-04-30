const ErrorTracker = (function () {
    const STORAGE_KEY = "frequentWrongAnswers";
    let errors = {};

    function load() {
        errors = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(errors));
    }

    function recordWrong(id) {
        if (!errors[id]) errors[id] = 1;
        else errors[id]++;
        save();
    }

    function reset() {
        errors = {};
        save();
    }

    function getFrequentWrong(threshold = 2) {
        return Object.entries(errors)
            .filter(([_, count]) => count >= threshold)
            .map(([id]) => id);
    }

    function getAll() {
        return errors;
    }

    function clearIfCorrect(id) {
        if (errors[id]) {
            delete errors[id];
            save();
        }
    }

    load();

    return {
        recordWrong,
        reset,
        getFrequentWrong,
        getAll,
        clearIfCorrect
    };
})();
