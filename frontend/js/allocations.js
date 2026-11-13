const API = "http://localhost:5000/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}


// =========================
// AUTH HEADERS
// =========================

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
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
        `<option value="">Select Student</option>`;

    data.students.forEach(student => {

        select.innerHTML += `
            <option value="${student.student_id}">
                ${student.full_name}
            </option>
        `;

    });
}


// =========================
// LOAD AVAILABLE BEDS
// =========================

async function loadBeds() {

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
        document.getElementById("bed_id");

    select.innerHTML =
        `<option value="">Select Bed</option>`;

    data.beds
        .filter(bed => bed.status === "AVAILABLE")
        .forEach(bed => {

            select.innerHTML += `
                <option value="${bed.bed_id}">
                    ${bed.hostel_name} -
                    Room ${bed.room_number} -
                    Bed ${bed.bed_number}
                </option>
            `;

        });
}


// =========================
// LOAD ALLOCATIONS
// =========================

async function loadAllocations() {

    const response = await fetch(
        `${API}/allocations`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    const body =
        document.getElementById("allocationsBody");

    body.innerHTML = "";


    data.allocations.forEach(allocation => {

        body.innerHTML += `
            <tr>

                <td>${allocation.allocation_id}</td>

                <td>${allocation.full_name}</td>

                <td>${allocation.hostel_name}</td>

                <td>${allocation.room_number}</td>

                <td>${allocation.bed_number}</td>

                <td>
                    ${allocation.start_date
                        ? allocation.start_date.substring(0, 10)
                        : "-"}
                </td>

                <td>${allocation.status}</td>

                <td>

                    ${
                        allocation.status === "ACTIVE"
                        ?
                        `<button
                            class="small-btn delete-btn"
                            onclick="endAllocation(${allocation.allocation_id})">
                            End
                        </button>`
                        :
                        "-"
                    }

                </td>

            </tr>
        `;

    });

}


// =========================
// ALLOCATE BED
// =========================

document
    .getElementById("allocationForm")
    .addEventListener("submit", async event => {

        event.preventDefault();

        const data = {

            student_id:
                Number(
                    document.getElementById(
                        "student_id"
                    ).value
                ),

            bed_id:
                Number(
                    document.getElementById(
                        "bed_id"
                    ).value
                ),

            start_date:
                document.getElementById(
                    "start_date"
                ).value

        };


        const response = await fetch(
            `${API}/allocations`,
            {
                method: "POST",
                headers: authHeaders(),
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
                .getElementById("allocationForm")
                .reset();

            loadBeds();

            loadAllocations();

        }

    });


// =========================
// END ALLOCATION
// =========================

window.endAllocation = async function(allocationId) {

    const confirmed =
        confirm(
            "Are you sure you want to end this allocation?"
        );

    if (!confirmed) {
        return;
    }


    const response = await fetch(
        `${API}/allocations/${allocationId}/end`,
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

    loadBeds();

    loadAllocations();

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
loadBeds();
loadAllocations();