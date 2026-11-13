const API = "http://localhost:5000/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}


// =========================
// AUTH HEADERS
// =========================

function headers() {

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

}


// =========================
// LOAD ALL DATA
// =========================

async function loadAll() {

    await loadHostels();

    await loadBlocks();

    await loadFloors();

    await loadRooms();

    await loadBeds();

}


// =========================
// HOSTELS
// =========================

async function loadHostels() {

    const response = await fetch(
        `${API}/hostels`,
        {
            headers: headers()
        }
    );

    const data = await response.json();

    const body =
        document.getElementById("hostelsBody");

    const select =
        document.getElementById("block_hostel");

    body.innerHTML = "";

    select.innerHTML =
        `<option value="">
            Select Hostel
        </option>`;


    data.hostels.forEach(hostel => {

        body.innerHTML += `
            <tr>

                <td>
                    ${hostel.hostel_id}
                </td>

                <td>
                    ${hostel.hostel_name}
                </td>

                <td>
                    ${hostel.gender}
                </td>

                <td>
                    ${hostel.address || "-"}
                </td>

                <td>
                    ${hostel.status}
                </td>

            </tr>
        `;


        select.innerHTML += `
            <option value="${hostel.hostel_id}">
                ${hostel.hostel_name}
            </option>
        `;

    });

}


// =========================
// ADD HOSTEL
// =========================

document
    .getElementById("hostelForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const data = {

                hostel_name:
                    document.getElementById(
                        "hostel_name"
                    ).value,

                gender:
                    document.getElementById(
                        "hostel_gender"
                    ).value,

                address:
                    document.getElementById(
                        "hostel_address"
                    ).value || null,

                status:
                    document.getElementById(
                        "hostel_status"
                    ).value

            };


            const response = await fetch(
                `${API}/hostels`,
                {
                    method: "POST",
                    headers: headers(),
                    body: JSON.stringify(data)
                }
            );


            const result =
                await response.json();


            document.getElementById(
                "hostelMessage"
            ).textContent =
                result.message;


            if (response.ok) {

                document
                    .getElementById("hostelForm")
                    .reset();

                await loadHostels();

            }

        }
    );


// =========================
// BLOCKS
// =========================

async function loadBlocks() {

    const response = await fetch(
        `${API}/blocks`,
        {
            headers: headers()
        }
    );

    const data = await response.json();

    const body =
        document.getElementById("blocksBody");

    const select =
        document.getElementById("floor_block");

    body.innerHTML = "";

    select.innerHTML =
        `<option value="">
            Select Block
        </option>`;


    data.blocks.forEach(block => {

        body.innerHTML += `
            <tr>

                <td>
                    ${block.block_id}
                </td>

                <td>
                    ${block.hostel_name}
                </td>

                <td>
                    ${block.block_name}
                </td>

                <td>
                    ${block.status}
                </td>

            </tr>
        `;


        select.innerHTML += `
            <option value="${block.block_id}">
                ${block.hostel_name} -
                ${block.block_name}
            </option>
        `;

    });

}


// =========================
// ADD BLOCK
// =========================

document
    .getElementById("blockForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const data = {

                hostel_id:
                    Number(
                        document.getElementById(
                            "block_hostel"
                        ).value
                    ),

                block_name:
                    document.getElementById(
                        "block_name"
                    ).value,

                status:
                    document.getElementById(
                        "block_status"
                    ).value

            };


            const response = await fetch(
                `${API}/blocks`,
                {
                    method: "POST",
                    headers: headers(),
                    body: JSON.stringify(data)
                }
            );


            const result =
                await response.json();


            document.getElementById(
                "blockMessage"
            ).textContent =
                result.message;


            if (response.ok) {

                document
                    .getElementById("blockForm")
                    .reset();

                await loadBlocks();

            }

        }
    );


// =========================
// FLOORS
// =========================

async function loadFloors() {

    const response = await fetch(
        `${API}/floors`,
        {
            headers: headers()
        }
    );

    const data = await response.json();

    const body =
        document.getElementById("floorsBody");

    const select =
        document.getElementById("room_floor");

    body.innerHTML = "";

    select.innerHTML =
        `<option value="">
            Select Floor
        </option>`;


    data.floors.forEach(floor => {

        body.innerHTML += `
            <tr>

                <td>
                    ${floor.floor_id}
                </td>

                <td>
                    ${floor.hostel_name}
                </td>

                <td>
                    ${floor.block_name}
                </td>

                <td>
                    ${floor.floor_number}
                </td>

            </tr>
        `;


        select.innerHTML += `
            <option value="${floor.floor_id}">
                ${floor.hostel_name} -
                ${floor.block_name} -
                Floor ${floor.floor_number}
            </option>
        `;

    });

}


