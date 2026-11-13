const form =
    document.getElementById("studentLoginForm");

const message =
    document.getElementById("loginMessage");


form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const username =
            document
                .getElementById("username")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;


        message.textContent =
            "Logging in...";

        message.className =
            "student-login-message";


        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/auth/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            username,
                            password
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Login failed.";

                message.classList.add(
                    "error"
                );

                return;

            }


            /*
             * Student Login Only
             */

            if (
                !data.user ||
                data.user.role !== "STUDENT"
            ) {

                message.textContent =
                    "This login is only for students.";

                message.classList.add(
                    "error"
                );

                return;

            }


            // Save token

            localStorage.setItem(
                "token",
                data.token
            );


            // Save user

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            message.textContent =
                "Login successful!";

            message.classList.add(
                "success"
            );


            setTimeout(() => {

                window.location.href =
                    "student-dashboard.html";

            }, 500);


        }
        catch (error) {

            console.error(error);

            message.textContent =
                "Unable to connect to server.";

            message.classList.add(
                "error"
            );

        }

    }
);