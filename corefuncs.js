// ==================
// FUNCIONES PRINCIPALES
// ==================

// Validar formato del JSON
function validateQuizData(data) {
    if (!data.title || !data.description || !Array.isArray(data.questions)) return false;
    return data.questions.every(q =>
        q.id && q.question && q.options && typeof q.options === 'object' && q.correct_answer
    );
}

// Mezclar un arreglo (Fisher-Yates)
function shuffleArray(array) {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

// Subconjunto de preguntas
function getSubsetOfQuestions(data) {
    const selection = questionCountSelect.value;
    const count = selection === 'all' ? data.questions.length : parseInt(selection, 10);
    return shuffleArray(data.questions).slice(0, count);
}

// Crear opciones de respuesta
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

// Crear bloque de pregunta
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
        infoBlock.innerHTML = q.info;
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

// Cargar preguntas al formulario
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
    showToast("Quiz cargado exitosamente.", "success");
}

// Animar refresco visual
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

// Evitar rebotes
function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

function resetFilters() {
    window.filterAllBtn.disabled = true;
    window.filterCorrectBtn.disabled = true;
    window.filterWrongBtn.disabled = true;

    // También mostrar todo
    document.querySelectorAll(".question-block").forEach(block => {
        block.style.display = "block";
    });
}

function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = "toast";
    }, 4000);
}

// ==================
// EXPONER FUNCIONES
// ==================
window.quizCore = {
    validateQuizData,
    shuffleArray,
    getSubsetOfQuestions,
    createOption,
    createQuestionBlock,
    loadQuizFromData,
    animateRefresh,
    debounce,
    resetFilters,
    showToast
};

// ==================
// MANEJO DE EVENTOS
// ==================

document.addEventListener("DOMContentLoaded", () => {
    const CLASS_CORRECT = "correct";
    const CLASS_WRONG = "wrong";

    window.fileUploadBlock = document.getElementById("file-upload-block");
    window.quizForm = document.getElementById("quiz-form");
    window.quizDropdown = document.getElementById("quiz-dropdown");
    window.loadSelectedQuizBtn = document.getElementById("load-selected-quiz");
    window.submitBtn = document.getElementById("submit-btn");
    window.resetBtn = document.getElementById("reset-btn");
    window.scoreBanner = document.getElementById("score-banner");
    window.jsonLoader = document.getElementById("json-loader");
    window.questionCountSelect = document.getElementById("question-count-select");
    window.randomizeBtn = document.getElementById("randomize-btn");
    window.filterAllBtn = document.getElementById("filter-all");
    window.filterCorrectBtn = document.getElementById("filter-correct");
    window.filterWrongBtn = document.getElementById("filter-wrong");

    window.toast = document.getElementById("toast");

    window.lastLoadedQuizData = null;
    window.randomizedQuestions = [];

    const githubHost = 'github.io';
    const isRunningFromGithub = window.location.hostname.includes(githubHost);
    const rootFolder = isRunningFromGithub ? '' : '/';
    const basePath = `${rootFolder}mcqs/IFC/`;

    const availableQuizzes = [
        `${basePath}ifc-chapter15.json`,
        `${basePath}ifc-practice-test-1-1-An-Introduction-To-The-Mutual-Funds-Marketplace.json`,
        `${basePath}ifc-practice-test-1-2-the-know-your-client-communication-process.json`,
        `${basePath}ifc-practice-test-1-3-understanding-investment-products-and-portfolios.json`,
        `${basePath}ifc-practice-test-1-4-the-modern-mutual-fund.json`,
        `${basePath}ifc-practice-test-1-5-analysis-of-mutual-funds.json`,
        `${basePath}ifc-practice-test-1-6-understanding-alternative-managed-products.json`,
        `${basePath}ifc-practice-test-1-7-Evaluating-and-Selecting-Mutual-Funds.json`,
        `${basePath}ifc-practice-test-1-8-ethics-compliance-and-mutual-fund-regulations.json`,
        `${basePath}ULTIMATE-QUIZZ.json`,
    ];

    availableQuizzes.forEach(path => {
        const option = document.createElement("option");
        option.value = path;
        option.textContent = path.split("/").pop().replace(".json", "").replace(/-/g, " ").toUpperCase();
        quizDropdown.appendChild(option);
    });

    if (isRunningFromGithub && fileUploadBlock) {
        fileUploadBlock.style.display = "none";
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

        window.filterAllBtn.disabled = false;
        window.filterCorrectBtn.disabled = false;
        window.filterWrongBtn.disabled = false;
    });

    resetBtn.addEventListener("click", () => {
        if (lastLoadedQuizData) quizCore.loadQuizFromData(lastLoadedQuizData, randomizedQuestions);
        resetFilters();
    });

    randomizeBtn.addEventListener("click", () => {
        if (!lastLoadedQuizData) return;
        randomizedQuestions = quizCore.getSubsetOfQuestions(lastLoadedQuizData);
        quizCore.loadQuizFromData(lastLoadedQuizData, randomizedQuestions);
        resetFilters();
    });

    jsonLoader.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        try {
            const text = await file.text();
            const parsedData = JSON.parse(text);
            if (!quizCore.validateQuizData(parsedData)) throw new Error("Invalid quiz structure.");
            lastLoadedQuizData = parsedData;
            randomizedQuestions = quizCore.getSubsetOfQuestions(parsedData);
            quizCore.loadQuizFromData(parsedData, randomizedQuestions);
            resetFilters();
        } catch (err) {
            quizForm.innerHTML = `<div class="error-message">Error loading JSON: ${err.message}</div>`;
            console.error("JSON parse error:", err);
        }
    });

    questionCountSelect.addEventListener("change", quizCore.debounce(() => {
        if (lastLoadedQuizData) {
            randomizedQuestions = quizCore.getSubsetOfQuestions(lastLoadedQuizData);
            quizCore.animateRefresh(randomizedQuestions);
            resetFilters();
        }
    }, 300));

    filterAllBtn.addEventListener("click", () => {
        document.querySelectorAll(".question-block").forEach(block => {
            block.style.display = "block";
        });
    });

    filterCorrectBtn.addEventListener("click", () => {
        document.querySelectorAll(".question-block").forEach(block => {
            const result = block.querySelector(".result-label");
            if (result && result.classList.contains("correct")) {
                block.style.display = "block";
            } else {
                block.style.display = "none";
            }
        });
    });

    filterWrongBtn.addEventListener("click", () => {
        document.querySelectorAll(".question-block").forEach(block => {
            const result = block.querySelector(".result-label");
            if (result && result.classList.contains("wrong")) {
                block.style.display = "block";
            } else {
                block.style.display = "none";
            }
        });
    });

    loadSelectedQuizBtn.addEventListener("click", async () => {
        const selectedPath = quizDropdown.value;
        if (!selectedPath) {
            alert("Por favor selecciona un quiz.");
            return;
        }

        try {
            const response = await fetch(selectedPath);
            if (!response.ok) throw new Error("No se pudo cargar el archivo.");
            const parsedData = await response.json();

            if (!quizCore.validateQuizData(parsedData)) throw new Error("Formato de quiz inválido.");

            lastLoadedQuizData = parsedData;
            randomizedQuestions = quizCore.getSubsetOfQuestions(parsedData);
            quizCore.loadQuizFromData(parsedData, randomizedQuestions);
            resetFilters(); // 🎯 Resetear filtros y mostrar todo
        } catch (error) {
            console.error("Error cargando quiz:", error);
            showToast("Error cargando el quiz " + err.message, "error");
        }
    });

});
