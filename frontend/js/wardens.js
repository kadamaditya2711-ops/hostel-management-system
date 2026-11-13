const API = "http://localhost:5000/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
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

        console.error(
            "LOAD HOSTELS ERROR:",
            error
        );

    }
}


// =========================
// LOAD WARDENS
// =========================

async function loadWardens() {

    try {

        const response = await fetch(
            `${API}/wardens`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        const body =
            document.getElementById("wardensBody");

        body.innerHTML = "";


        if (!data.wardens || data.wardens.length === 0) {

            body.innerHTML = `
                <tr>
                    <td colspan="8">
                        No wardens found
                    </td>
                </tr>
            `;

            return;
        }


        data.wardens.forEach(warden => {

            body.innerHTML += `
                <tr>

                    <td>
                        ${warden.warden_id}
                    </td>

                    <td>
                        ${warden.user_id}
                    </td>

                    <td>
                        ${warden.username}
                    </td>

                    <td>
                        ${warden.full_name}
                    </td>

                    <td>
                        ${warden.mobile}
                    </td>

                    <td>
                        ${warden.email || "-"}
                    </td>

                    <td>
                        ${warden.hostel_name}
                    </td>

                    <td>

                        <button
                            class="small-btn"
                            onclick='editWarden(${JSON.stringify(warden)})'>
                            Edit
                        </button>

                        <button
                            class="small-btn delete-btn"
                            onclick="deleteWarden(${warden.warden_id})">
                            Delete
                        </button>

                    </td>

                </tr>
            `;

        });

    } catch (error) {

        console.error(
            "LOAD WARDENS ERROR:",
            error
        );

    }
}


// =========================
// ADD / UPDATE WARDEN
// =========================

document
    .getElementById("wardenForm")
    .addEventListener("submit", async event => {

        event.preventDefault();


        const wardenId =
            document.getElementById(
                "warden_id"
            ).value;


        const data = {

            user_id:
                Number(
                    document.getElementById(
                        "user_id"
                    ).value
                ),

            full_name:
                document.getElementById(
                    "full_name"
                ).value,

            mobile:
                document.getElementById(
                    "mobile"
                ).value,

            email:
                document.getElementById(
                    "email"
                ).value || null,

            hostel_id:
                Number(
                    document.getElementById(
                        "hostel_id"
                    ).value
                )

        };


        try {

            let response;


            if (wardenId) {

                response = await fetch(
                    `${API}/wardens/${wardenId}`,
                    {
                        method: "PUT",

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

            } else {

                response = await fetch(
                    `${API}/wardens`,
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

            }


            const result =
                await response.json();


            document.getElementById(
                "message"
            ).textContent =
                result.message;


            if (response.ok) {

                resetForm();

                loadWardens();

            }

        } catch (error) {

            console.error(
                "WARDEN SAVE ERROR:",
                error
            );

            document.getElementById(
                "message"
            ).textContent =
                "Cannot connect to backend";

        }

    });


// =========================
// EDIT WARDEN
// =========================

window.editWarden = function(warden) {

    document.getElementById(
        "warden_id"
    ).value =
        warden.warden_id;

    document.getElementById(
        "user_id"
    ).value =
        warden.user_id;

    document.getElementById(
        "full_name"
    ).value =
        warden.full_name;

    document.getElementById(
        "mobile"
    ).value =
        warden.mobile;

    document.getElementById(
        "email"
    ).value =
        warden.email || "";

    document.getElementById(
        "hostel_id"
    ).value =
        warden.hostel_id;


    document.getElementById(
        "formTitle"
    ).textContent =
        "Update Warden";

    document.getElementById(
        "saveBtn"
    ).textContent =
        "Update Warden";

    document.getElementById(
        "cancelBtn"
    ).classList.remove("hidden");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

};


// =========================
// DELETE WARDEN
// =========================

window.deleteWarden = async function(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this warden?"
        );

    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${API}/wardens/${id}`,
            {
                method: "DELETE",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


        const result =
            await response.json();


        alert(result.message);

        loadWardens();

    } catch (error) {

        console.error(
            "DELETE WARDEN ERROR:",
            error
        );

    }

};


// =========================
// RESET FORM
// =========================

function resetForm() {

    document
        .getElementById("wardenForm")
        .reset();

    document.getElementById(
        "warden_id"
    ).value = "";

    document.getElementById(
        "formTitle"
    ).textContent =
        "Add Warden";

    document.getElementById(
        "saveBtn"
    ).textContent =
        "Add Warden";

    document.getElementById(
        "cancelBtn"
    ).classList.add("hidden");

}


// =========================
// CANCEL
// =========================

document
    .getElementById("cancelBtn")
    .addEventListener(
        "click",
        resetForm
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

loadHostels();
loadWardens();