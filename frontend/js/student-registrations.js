const API_URL =
    "http://localhost:5000/api/student-registrations";

const token =
    localStorage.getItem("token");

const registrationTable =
    document.getElementById("registrationTable");

const emptyState =
    document.getElementById("emptyState");

const pendingCount =
    document.getElementById("pendingCount");

const modal =
    document.getElementById("studentModal");

const closeModal =
    document.getElementById("closeModal");

const studentDetails =
    document.getElementById("studentDetails");

const approveBtn =
    document.getElementById("approveBtn");

const rejectBtn =
    document.getElementById("rejectBtn");

const modalMessage =
    document.getElementById("modalMessage");

let selectedStudentId = null;


// =====================================================
// AUTH CHECK
// =====================================================

if (!token) {

    window.location.href =
        "index.html#login";

}


// =====================================================
// LOAD PENDING STUDENTS
// =====================================================

async function loadRegistrations() {

    try {

        const response =
            await fetch(
                `${API_URL}/pending`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to load registrations."
            );

            return;
        }


        registrationTable.innerHTML = "";

        pendingCount.textContent =
            data.length;


        if (data.length === 0) {

            emptyState.style.display =
                "block";

            return;

        }


        emptyState.style.display =
            "none";


        data.forEach(student => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <div class="student-name">
                        ${escapeHtml(student.full_name)}
                    </div>

                    <div class="student-username">
                        @${escapeHtml(student.username)}
                    </div>

                </td>


                <td>
                    ${escapeHtml(
                        student.college_name || "-"
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        student.course || "-"
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        student.gender
                    )}
                </td>


                <td>

                    <span class="status-badge">
                        PENDING
                    </span>

                </td>


                <td>

                    <button
                        class="view-btn"
                        onclick="viewStudent(${student.student_id})"
                    >
                        View Details
                    </button>

                </td>

            `;


            registrationTable.appendChild(
                row
            );

        });

    }
    catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );

    }

}


// =====================================================
// VIEW STUDENT
// =====================================================

async function viewStudent(studentId) {

    try {

        const response =
            await fetch(
                `${API_URL}/${studentId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const student =
            await response.json();


        if (!response.ok) {

            alert(
                student.message ||
                "Unable to load student."
            );

            return;
        }


        selectedStudentId =
            student.student_id;


        modalMessage.textContent =
            "";


        studentDetails.innerHTML = `

            <div class="detail-grid">


                <div class="detail-item">

                    <small>
                        Full Name
                    </small>

                    <strong>
                        ${escapeHtml(
                            student.full_name
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <small>
                        Username
                    </small>

                    <strong>
                        ${escapeHtml(
                            student.username
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <small>
                        Email
                    </small>

                    <strong>
                        ${escapeHtml(
                            student.email || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <small>
                        Mobile
                    </small>

                    <strong>
                        ${escapeHtml(
                            student.mobile || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <small>
                        Gender
                    </small>

                    <strong>
                        ${escapeHtml(
                            student.gender || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <small>
                        Date of Birth
                    </small>

                    <strong>
                        ${escapeHtml(
                            student.dob || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <small>
                        College
                    </small>

                    <strong>
                        ${escapeHtml(
                            student.college_name || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <small>
                        Course
                    </small>

                    <strong>
                        ${escapeHtml(
                            student.course || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <small>
                        Academic Year
                    </small>

                    <strong>
                        ${escapeHtml(
                            student.academic_year || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <small>
                        Guardian Name
                    </small>

                    <strong>
                        ${escapeHtml(
                            student.guardian_name || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <small>
                        Guardian Contact
                    </small>

                    <strong>
                        ${escapeHtml(
                            student.guardian_contact || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <small>
                        Emergency Contact
                    </small>

                    <strong>
                        ${escapeHtml(
                            student.emergency_contact || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item full">

                    <small>
                        Address
                    </small>

                    <strong>
                        ${escapeHtml(
                            student.address || "-"
                        )}
                    </strong>

                </div>


            </div>
        `;


        modal.classList.add("show");

    }
    catch (error) {

        console.error(error);

        alert(
            "Unable to load student details."
        );

    }

}


// =====================================================
// APPROVE
// =====================================================

approveBtn.addEventListener(
    "click",
    async function () {

        if (!selectedStudentId) {
            return;
        }


        const confirmed =
            confirm(
                "Approve this student registration?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/${selectedStudentId}/approve`,
                    {
                        method: "PATCH",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                modalMessage.textContent =
                    data.message ||
                    "Approval failed.";

                return;
            }


            modalMessage.textContent =
                "Student approved successfully.";

            modalMessage.style.color =
                "#16a34a";


            setTimeout(() => {

                modal.classList.remove("show");

                loadRegistrations();

            }, 700);


        }
        catch (error) {

            console.error(error);

            modalMessage.textContent =
                "Unable to connect to server.";

        }

    }
);


// =====================================================
// REJECT
// =====================================================

rejectBtn.addEventListener(
    "click",
    async function () {

        if (!selectedStudentId) {
            return;
        }


        const reason =
            prompt(
                "Enter rejection reason:"
            );


        if (!reason) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/${selectedStudentId}/reject`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify({
                                reason: reason
                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                modalMessage.textContent =
                    data.message ||
                    "Rejection failed.";

                return;
            }


            modalMessage.textContent =
                "Student registration rejected.";

            modalMessage.style.color =
                "#dc2626";


            setTimeout(() => {

                modal.classList.remove("show");

                loadRegistrations();

            }, 700);


        }
        catch (error) {

            console.error(error);

            modalMessage.textContent =
                "Unable to connect to server.";

        }

    }
);


// =====================================================
// CLOSE MODAL
// =====================================================

closeModal.addEventListener(
    "click",
    function () {

        modal.classList.remove("show");

    }
);


modal.addEventListener(
    "click",
    function (event) {

        if (event.target === modal) {

            modal.classList.remove("show");

        }

    }
);


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =====================================================
// START
// =====================================================

loadRegistrations();