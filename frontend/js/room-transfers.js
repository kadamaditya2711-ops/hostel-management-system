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
// LOAD AVAILABLE BEDS
// =========================

async function loadAvailableBeds() {

    try {

        const response = await fetch(
            `${API}/beds`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        const select =
            document.getElementById("new_bed_id");

        select.innerHTML =
            `<option value="">
                Select Bed
            </option>`;

        data.beds
            .filter(bed => bed.status === "AVAILABLE")
            .forEach(bed => {

                select.innerHTML += `
                    <option value="${bed.bed_id}">
                        ${bed.hostel_name} -
                        Block ${bed.block_name} -
                        Room ${bed.room_number} -
                        Bed ${bed.bed_number}
                    </option>
                `;

            });

    } catch (error) {

        console.error(
            "LOAD AVAILABLE BEDS ERROR:",
            error
        );

    }
}


// =========================
// LOAD TRANSFERS
// =========================

async function loadTransfers() {

    try {

        const response = await fetch(
            `${API}/room-transfers`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        const body =
            document.getElementById("transfersBody");

        body.innerHTML = "";


        if (!data.transfers || data.transfers.length === 0) {

            body.innerHTML = `
                <tr>
                    <td colspan="7">
                        No transfer records found
                    </td>
                </tr>
            `;

            return;
        }


        data.transfers.forEach(item => {

            body.innerHTML += `
                <tr>

                    <td>${item.transfer_id}</td>

                    <td>${item.full_name}</td>

                    <td>${item.old_bed_id}</td>

                    <td>${item.new_bed_id}</td>

                    <td>
                        ${item.transfer_date
                            ? item.transfer_date.substring(0, 10)
                            : "-"}
                    </td>

                    <td>${item.reason}</td>

                    <td>${item.approved_by}</td>

                </tr>
            `;

        });

    } catch (error) {

        console.error(
            "LOAD TRANSFERS ERROR:",
            error
        );

    }
}


// =========================
// TRANSFER STUDENT
// =========================

document
    .getElementById("transferForm")
    .addEventListener("submit", async event => {

        event.preventDefault();


        const data = {

            student_id:
                Number(
                    document.getElementById(
                        "student_id"
                    ).value
                ),

            new_bed_id:
                Number(
                    document.getElementById(
                        "new_bed_id"
                    ).value
                ),

            reason:
                document.getElementById(
                    "reason"
                ).value

        };


        try {

            const response = await fetch(
                `${API}/room-transfers`,
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
                "message"
            ).textContent =
                result.message;


            if (response.ok) {

                document
                    .getElementById(
                        "transferForm"
                    )
                    .reset();

                loadAvailableBeds();
                loadTransfers();

            }

        } catch (error) {

            console.error(
                "TRANSFER ERROR:",
                error
            );

            document.getElementById(
                "message"
            ).textContent =
                "Cannot connect to backend";

        }

    });


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
loadAvailableBeds();
loadTransfers();