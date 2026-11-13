const API = "http://localhost:5000/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}


// =====================================================
// AUTH HEADERS
// =====================================================

function authHeaders() {

    return {
        Authorization: `Bearer ${token}`
    };

}


// =====================================================
// NORMALIZE API LIST
// =====================================================

function getList(data, keys = []) {

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    for (const key of keys) {

        if (Array.isArray(data?.[key])) {
            return data[key];
        }

    }

    return [];

}


// =====================================================
// LOAD USER
// =====================================================

async function loadUser() {

    try {

        const response =
            await fetch(
                `${API}/protected`,
                {
                    headers: authHeaders()
                }
            );


        if (!response.ok) {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            window.location.href = "index.html";

            return;
        }


        const data =
            await response.json();


        const username =
            data.user?.username ||
            data.username ||
            "Admin";


        const userName =
            document.getElementById(
                "userName"
            );


        if (userName) {

            userName.textContent =
                username;

        }


    } catch (error) {

        console.error(
            "LOAD USER ERROR:",
            error
        );

    }

}


// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

    try {

        const [

            studentsResponse,
            hostelsResponse,
            roomsResponse,
            bedsResponse,
            allocationsResponse,
            complaintsResponse,
            maintenanceResponse,
            feesResponse,
            paymentsResponse,
            noticesResponse

        ] = await Promise.all([

            fetch(
                `${API}/students`,
                {
                    headers: authHeaders()
                }
            ),

            fetch(
                `${API}/hostels`,
                {
                    headers: authHeaders()
                }
            ),

            fetch(
                `${API}/rooms`,
                {
                    headers: authHeaders()
                }
            ),

            fetch(
                `${API}/beds`,
                {
                    headers: authHeaders()
                }
            ),

            fetch(
                `${API}/allocations`,
                {
                    headers: authHeaders()
                }
            ),

            fetch(
                `${API}/complaints`,
                {
                    headers: authHeaders()
                }
            ),

            fetch(
                `${API}/maintenance`,
                {
                    headers: authHeaders()
                }
            ),

            fetch(
                `${API}/fees`,
                {
                    headers: authHeaders()
                }
            ),

            fetch(
                `${API}/payments`,
                {
                    headers: authHeaders()
                }
            ),

            fetch(
                `${API}/notices`,
                {
                    headers: authHeaders()
                }
            )

        ]);


        // =================================================
        // READ RESPONSES
        // =================================================

        const studentsData =
            studentsResponse.ok
                ? await studentsResponse.json()
                : [];


        const hostelsData =
            hostelsResponse.ok
                ? await hostelsResponse.json()
                : [];


        const roomsData =
            roomsResponse.ok
                ? await roomsResponse.json()
                : [];


        const bedsData =
            bedsResponse.ok
                ? await bedsResponse.json()
                : [];


        const allocationsData =
            allocationsResponse.ok
                ? await allocationsResponse.json()
                : [];


        const complaintsData =
            complaintsResponse.ok
                ? await complaintsResponse.json()
                : [];


        const maintenanceData =
            maintenanceResponse.ok
                ? await maintenanceResponse.json()
                : [];


        const feesData =
            feesResponse.ok
                ? await feesResponse.json()
                : [];


        const paymentsData =
            paymentsResponse.ok
                ? await paymentsResponse.json()
                : [];


        const noticesData =
            noticesResponse.ok
                ? await noticesResponse.json()
                : [];


        // =================================================
        // CONVERT TO ARRAYS
        // =================================================

        const students =
            getList(
                studentsData,
                ["students"]
            );


        const hostels =
            getList(
                hostelsData,
                ["hostels"]
            );


        const rooms =
            getList(
                roomsData,
                ["rooms"]
            );


        const beds =
            getList(
                bedsData,
                ["beds"]
            );


        const allocations =
            getList(
                allocationsData,
                ["allocations"]
            );


        const complaints =
            getList(
                complaintsData,
                ["complaints"]
            );


        const maintenance =
            getList(
                maintenanceData,
                [
                    "requests",
                    "maintenance"
                ]
            );


        const fees =
            getList(
                feesData,
                ["fees"]
            );


        const payments =
            getList(
                paymentsData,
                ["payments"]
            );


        const notices =
            getList(
                noticesData,
                ["notices"]
            );


        // =================================================
        // DEBUG
        // =================================================

        console.log(
            "Students:",
            students
        );

        console.log(
            "Hostels:",
            hostels
        );

        console.log(
            "Rooms:",
            rooms
        );

        console.log(
            "Beds:",
            beds
        );

        console.log(
            "Allocations:",
            allocations
        );


        // =================================================
        // TOTAL STUDENTS
        // =================================================

        const totalStudents =
            document.getElementById(
                "totalStudents"
            );


        if (totalStudents) {

            totalStudents.textContent =
                students.length;

        }


        // =================================================
        // TOTAL HOSTELS
        // =================================================

        const totalHostels =
            document.getElementById(
                "totalHostels"
            );


        if (totalHostels) {

            totalHostels.textContent =
                hostels.length;

        }


        // =================================================
        // TOTAL ROOMS
        // =================================================

        const totalRooms =
            document.getElementById(
                "totalRooms"
            );


        if (totalRooms) {

            totalRooms.textContent =
                rooms.length;

        }


        // =================================================
        // AVAILABLE BEDS
        // =================================================

        const availableBeds =
            beds.filter(
                bed =>
                    String(
                        bed.status || ""
                    ).toUpperCase() ===
                    "AVAILABLE"
            ).length;


        const availableBedsElement =
            document.getElementById(
                "availableBeds"
            );


        if (availableBedsElement) {

            availableBedsElement.textContent =
                availableBeds;

        }


        // =================================================
        // ACTIVE ALLOCATIONS
        // =================================================

        const activeAllocations =
            allocations.filter(
                item =>
                    String(
                        item.status || ""
                    ).toUpperCase() ===
                    "ACTIVE"
            ).length;


        const activeAllocationsElement =
            document.getElementById(
                "activeAllocations"
            );


        if (activeAllocationsElement) {

            activeAllocationsElement.textContent =
                activeAllocations;

        }


        // =================================================
        // PENDING COMPLAINTS
        // =================================================

        const pendingComplaints =
            complaints.filter(
                item =>
                    String(
                        item.status || ""
                    ).toUpperCase() !==
                    "RESOLVED"
            ).length;


        const pendingComplaintsElement =
            document.getElementById(
                "pendingComplaints"
            );


        if (pendingComplaintsElement) {

            pendingComplaintsElement.textContent =
                pendingComplaints;

        }


        // =================================================
        // MAINTENANCE REQUESTS
        // =================================================

        const maintenanceRequests =
            maintenance.filter(
                item =>
                    String(
                        item.status || ""
                    ).toUpperCase() !==
                    "COMPLETED"
            ).length;


        const maintenanceRequestsElement =
            document.getElementById(
                "maintenanceRequests"
            );


        if (maintenanceRequestsElement) {

            maintenanceRequestsElement.textContent =
                maintenanceRequests;

        }


        // =================================================
        // PENDING FEES
        // =================================================

        let pendingFeeAmount = 0;


        fees.forEach(
            fee => {

                pendingFeeAmount +=
                    Number(
                        fee.pending_amount ||
                        0
                    );

            }
        );


        const pendingFeesElement =
            document.getElementById(
                "pendingFees"
            );


        if (pendingFeesElement) {

            pendingFeesElement.textContent =
                `₹${pendingFeeAmount.toLocaleString(
                    "en-IN"
                )}`;

        }


        // =================================================
        // RECENT COMPLAINTS
        // =================================================

        const complaintsTableBody =
            document.getElementById(
                "complaintsTableBody"
            );


        if (complaintsTableBody) {

            complaintsTableBody.innerHTML =
                "";


            if (!complaints.length) {

                complaintsTableBody.innerHTML = `
                    <tr>
                        <td colspan="3">
                            No complaints found.
                        </td>
                    </tr>
                `;

            } else {

                complaints
                    .slice(0, 5)
                    .forEach(
                        item => {

                            complaintsTableBody.innerHTML += `
                                <tr>

                                    <td>
                                        ${item.full_name || "-"}
                                    </td>

                                    <td>
                                        ${item.subject || "-"}
                                    </td>

                                    <td>
                                        ${item.status || "-"}
                                    </td>

                                </tr>
                            `;

                        }
                    );

            }

        }


        // =================================================
        // RECENT MAINTENANCE
        // =================================================

        const maintenanceTableBody =
            document.getElementById(
                "maintenanceTableBody"
            );


        if (maintenanceTableBody) {

            maintenanceTableBody.innerHTML =
                "";


            if (!maintenance.length) {

                maintenanceTableBody.innerHTML = `
                    <tr>
                        <td colspan="3">
                            No maintenance requests found.
                        </td>
                    </tr>
                `;

            } else {

                maintenance
                    .slice(0, 5)
                    .forEach(
                        item => {

                            maintenanceTableBody.innerHTML += `
                                <tr>

                                    <td>
                                        ${item.category || "-"}
                                    </td>

                                    <td>
                                        ${item.room_number || "-"}
                                    </td>

                                    <td>
                                        ${item.status || "-"}
                                    </td>

                                </tr>
                            `;

                        }
                    );

            }

        }


        // =================================================
        // RECENT PAYMENTS
        // =================================================

        const paymentsTableBody =
            document.getElementById(
                "paymentsTableBody"
            );


        if (paymentsTableBody) {

            paymentsTableBody.innerHTML =
                "";


            if (!payments.length) {

                paymentsTableBody.innerHTML = `
                    <tr>
                        <td colspan="3">
                            No payments found.
                        </td>
                    </tr>
                `;

            } else {

                payments
                    .slice(0, 5)
                    .forEach(
                        item => {

                            paymentsTableBody.innerHTML += `
                                <tr>

                                    <td>
                                        ${item.full_name || "-"}
                                    </td>

                                    <td>
                                        ₹${Number(
                                            item.amount || 0
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </td>

                                    <td>
                                        ${item.payment_mode || "-"}
                                    </td>

                                </tr>
                            `;

                        }
                    );

            }

        }


        // =================================================
        // RECENT NOTICES
        // =================================================

        const noticesTableBody =
            document.getElementById(
                "noticesTableBody"
            );


        if (noticesTableBody) {

            noticesTableBody.innerHTML =
                "";


            if (!notices.length) {

                noticesTableBody.innerHTML = `
                    <tr>
                        <td colspan="3">
                            No notices found.
                        </td>
                    </tr>
                `;

            } else {

                notices
                    .slice(0, 5)
                    .forEach(
                        item => {

                            noticesTableBody.innerHTML += `
                                <tr>

                                    <td>
                                        ${item.title || "-"}
                                    </td>

                                    <td>
                                        ${item.priority || "-"}
                                    </td>

                                    <td>
                                        ${item.status || "-"}
                                    </td>

                                </tr>
                            `;

                        }
                    );

            }

        }


    } catch (error) {

        console.error(
            "DASHBOARD ERROR:",
            error
        );

    }

}


// =====================================================
// LOGOUT
// =====================================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "index.html#login";

        }
    );

}


// =====================================================
// INITIAL LOAD
// =====================================================

loadUser();
loadDashboard();