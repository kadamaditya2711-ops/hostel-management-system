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
// LOAD ATTENDANCE
// =========================

async function loadAttendance() {

    try {

        const response = await fetch(
            `${API}/attendance`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        const body =
            document.getElementById("attendanceBody");

        body.innerHTML = "";


        data.attendance.forEach(item => {

            body.innerHTML += `
                <tr>

                    <td>
                        ${item.attendance_id}
                    </td>

                    <td>
                        ${item.full_name}
                    </td>

                    <td>
                        ${item.attendance_date
                            ? item.attendance_date.substring(0, 10)
                            : "-"}
                    </td>

                    <td>
                        ${item.status}
                    </td>

                    <td>
                        ${item.remarks || "-"}
                    </td>

                    <td>
                        ${item.marked_by}
                    </td>

                </tr>
            `;

        });

    } catch (error) {

        console.error(
            "LOAD ATTENDANCE ERROR:",
            error
        );

    }
}


// =========================
// MARK ATTENDANCE
// =========================

document
    .getElementById("attendanceForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const attendanceData = {

                student_id:
                    Number(
                        document.getElementById(
                            "student_id"
                        ).value
                    ),

                attendance_date:
                    document.getElementById(
                        "attendance_date"
                    ).value,

                status:
                    document.getElementById(
                        "status"
                    ).value,

                remarks:
                    document.getElementById(
                        "remarks"
                    ).value || null

            };


            try {

                const response = await fetch(
                    `${API}/attendance`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify(
                                attendanceData
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
                            "attendanceForm"
                        )
                        .reset();

                    await loadAttendance();

                }

            } catch (error) {

                console.error(
                    "ATTENDANCE ERROR:",
                    error
                );

                document.getElementById(
                    "message"
                ).textContent =
                    "Cannot connect to backend";

            }

        }
    );


// =========================
// BACK
// =========================

document
    .getElementById("backBtn")
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "dashboard.html";

        }
    );


// =========================
// INITIAL LOAD
// =========================

loadStudents();
loadAttendance();