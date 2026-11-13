const API = "http://localhost:5000/api/hostels";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

async function loadHostels() {

    const response = await fetch(API, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    const body = document.getElementById("hostelsBody");

    body.innerHTML = "";

    data.hostels.forEach(hostel => {

        body.innerHTML += `
            <tr>
                <td>${hostel.hostel_id}</td>
                <td>${hostel.hostel_name}</td>
                <td>${hostel.gender}</td>
                <td>${hostel.address || "-"}</td>
                <td>${hostel.status}</td>
            </tr>
        `;

    });
}


document.getElementById("hostelForm")
    .addEventListener("submit", async (event) => {

        event.preventDefault();

        const hostelData = {
            hostel_name:
                document.getElementById("hostel_name").value,

            gender:
                document.getElementById("hostel_gender").value,

            address:
                document.getElementById("hostel_address").value || null,

            status:
                document.getElementById("hostel_status").value
        };

        const response = await fetch(API, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify(hostelData)
        });

        const data = await response.json();

        document.getElementById("message").textContent =
            data.message;

        if (response.ok) {
            document.getElementById("hostelForm").reset();
            loadHostels();
        }

    });


document.getElementById("backBtn")
    .addEventListener("click", () => {

        window.location.href = "dashboard.html";

    });


loadHostels();