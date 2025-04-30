// config.js
const appConfig = {
    env: (function () {
        const hostname = window.location.hostname;
        if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
            return "local";
        }
        if (hostname.includes("github.io")) {
            return "production";
        }
        return "unknown";
    })(),

    generation: {
        buttonLockSeconds: 60
    },

    openAI: {
        apiEndpoint: "https://api.openai.com/v1/chat/completions",
        model: "gpt-3.5-turbo",
        temperature: 0.7
    }
};