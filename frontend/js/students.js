const API_URL = "http://localhost:5000/api/students";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}


// =========================
// ELEMENTS
// =========================
const studentForm = document.getElementById("studentForm");
const studentsTableBody = document.getElementById("studentsTableBody");
const message = document.getElementById("message");

const formTitle = document.getElementById("formTitle");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const showAllBtn = document.getElementById("showAllBtn");


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

    try {

        const response = await fetch(
            API_URL,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch students");
        }

        const data = await response.json();

        displayStudents(data.students);

    } catch (error) {

        console.error(error);

        studentsTableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    Failed to load students
                </td>
            </tr>
        `;
    }
}


// =========================
// DISPLAY STUDENTS
// =========================
function displayStudents(students) {

    studentsTableBody.innerHTML = "";

    if (!students || students.length === 0) {

        studentsTableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    No students found
                </td>
            </tr>
        `;

        return;
    }


    students.forEach(student => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.student_id}</td>

            <td>${student.full_name}</td>

            <td>${student.gender}</td>

            <td>${student.mobile}</td>

            <td>${student.course || "-"}</td>

            <td>${student.academic_year || "-"}</td>

            <td>${student.status}</td>

            <td>

                <button
                    class="small-btn"
                    onclick='editStudent(${JSON.stringify(student)})'>
                    Edit
                </button>

                <button
                    class="small-btn delete-btn"
                    onclick="deleteStudent(${student.student_id})">
                    Delete
                </button>

            </td>
        `;

        studentsTableBody.appendChild(row);

    });
}


// =========================
// ADD / UPDATE STUDENT
// =========================
studentForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const studentId =
        document.getElementById("studentId").value;


    const studentData = {

        full_name:
            document.getElementById("full_name").value,

        gender:
            document.getElementById("gender").value,

        dob:
            document.getElementById("dob").value || null,

        mobile:
            document.getElementById("mobile").value,

        email:
            document.getElementById("email").value || null,

        address:
            document.getElementById("address").value || null,

        guardian_name:
            document.getElementById("guardian_name").value || null,

        guardian_contact:
            document.getElementById("guardian_contact").value || null,

        college_name:
            document.getElementById("college_name").value || null,

        course:
            document.getElementById("course").value || null,

        academic_year:
            document.getElementById("academic_year").value || null,

        admission_date:
            document.getElementById("admission_date").value,

        emergency_contact:
            document.getElementById("emergency_contact").value || null,

        status: "ACTIVE"
    };


    try {

        let response;

        if (studentId) {

            response = await fetch(
                `${API_URL}/${studentId}`,
                {
                    method: "PUT",
                    headers: authHeaders(),
                    body: JSON.stringify(studentData)
                }
            );

        } else {

            response = await fetch(
                API_URL,
                {
                    method: "POST",
                    headers: authHeaders(),
                    body: JSON.stringify(studentData)
                }
            );
        }


        const data = await response.json();


        if (!response.ok) {

            message.textContent =
                data.message || "Operation failed";

            return;
        }


        message.textContent =
            data.message || "Success";

        resetForm();

        loadStudents();

    } catch (error) {

        console.error(error);

        message.textContent =
            "Cannot connect to backend";
    }

});


// =========================
// EDIT STUDENT
// =========================
window.editStudent = function(student) {

    document.getElementById("studentId").value =
        student.student_id;

    document.getElementById("full_name").value =
        student.full_name || "";

    document.getElementById("gender").value =
        student.gender || "";

    document.getElementById("dob").value =
        student.dob
            ? student.dob.substring(0, 10)
            : "";

    document.getElementById("mobile").value =
        student.mobile || "";

    document.getElementById("email").value =
        student.email || "";

    document.getElementById("address").value =
        student.address || "";

    document.getElementById("guardian_name").value =
        student.guardian_name || "";

    document.getElementById("guardian_contact").value =
        student.guardian_contact || "";

    document.getElementById("college_name").value =
        student.college_name || "";

    document.getElementById("course").value =
        student.course || "";

    document.getElementById("academic_year").value =
        student.academic_year || "";

    document.getElementById("admission_date").value =
        student.admission_date
            ? student.admission_date.substring(0, 10)
            : "";

    document.getElementById("emergency_contact").value =
        student.emergency_contact || "";


    formTitle.textContent = "Update Student";
    saveBtn.textContent = "Update Student";

    cancelBtn.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

};


// =========================
// DELETE STUDENT
// =========================
window.deleteStudent = async function(studentId) {

    const confirmed =
        confirm("Are you sure you want to delete this student?");

    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${studentId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete student"
            );

            return;
        }


        alert(
            data.message ||
            "Student deleted successfully"
        );

        loadStudents();

    } catch (error) {

        console.error(error);

        alert("Cannot connect to backend");
    }
};


// =========================
// SEARCH STUDENTS
// =========================
searchBtn.addEventListener("click", searchStudents);

searchInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        searchStudents();
    }

});


async function searchStudents() {

    const query =
        searchInput.value.trim();

    if (!query) {

        loadStudents();

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/search?q=${encodeURIComponent(query)}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        displayStudents(data.students);

    } catch (error) {

        console.error(error);

        message.textContent =
            "Search failed";
    }
}


// =========================
// SHOW ALL
// =========================
showAllBtn.addEventListener("click", () => {

    searchInput.value = "";

    loadStudents();

});


// =========================
// RESET FORM
// =========================
function resetForm() {

    studentForm.reset();

    document.getElementById("studentId").value = "";

    formTitle.textContent = "Add Student";

    saveBtn.textContent = "Add Student";

    cancelBtn.classList.add("hidden");
}


// =========================
// CANCEL UPDATE
// =========================
cancelBtn.addEventListener("click", resetForm);


// =========================
// BACK TO DASHBOARD
// =========================
document.getElementById("backBtn")
    .addEventListener("click", () => {

        window.location.href =
            "dashboard.html";
    });


// =========================
// INITIAL LOAD
// =========================
loadStudents();