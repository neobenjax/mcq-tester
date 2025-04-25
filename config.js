// config.js
const appConfig = {
    openAI: {
        model: "gpt-3.5-turbo", // Aquí puedes cambiar rápido a "gpt-4", "gpt-4-turbo", etc.
        temperature: 0.7, // Creatividad de la respuesta (puedes ajustar entre 0.0 y 1.0)
        apiEndpoint: "https://api.openai.com/v1/chat/completions"
    },
    generation: {
        buttonLockSeconds: 60 // Segundos que el botón quedará bloqueado tras enviar petición
    }
};
