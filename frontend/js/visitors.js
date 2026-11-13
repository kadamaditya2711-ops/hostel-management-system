const API = "http://localhost:5000/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}


// =========================
// LOAD VISITORS
// =========================

async function loadVisitors() {

    const response = await fetch(
        `${API}/visitors`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    const select =
        document.getElementById("visitor_id");

    select.innerHTML =
        `<option value="">
            Select Visitor
        </option>`;

    data.visitors.forEach(visitor => {

        select.innerHTML += `
            <option value="${visitor.visitor_id}">
                ${visitor.full_name} - ${visitor.mobile}
            </option>
        `;

    });
}


// =========================
// LOAD STUDENTS
// =========================

async function loadStudents() {

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
}


// =========================
// LOAD VISITOR LOGS
// =========================

async function loadVisitorLogs() {

    const response = await fetch(
        `${API}/visitor-logs`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    const body =
        document.getElementById("visitorLogsBody");

    body.innerHTML = "";


    if (!data.logs || data.logs.length === 0) {

        body.innerHTML = `
            <tr>
                <td colspan="8">
                    No visitor logs found
                </td>
            </tr>
        `;

        return;
    }


    data.logs.forEach(log => {

        body.innerHTML += `
            <tr>

                <td>${log.visitor_log_id}</td>

                <td>${log.visitor_name}</td>

                <td>${log.student_name}</td>

                <td>${log.purpose}</td>

                <td>
                    ${log.check_in
                        ? new Date(log.check_in).toLocaleString()
                        : "-"}
                </td>

                <td>
                    ${log.check_out
                        ? new Date(log.check_out).toLocaleString()
                        : "-"}
                </td>

                <td>${log.status}</td>

                <td>
                    ${
                        log.status === "INSIDE"
                        ?
                        `
                        <button
                            class="small-btn"
                            onclick="checkoutVisitor(${log.visitor_log_id})">
                            Check-Out
                        </button>
                        `
                        :
                        "Completed"
                    }
                </td>

            </tr>
        `;

    });
}


// =========================
// ADD VISITOR
// =========================

document
    .getElementById("visitorForm")
    .addEventListener("submit", async event => {

        event.preventDefault();

        const data = {

            full_name:
                document.getElementById("full_name").value,

            mobile:
                document.getElementById("mobile").value,

            relation:
                document.getElementById("relation").value

        };


        const response = await fetch(
            `${API}/visitors`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify(data)
            }
        );


        const result =
            await response.json();


        document.getElementById(
            "visitorMessage"
        ).textContent =
            result.message;


        if (response.ok) {

            document
                .getElementById("visitorForm")
                .reset();

            loadVisitors();

        }

    });


// =========================
// CHECK-IN
// =========================

document
    .getElementById("checkinForm")
    .addEventListener("submit", async event => {

        event.preventDefault();

        const data = {

            visitor_id:
                Number(
                    document.getElementById(
                        "visitor_id"
                    ).value
                ),

            student_id:
                Number(
                    document.getElementById(
                        "student_id"
                    ).value
                ),

            purpose:
                document.getElementById(
                    "purpose"
                ).value

        };


        const response = await fetch(
            `${API}/visitor-logs`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify(data)
            }
        );


        const result =
            await response.json();


        document.getElementById(
            "checkinMessage"
        ).textContent =
            result.message;


        if (response.ok) {

            document
                .getElementById("checkinForm")
                .reset();

            loadVisitorLogs();

        }

    });


// =========================
// CHECK-OUT
// =========================

window.checkoutVisitor = async function(id) {

    const confirmed =
        confirm(
            "Are you sure you want to check-out this visitor?"
        );

    if (!confirmed) {
        return;
    }


    const response = await fetch(
        `${API}/visitor-logs/${id}/checkout`,
        {
            method: "PUT",

            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );


    const result =
        await response.json();


    alert(result.message);

    loadVisitorLogs();
};


// =========================
// BACK
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

loadVisitors();
loadStudents();
loadVisitorLogs();