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

        console.error("LOAD STUDENTS ERROR:", error);

    }
}


// =========================
// LOAD HOSTELS
// =========================

async function loadHostels() {

    try {

        const response = await fetch(
            `${API}/hostels`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        const select =
            document.getElementById("hostel_id");

        select.innerHTML =
            `<option value="">
                Select Hostel
            </option>`;

        data.hostels.forEach(hostel => {

            select.innerHTML += `
                <option value="${hostel.hostel_id}">
                    ${hostel.hostel_name}
                </option>
            `;

        });

    } catch (error) {

        console.error("LOAD HOSTELS ERROR:", error);

    }
}


// =========================
// LOAD ROOMS
// =========================

async function loadRooms() {

    try {

        const response = await fetch(
            `${API}/rooms`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        const select =
            document.getElementById("room_id");

        select.innerHTML =
            `<option value="">
                Select Room
            </option>`;

        data.rooms.forEach(room => {

            select.innerHTML += `
                <option value="${room.room_id}">
                    ${room.hostel_name} - Room ${room.room_number}
                </option>
            `;

        });

    } catch (error) {

        console.error("LOAD ROOMS ERROR:", error);

    }
}


// =========================
// LOAD MAINTENANCE
// =========================

async function loadMaintenance() {

    try {

        const response = await fetch(
            `${API}/maintenance`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        const body =
            document.getElementById("maintenanceBody");

        body.innerHTML = "";


        if (!data.requests || data.requests.length === 0) {

            body.innerHTML = `
                <tr>
                    <td colspan="8">
                        No maintenance requests found
                    </td>
                </tr>
            `;

            return;
        }


        data.requests.forEach(item => {

            body.innerHTML += `
                <tr>

                    <td>${item.request_id}</td>

                    <td>${item.full_name}</td>

                    <td>${item.hostel_name}</td>

                    <td>${item.room_number}</td>

                    <td>${item.category}</td>

                    <td>${item.priority}</td>

                    <td>${item.status}</td>

                    <td>

                        ${
                            item.status !== "COMPLETED"
                            ?
                            `
                            <button
                                class="small-btn"
                                onclick="completeMaintenance(${item.request_id})">
                                Complete
                            </button>
                            `
                            :
                            "Completed"
                        }

                    </td>

                </tr>
            `;

        });

    } catch (error) {

        console.error("LOAD MAINTENANCE ERROR:", error);

    }
}


// =========================
// SUBMIT REQUEST
// =========================

document
    .getElementById("maintenanceForm")
    .addEventListener("submit", async event => {

        event.preventDefault();


        const maintenanceData = {

            student_id:
                Number(
                    document.getElementById(
                        "student_id"
                    ).value
                ),

            hostel_id:
                Number(
                    document.getElementById(
                        "hostel_id"
                    ).value
                ),

            room_id:
                Number(
                    document.getElementById(
                        "room_id"
                    ).value
                ),

            category:
                document.getElementById(
                    "category"
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
                `${API}/maintenance`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(
                            maintenanceData
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
                        "maintenanceForm"
                    )
                    .reset();

                loadMaintenance();

            }

        } catch (error) {

            console.error(
                "MAINTENANCE ERROR:",
                error
            );

            document.getElementById(
                "message"
            ).textContent =
                "Cannot connect to backend";

        }

    });


// =========================
// COMPLETE REQUEST
// =========================

window.completeMaintenance = async function(id) {

    const confirmed =
        confirm(
            "Are you sure you want to mark this request as completed?"
        );

    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${API}/maintenance/${id}/status`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    status: "COMPLETED"
                })
            }
        );


        const result =
            await response.json();


        alert(result.message);

        loadMaintenance();

    } catch (error) {

        console.error(
            "COMPLETE MAINTENANCE ERROR:",
            error
        );

    }

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

loadStudents();
loadHostels();
loadRooms();
loadMaintenance();