// =========================
// ADD FLOOR
// =========================

document
    .getElementById("floorForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const data = {

                block_id:
                    Number(
                        document.getElementById(
                            "floor_block"
                        ).value
                    ),

                floor_number:
                    Number(
                        document.getElementById(
                            "floor_number"
                        ).value
                    )

            };


            const response = await fetch(
                `${API}/floors`,
                {
                    method: "POST",
                    headers: headers(),
                    body: JSON.stringify(data)
                }
            );


            const result =
                await response.json();


            document.getElementById(
                "floorMessage"
            ).textContent =
                result.message;


            if (response.ok) {

                document
                    .getElementById("floorForm")
                    .reset();

                await loadFloors();

            }

        }
    );


// =========================
// ROOMS
// =========================

async function loadRooms() {

    const response = await fetch(
        `${API}/rooms`,
        {
            headers: headers()
        }
    );

    const data = await response.json();

    const body =
        document.getElementById("roomsBody");

    const select =
        document.getElementById("bed_room");

    body.innerHTML = "";

    select.innerHTML =
        `<option value="">
            Select Room
        </option>`;


    data.rooms.forEach(room => {

        body.innerHTML += `
            <tr>

                <td>
                    ${room.room_id}
                </td>

                <td>
                    ${room.hostel_name}
                </td>

                <td>
                    ${room.block_name}
                </td>

                <td>
                    ${room.floor_number}
                </td>

                <td>
                    ${room.room_number}
                </td>

                <td>
                    ${room.room_type}
                </td>

                <td>
                    ${room.capacity}
                </td>

                <td>
                    ${room.status}
                </td>

            </tr>
        `;


        select.innerHTML += `
            <option value="${room.room_id}">
                ${room.hostel_name} -
                ${room.room_number}
            </option>
        `;

    });

}


// =========================
// ADD ROOM
// =========================

document
    .getElementById("roomForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const data = {

                floor_id:
                    Number(
                        document.getElementById(
                            "room_floor"
                        ).value
                    ),

                room_number:
                    document.getElementById(
                        "room_number"
                    ).value,

                room_type:
                    document.getElementById(
                        "room_type"
                    ).value,

                capacity:
                    Number(
                        document.getElementById(
                            "room_capacity"
                        ).value
                    ),

                status: "AVAILABLE"

            };


            const response = await fetch(
                `${API}/rooms`,
                {
                    method: "POST",
                    headers: headers(),
                    body: JSON.stringify(data)
                }
            );


            const result =
                await response.json();


            document.getElementById(
                "roomMessage"
            ).textContent =
                result.message;


            if (response.ok) {

                document
                    .getElementById("roomForm")
                    .reset();

                await loadRooms();

            }

        }
    );


// =========================
// BEDS
// =========================

async function loadBeds() {

    const response = await fetch(
        `${API}/beds`,
        {
            headers: headers()
        }
    );

    const data = await response.json();

    const body =
        document.getElementById("bedsBody");

    body.innerHTML = "";


    data.beds.forEach(bed => {

        body.innerHTML += `
            <tr>

                <td>
                    ${bed.bed_id}
                </td>

                <td>
                    ${bed.hostel_name}
                </td>

                <td>
                    ${bed.block_name}
                </td>

                <td>
                    ${bed.floor_number}
                </td>

                <td>
                    ${bed.room_number}
                </td>

                <td>
                    ${bed.bed_number}
                </td>

                <td>
                    ${bed.status}
                </td>

            </tr>
        `;

    });

}


// =========================
// ADD BED
// =========================

document
    .getElementById("bedForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const data = {

                room_id:
                    Number(
                        document.getElementById(
                            "bed_room"
                        ).value
                    ),

                bed_number:
                    Number(
                        document.getElementById(
                            "bed_number"
                        ).value
                    ),

                status: "AVAILABLE"

            };


            const response = await fetch(
                `${API}/beds`,
                {
                    method: "POST",
                    headers: headers(),
                    body: JSON.stringify(data)
                }
            );


            const result =
                await response.json();


            document.getElementById(
                "bedMessage"
            ).textContent =
                result.message;


            if (response.ok) {

                document
                    .getElementById("bedForm")
                    .reset();

                await loadBeds();

            }

        }
    );


// =========================
// BACK BUTTON
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

loadAll();