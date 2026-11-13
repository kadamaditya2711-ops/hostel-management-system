const API = "http://localhost:5000/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}


// =========================
// LOAD STUDENTS
// =========================

async function loadStudents() {

    try {

        const response = await fetch(
            `${API}/students`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        const select =
            document.getElementById("student_id");

        select.innerHTML =
            `<option value="">
                Select Student
            </option>`;

        data.students.forEach(student => {

            select.innerHTML += `
                <option value="${student.student_id}">
                    ${student.full_name}
                </option>
            `;

        });

    } catch (error) {

        console.error(
            "LOAD STUDENTS ERROR:",
            error
        );

    }
}


// =========================
// LOAD COMPLAINTS
// =========================

async function loadComplaints() {

    try {

        const response = await fetch(
            `${API}/complaints`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        const body =
            document.getElementById("complaintsBody");

        body.innerHTML = "";


        if (!data.complaints || data.complaints.length === 0) {

            body.innerHTML = `
                <tr>
                    <td colspan="7">
                        No complaints found
                    </td>
                </tr>
            `;

            return;
        }


        data.complaints.forEach(item => {

            body.innerHTML += `
                <tr>

                    <td>${item.complaint_id}</td>

                    <td>${item.full_name}</td>

                    <td>${item.category}</td>

                    <td>${item.subject}</td>

                    <td>${item.priority}</td>

                    <td>${item.status}</td>

                    <td>

                        ${
                            item.status !== "RESOLVED"
                            ?
                            `
                            <button
                                class="small-btn"
                                onclick="resolveComplaint(${item.complaint_id})">
                                Resolve
                            </button>
                            `
                            :
                            "Resolved"
                        }

                    </td>

                </tr>
            `;

        });

    } catch (error) {

        console.error(
            "LOAD COMPLAINTS ERROR:",
            error
        );

    }
}


// =========================
// SUBMIT COMPLAINT
// =========================

document
    .getElementById("complaintForm")
    .addEventListener("submit", async event => {

        event.preventDefault();


        const complaintData = {

            student_id:
                Number(
                    document.getElementById(
                        "student_id"
                    ).value
                ),

            category:
                document.getElementById(
                    "category"
                ).value,

            subject:
                document.getElementById(
                    "subject"
                ).value,

            description:
                document.getElementById(
                    "description"
                ).value,

            priority:
                document.getElementById(
                    "priority"
                ).value

        };


        try {

            const response = await fetch(
                `${API}/complaints`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(
                            complaintData
                        )
                }
            );


            const result =
                await response.json();


            document.getElementById(
                "message"
            ).textContent =
                result.message;


            if (response.ok) {

                document
                    .getElementById(
                        "complaintForm"
                    )
                    .reset();

                loadComplaints();

            }

        } catch (error) {

            console.error(
                "COMPLAINT ERROR:",
                error
            );

            document.getElementById(
                "message"
            ).textContent =
                "Cannot connect to backend";

        }

    });


// =========================
// RESOLVE COMPLAINT
// =========================

window.resolveComplaint = async function(id) {

    const confirmed =
        confirm(
            "Are you sure you want to resolve this complaint?"
        );

    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${API}/complaints/${id}/status`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    status: "RESOLVED"
                })
            }
        );


        const result =
            await response.json();


        alert(result.message);

        loadComplaints();

    } catch (error) {

        console.error(
            "RESOLVE COMPLAINT ERROR:",
            error
        );

    }

};


// =========================
// BACK TO DASHBOARD
// =========================

document
    .getElementById("backBtn")
    .addEventListener("click", () => {

        window.location.href =
            "dashboard.html";

    });


// =========================
// INITIAL LOAD
// =========================

loadStudents();
loadComplaints();