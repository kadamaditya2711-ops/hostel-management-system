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

        const checkinSelect =
            document.getElementById("checkin_student");

        const checkoutSelect =
            document.getElementById("checkout_student");

        checkinSelect.innerHTML =
            `<option value="">
                Select Student
            </option>`;

        checkoutSelect.innerHTML =
            `<option value="">
                Select Student
            </option>`;


        data.students.forEach(student => {

            const option = `
                <option value="${student.student_id}">
                    ${student.full_name}
                </option>
            `;

            checkinSelect.innerHTML += option;
            checkoutSelect.innerHTML += option;

        });

    } catch (error) {

        console.error(
            "LOAD STUDENTS ERROR:",
            error
        );

    }
}


// =========================
// LOAD ACTIVE ALLOCATIONS
// =========================

async function loadAllocations() {

    try {

        const response = await fetch(
            `${API}/allocations`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        const checkinSelect =
            document.getElementById(
                "checkin_allocation"
            );

        const checkoutSelect =
            document.getElementById(
                "checkout_allocation"
            );

        checkinSelect.innerHTML =
            `<option value="">
                Select Allocation
            </option>`;

        checkoutSelect.innerHTML =
            `<option value="">
                Select Allocation
            </option>`;


        data.allocations
            .filter(item => item.status === "ACTIVE")
            .forEach(item => {

                const option = `
                    <option value="${item.allocation_id}">
                        ${item.full_name} - Room ${item.room_number} - Bed ${item.bed_number}
                    </option>
                `;

                checkinSelect.innerHTML += option;
                checkoutSelect.innerHTML += option;

            });

    } catch (error) {

        console.error(
            "LOAD ALLOCATIONS ERROR:",
            error
        );

    }
}


// =========================
// LOAD CHECK-INS
// =========================

async function loadCheckIns() {

    try {

        const response = await fetch(
            `${API}/checkin-checkout/checkins`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        const body =
            document.getElementById("checkinsBody");

        body.innerHTML = "";


        if (!data.checkins || data.checkins.length === 0) {

            body.innerHTML = `
                <tr>
                    <td colspan="6">
                        No check-in records found
                    </td>
                </tr>
            `;

            return;
        }


        data.checkins.forEach(item => {

            body.innerHTML += `
                <tr>

                    <td>
                        ${item.checkin_id}
                    </td>

                    <td>
                        ${item.full_name}
                    </td>

                    <td>
                        ${item.allocation_id}
                    </td>

                    <td>
                        ${
                            item.checkin_date
                            ? new Date(
                                item.checkin_date
                            ).toLocaleString()
                            : "-"
                        }
                    </td>

                    <td>
                        ${item.academic_year}
                    </td>

                    <td>
                        ${item.verified_by}
                    </td>

                </tr>
            `;

        });

    } catch (error) {

        console.error(
            "LOAD CHECK-INS ERROR:",
            error
        );

    }
}


// =========================
// LOAD CHECK-OUTS
// =========================

async function loadCheckOuts() {

    try {

        const response = await fetch(
            `${API}/checkin-checkout/checkouts`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        const body =
            document.getElementById("checkoutsBody");

        body.innerHTML = "";


        if (!data.checkouts || data.checkouts.length === 0) {

            body.innerHTML = `
                <tr>
                    <td colspan="7">
                        No check-out records found
                    </td>
                </tr>
            `;

            return;
        }


        data.checkouts.forEach(item => {

            body.innerHTML += `
                <tr>

                    <td>
                        ${item.checkout_id}
                    </td>

                    <td>
                        ${item.full_name}
                    </td>

                    <td>
                        ${item.allocation_id}
                    </td>

                    <td>
                        ${
                            item.checkout_date
                            ? new Date(
                                item.checkout_date
                            ).toLocaleString()
                            : "-"
                        }
                    </td>

                    <td>
                        ${item.reason}
                    </td>

                    <td>
                        ${
                            item.fee_clearance
                            ? "CLEARED"
                            : "PENDING"
                        }
                    </td>

                    <td>
                        ${item.approved_by}
                    </td>

                </tr>
            `;

        });

    } catch (error) {

        console.error(
            "LOAD CHECK-OUTS ERROR:",
            error
        );

    }
}


// =========================
// CHECK-IN
// =========================

document
    .getElementById("checkinForm")
    .addEventListener("submit", async event => {

        event.preventDefault();


        const data = {

            student_id:
                Number(
                    document.getElementById(
                        "checkin_student"
                    ).value
                ),

            allocation_id:
                Number(
                    document.getElementById(
                        "checkin_allocation"
                    ).value
                ),

            academic_year:
                document.getElementById(
                    "academic_year"
                ).value

        };


        try {

            const response = await fetch(
                `${API}/checkin-checkout/checkin`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(data)
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
                    .getElementById(
                        "checkinForm"
                    )
                    .reset();

                loadCheckIns();

                loadAllocations();

            }

        } catch (error) {

            console.error(
                "CHECK-IN ERROR:",
                error
            );

        }

    });


// =========================
// CHECK-OUT
// =========================

document
    .getElementById("checkoutForm")
    .addEventListener("submit", async event => {

        event.preventDefault();


        const data = {

            student_id:
                Number(
                    document.getElementById(
                        "checkout_student"
                    ).value
                ),

            allocation_id:
                Number(
                    document.getElementById(
                        "checkout_allocation"
                    ).value
                ),

            reason:
                document.getElementById(
                    "reason"
                ).value,

            fee_clearance:
                document.getElementById(
                    "fee_clearance"
                ).value === "true",

            remarks:
                document.getElementById(
                    "remarks"
                ).value || null

        };


        try {

            const response = await fetch(
                `${API}/checkin-checkout/checkout`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(data)
                }
            );


            const result =
                await response.json();


            document.getElementById(
                "checkoutMessage"
            ).textContent =
                result.message;


            if (response.ok) {

                document
                    .getElementById(
                        "checkoutForm"
                    )
                    .reset();

                loadCheckOuts();

                loadAllocations();

            }

        } catch (error) {

            console.error(
                "CHECK-OUT ERROR:",
                error
            );

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
loadAllocations();
loadCheckIns();
loadCheckOuts();