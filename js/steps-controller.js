const StepController = (function () {
    const steps = ["step-1", "step-2", "step-3"];
    let currentStepIndex = 0;

    function goToStep(index) {
        steps.forEach((id, i) => {
            const el = document.getElementById(id);
            if (el) el.style.display = i === index ? "block" : "none";
        });
        currentStepIndex = index;
    }

    function next() {
        if (currentStepIndex < steps.length - 1) {
            goToStep(currentStepIndex + 1);
        }
    }

    function reset() {
        goToStep(0);
    }

    goToStep(0);

    return {
        goToStep,
        next,
        reset
    };
})();