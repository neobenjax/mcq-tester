document.addEventListener("DOMContentLoaded", () => {
    const quizForm = document.getElementById("quiz-form");
    const submitBtn = document.getElementById("submit-btn");
    const resetBtn = document.getElementById("reset-btn");
    const scoreBanner = document.getElementById("score-banner");
    const jsonLoader = document.getElementById("json-loader");
    const questionCountSelect = document.getElementById("question-count-select");
    const randomizeBtn = document.getElementById("randomize-btn");

    let lastLoadedQuizData = null;
    let randomizedQuestions = [];

    function createOption(key, value, questionId) {
        const label = document.createElement("label");
        label.className = "option";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = `q${questionId}`;
        input.value = key;

        label.appendChild(input);
        label.append(` ${key.toUpperCase()}. ${value}`);

        return label;
    }

    function validateQuizData(data) {
        if (!data.title || !data.description || !Array.isArray(data.questions)) return false;
        return data.questions.every(q =>
            q.id && q.question && q.options && typeof q.options === 'object' && q.correct_answer);
    }

    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function getSubsetOfQuestions(data) {
        const selection = questionCountSelect.value;
        const count = selection === 'all' ? data.questions.length : parseInt(selection, 10);
        return shuffleArray(data.questions).slice(0, count);
    }

    function loadQuizFromData(data, overrideQuestions = null) {
        quizForm.replaceChildren();
        scoreBanner.textContent = "";

        const questionsToUse = overrideQuestions || data.questions;

        document.getElementById("quiz-title").textContent = data.title;
        document.getElementById("quiz-description").textContent = data.description;
        document.getElementById("question-count").textContent = questionsToUse.length;

        questionsToUse.forEach((q, index) => {
            const questionBlock = document.createElement("div");
            questionBlock.className = "question-block";
            questionBlock.id = `q${q.id}`;

            const questionText = document.createElement("div");
            questionText.className = "question";
            questionText.textContent = `${index + 1}. ${q.question}`;

            questionBlock.appendChild(questionText);

            if (q.info) {
                const infoBlock = document.createElement("div");
                infoBlock.className = "question-info";
                infoBlock.innerHTML = q.info; // ⚠️ Safe only if data is trusted
                questionBlock.appendChild(infoBlock);
            }
            

            Object.entries(q.options).forEach(([key, value]) => {
                questionBlock.appendChild(createOption(key, value, q.id));
            });

            const resultLabel = document.createElement("div");
            resultLabel.className = "result-label";
            resultLabel.id = `result-q${q.id}`;

            questionBlock.appendChild(resultLabel);
            quizForm.appendChild(questionBlock);
        });
    }

    function animateRefresh(questionsSubset) {
        quizForm.classList.add("fade");
    
        setTimeout(() => {
            loadQuizFromData(lastLoadedQuizData, questionsSubset);
    
            quizForm.classList.remove("fade");
            quizForm.classList.add("fade-in");
    
            setTimeout(() => {
                quizForm.classList.remove("fade-in");
            }, 400);
        }, 400);
    }
    

    submitBtn.addEventListener("click", () => {
        if (!lastLoadedQuizData || !randomizedQuestions.length) return;

        let score = 0;

        randomizedQuestions.forEach(q => {
            const selected = document.querySelector(`input[name=q${q.id}]:checked`);
            const resultLabel = document.getElementById(`result-q${q.id}`);
            if (selected) {
                if (selected.value === q.correct_answer) {
                    score++;
                    resultLabel.textContent = "Correct";
                    resultLabel.className = "result-label correct";
                    selected.parentElement.classList.add("correct-answer");
                } else {
                    resultLabel.textContent = "Wrong";
                    resultLabel.className = "result-label wrong";
                    selected.parentElement.classList.add("wrong-answer");
                    const correctOption = document.querySelector(`input[name=q${q.id}][value=${q.correct_answer}]`);
                    if (correctOption) {
                        correctOption.parentElement.classList.add("correct-answer");
                    }
                }
            } else {
                resultLabel.textContent = "No answer selected";
                resultLabel.className = "result-label wrong";
            }
        });

        scoreBanner.textContent = `Your final score is ${score}/${randomizedQuestions.length}`;
    });

    resetBtn.addEventListener("click", () => {
        if (lastLoadedQuizData) loadQuizFromData(lastLoadedQuizData, randomizedQuestions);
    });

    randomizeBtn.addEventListener("click", () => {
        if (!lastLoadedQuizData) return;
        randomizedQuestions = getSubsetOfQuestions(lastLoadedQuizData);
        loadQuizFromData(lastLoadedQuizData, randomizedQuestions);
    });

    jsonLoader.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const parsedData = JSON.parse(e.target.result);
                if (!validateQuizData(parsedData)) throw new Error("Invalid quiz structure.");
                lastLoadedQuizData = parsedData;
                randomizedQuestions = getSubsetOfQuestions(parsedData);
                loadQuizFromData(parsedData, randomizedQuestions);
            } catch (err) {
                quizForm.innerHTML = "Error loading JSON: Invalid format.";
                console.error("JSON parse error:", err);
            }
        };
        reader.readAsText(file);
    });

    questionCountSelect.addEventListener("change", () => {
        if (lastLoadedQuizData) {
            randomizedQuestions = getSubsetOfQuestions(lastLoadedQuizData);
            animateRefresh(randomizedQuestions);
        }
    });
    
});
