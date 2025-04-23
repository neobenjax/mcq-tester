document.addEventListener("DOMContentLoaded", () => {
    const quizForm = document.getElementById("quiz-form");
    const submitBtn = document.getElementById("submit-btn");
    const resetBtn = document.getElementById("reset-btn");
    const scoreBanner = document.getElementById("score-banner");

    fetch("mcqs.json")
        .then(response => response.json())
        .then(data => {
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

            submitBtn.addEventListener("click", () => {
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
            });

            resetBtn.addEventListener("click", () => {
                location.reload();
            });
        })
        .catch(error => {
            quizForm.innerHTML = "Failed to load quiz data.";
            console.error("Error loading mcqs.json:", error);
        });
});
