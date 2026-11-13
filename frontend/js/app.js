const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    message.textContent = "Logging in...";

    try {
        const response = await fetch(
            "http://localhost:5000/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            message.textContent =
                data.message || "Login failed";

            return;
        }

        localStorage.setItem("token", data.token);

        message.textContent = "Login successful!";


setTimeout(() => {
    window.location.href = "dashboard.html";
}, 500);
    } catch (error) {
        console.error("LOGIN ERROR:", error);

        message.textContent =
            "Cannot connect to backend";
    }
});