document.addEventListener("DOMContentLoaded", () => {
    const quizForm = document.getElementById("quiz-form");
    const submitBtn = document.getElementById("submit-btn");
    const resetBtn = document.getElementById("reset-btn");
    const scoreBanner = document.getElementById("score-banner");
    const jsonLoader = document.getElementById("json-loader");

    let quizData = null;

    function loadQuizFromData(data) {
        quizForm.innerHTML = "";
        scoreBanner.textContent = "";

        document.getElementById("quiz-title").textContent = data.title;
        document.getElementById("quiz-description").textContent = data.description;
        document.getElementById("question-count").textContent = data.questions.length;

        data.questions.forEach((q, index) => {
            const questionBlock = document.createElement("div");
            questionBlock.className = "question-block";
            questionBlock.id = `q${q.id}`;

            const questionText = document.createElement("div");
            questionText.className = "question";
            questionText.textContent = `${index + 1}. ${q.question}`;

            const options = Object.entries(q.options).map(([key, value]) => {
                const label = document.createElement("label");
                label.className = "option";

                const input = document.createElement("input");
                input.type = "radio";
                input.name = `q${q.id}`;
                input.value = key;

                label.appendChild(input);
                label.append(` ${key.toUpperCase()}. ${value}`);
                return label;
            });

            const resultLabel = document.createElement("div");
            resultLabel.className = "result-label";
            resultLabel.id = `result-q${q.id}`;

            questionBlock.appendChild(questionText);
            options.forEach(opt => questionBlock.appendChild(opt));
            questionBlock.appendChild(resultLabel);

            quizForm.appendChild(questionBlock);
        });

        submitBtn.onclick = () => {
            let score = 0;

            data.questions.forEach(q => {
                const selected = document.querySelector(`input[name=q${q.id}]:checked`);
                const resultLabel = document.getElementById(`result-q${q.id}`);
                if (selected) {
                    if (selected.value === q.correct_answer) {
                        score++;
                        resultLabel.textContent = "Correct";
                        resultLabel.className = "result-label correct";
                    } else {
                        resultLabel.textContent = "Wrong";
                        resultLabel.className = "result-label wrong";
                    }
                } else {
                    resultLabel.textContent = "No answer selected";
                    resultLabel.className = "result-label wrong";
                }
            });

            scoreBanner.textContent = `Your final score is ${score}/${data.questions.length}`;
        };

        resetBtn.onclick = () => {
            if (quizData) loadQuizFromData(quizData);
        };
    }

    jsonLoader.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                quizData = JSON.parse(e.target.result);
                loadQuizFromData(quizData);
            } catch (err) {
                quizForm.innerHTML = "Error loading JSON: Invalid format.";
                console.error("JSON parse error:", err);
            }
        };
        reader.readAsText(file);
    });
});
