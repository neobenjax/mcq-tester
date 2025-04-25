document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.getElementById("generate-mcq-btn");
    const spinner = document.createElement("div");
    spinner.className = "spinner";
    spinner.style.display = "none";
    generateBtn.parentNode.insertBefore(spinner, generateBtn.nextSibling);

    const toast = document.getElementById("toast");
    let lastPromptUsed = "";

    async function generateQuizFromPrompt(prompt, apiKey) {
        const systemMessage = {
            role: "system",
            content: "You are a quiz generator. Output only JSON for a multiple choice quiz formatted like this: " +
                '{ "title": "Generated Quiz", "description": "Based on your prompt", "questions": [ { "id": "1", "question": "Example?", "options": { "a": "One", "b": "Two", "c": "Three", "d": "Four" }, "correct_answer": "a" } ] }'
        };

        const userMessage = {
            role: "user",
            content: prompt
        };

        const response = await fetch(appConfig.openAI.apiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: appConfig.openAI.model,
                messages: [systemMessage, userMessage],
                temperature: appConfig.openAI.temperature
            })
        });

        const result = await response.json();
        const content = result.choices[0].message.content;

        try {
            const parsed = JSON.parse(content);
            return parsed;
        } catch (err) {
            console.error("Error parsing JSON from ChatGPT:", err);
            throw new Error("La respuesta no tiene un formato JSON válido.");
        }
    }

    function lockButtonTemporarily(button, seconds) {
        button.disabled = true;
        let counter = seconds;

        const originalText = "Generar MCQ desde ChatGPT";
        const interval = setInterval(() => {
            button.textContent = `Espera ${counter}s...`;
            counter--;
            if (counter < 0) {
                clearInterval(interval);
                button.disabled = false;
                button.textContent = originalText;
            }
        }, 1000);
    }

    function showToast(message, type = "success") {
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => {
            toast.className = "toast";
        }, 4000);
    }

    generateBtn.addEventListener("click", async () => {
        const prompt = document.getElementById("prompt-input").value.trim();
        const apiKey = document.getElementById("api-key").value.trim();

        if (!prompt || !apiKey) {
            showToast("Por favor ingresa un prompt y tu API Key.", "error");
            return;
        }

        if (prompt === lastPromptUsed) {
            showToast("Este prompt ya fue utilizado. Modifica el texto para generar un nuevo quiz.", "error");
            return;
        }

        generateBtn.disabled = true;
        spinner.style.display = "inline-block";
        generateBtn.textContent = "Generando...";

        try {
            const data = await generateQuizFromPrompt(prompt, apiKey);
            if (!quizCore.validateQuizData(data)) throw new Error("Estructura inválida.");
            lastPromptUsed = prompt;
            lastLoadedQuizData = data;
            randomizedQuestions = quizCore.getSubsetOfQuestions(data);
            quizCore.loadQuizFromData(data, randomizedQuestions);
            showToast("MCQ generado exitosamente.", "success");
        } catch (err) {
            showToast("Error: " + err.message, "error");
        } finally {
            spinner.style.display = "none";
            lockButtonTemporarily(generateBtn, appConfig.generation.buttonLockSeconds);
        }
    });
});
