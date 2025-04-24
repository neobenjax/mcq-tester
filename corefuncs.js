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

    const CLASS_FADE = "fade";
    const CLASS_FADE_IN = "fade-in";
    const CLASS_CORRECT = "correct";
    const CLASS_WRONG = "wrong";

    function createOption(key, value, questionId) {
        const optionHTML = `
            <label class="option">
                <input type="radio" name="q${questionId}" value="${key}">
                ${key.toUpperCase()}. ${value}
            </label>
        `;
        const wrapper = document.createElement("div");
        wrapper.innerHTML = optionHTML.trim();
        return wrapper.firstChild;
    }

    function validateQuizData(data) {
        if (!data.title || !data.description || !Array.isArray(data.questions)) return false;
        return data.questions.every(q =>
            q.id && q.question && q.options && typeof q.options === 'object' && q.correct_answer);
    }

    function shuffleArray(array) {
        return array
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    }

    function getSubsetOfQuestions(data) {
        const selection = questionCountSelect.value;
        const count = selection === 'all' ? data.questions.length : parseInt(selection, 10);
        return shuffleArray(data.questions).slice(0, count);
    }

    function createQuestionBlock(q, index) {
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

        return questionBlock;
    }

    function loadQuizFromData(data, overrideQuestions = null) {
        quizForm.replaceChildren();
        scoreBanner.textContent = "";

        const questionsToUse = overrideQuestions || data.questions;

        document.getElementById("quiz-title").textContent = data.title;
        document.getElementById("quiz-description").textContent = data.description;
        document.getElementById("question-count").textContent = questionsToUse.length;

        questionsToUse.forEach((q, index) => {
            const questionBlock = createQuestionBlock(q, index);
            quizForm.appendChild(questionBlock);
        });
    }

    function animateRefresh(questionsSubset) {
        quizForm.classList.add(CLASS_FADE);

        setTimeout(() => {
            loadQuizFromData(lastLoadedQuizData, questionsSubset);

            quizForm.classList.remove(CLASS_FADE);
            quizForm.classList.add(CLASS_FADE_IN);

            setTimeout(() => {
                quizForm.classList.remove(CLASS_FADE_IN);
            }, 400);
        }, 400);
    }

    function debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
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
                    resultLabel.className = `result-label ${CLASS_CORRECT}`;
                    selected.parentElement.classList.add("correct-answer");
                } else {
                    resultLabel.textContent = "Wrong";
                    resultLabel.className = `result-label ${CLASS_WRONG}`;
                    selected.parentElement.classList.add("wrong-answer");
                    const correctOption = document.querySelector(`input[name=q${q.id}][value=${q.correct_answer}]`);
                    if (correctOption) {
                        correctOption.parentElement.classList.add("correct-answer");
                    }
                }
            } else {
                resultLabel.textContent = "No answer selected";
                resultLabel.className = `result-label ${CLASS_WRONG}`;
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

    jsonLoader.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const parsedData = JSON.parse(text);
            if (!validateQuizData(parsedData)) throw new Error("Invalid quiz structure.");
            lastLoadedQuizData = parsedData;
            randomizedQuestions = getSubsetOfQuestions(parsedData);
            loadQuizFromData(parsedData, randomizedQuestions);
        } catch (err) {
            quizForm.innerHTML = `<div class="error-message">Error loading JSON: ${err.message}</div>`;
            console.error("JSON parse error:", err);
        }
    });

    questionCountSelect.addEventListener("change", debounce(() => {
        if (lastLoadedQuizData) {
            randomizedQuestions = getSubsetOfQuestions(lastLoadedQuizData);
            animateRefresh(randomizedQuestions);
        }
    }, 300));
});
