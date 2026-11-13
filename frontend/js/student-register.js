const registerForm =
    document.getElementById("studentRegisterForm");

const registerMessage =
    document.getElementById("registerMessage");


registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        registerMessage.textContent =
            "Creating account...";

        registerMessage.className =
            "auth-message";


        const data = {

            full_name:
                document.getElementById("full_name").value.trim(),

            username:
                document.getElementById("username").value.trim(),

            password:
                document.getElementById("password").value,

            confirm_password:
                document.getElementById("confirm_password").value,

            mobile:
                document.getElementById("mobile").value.trim(),

            email:
                document.getElementById("email").value.trim(),

            gender:
                document.getElementById("gender").value,

            dob:
                document.getElementById("dob").value,

            address:
                document.getElementById("address").value.trim(),

            guardian_name:
                document.getElementById("guardian_name").value.trim(),

            guardian_contact:
                document.getElementById("guardian_contact").value.trim(),

            college_name:
                document.getElementById("college_name").value.trim(),

            course:
                document.getElementById("course").value.trim(),

            academic_year:
                document.getElementById("academic_year").value.trim(),

            emergency_contact:
                document
                    .getElementById("emergency_contact")
                    .value
                    .trim()

        };


        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/student-auth/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(data)
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                registerMessage.textContent =
                    result.message ||
                    "Registration failed.";

                registerMessage.classList.add(
                    "error"
                );

                return;
            }


            registerMessage.textContent =
                result.message;


            registerMessage.classList.add(
                "success"
            );


            registerForm.reset();


        }
        catch (error) {

            console.error(error);

            registerMessage.textContent =
                "Unable to connect to server.";

            registerMessage.classList.add(
                "error"
            );

        }

    }
);