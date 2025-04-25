document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.getElementById("generate-mcq-btn");
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
    
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [systemMessage, userMessage],
                temperature: 0.7
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

    generateBtn.addEventListener("click", async () => {
        const prompt = document.getElementById("prompt-input").value;
        const apiKey = document.getElementById("api-key").value;
    
        if (!prompt || !apiKey) {
            alert("Por favor ingresa un prompt y tu API Key.");
            return;
        }
    
        generateBtn.disabled = true;
        generateBtn.textContent = "Generando...";
    
        try {
            const data = await generateQuizFromPrompt(prompt, apiKey);
            if (!validateQuizData(data)) throw new Error("Estructura inválida.");
            lastLoadedQuizData = data;
            randomizedQuestions = getSubsetOfQuestions(data);
            loadQuizFromData(data, randomizedQuestions);
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = "Generar MCQ desde ChatGPT";
        }
    });
});