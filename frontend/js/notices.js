const API = "http://localhost:5000/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}


// =========================
// LOAD BLOCKS
// =========================

async function loadBlocks() {

    try {

        const response = await fetch(
            `${API}/blocks`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        const select =
            document.getElementById("target_block_id");

        select.innerHTML =
            `<option value="">
                Select Block
            </option>`;

        data.blocks.forEach(block => {

            select.innerHTML += `
                <option value="${block.block_id}">
                    ${block.hostel_name} - ${block.block_name}
                </option>
            `;

        });

    } catch (error) {

        console.error("LOAD BLOCKS ERROR:", error);

    }
}


// =========================
// TARGET TYPE
// =========================

document
    .getElementById("target_type")
    .addEventListener("change", () => {

        const targetType =
            document.getElementById("target_type").value;

        const blockField =
            document.getElementById("blockField");

        if (targetType === "BLOCK") {

            blockField.classList.remove("hidden");

        } else {

            blockField.classList.add("hidden");

            document.getElementById(
                "target_block_id"
            ).value = "";

        }

    });


// =========================
// LOAD NOTICES
// =========================

async function loadNotices() {

    try {

        const response = await fetch(
            `${API}/notices`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        const body =
            document.getElementById("noticesBody");

        body.innerHTML = "";


        if (!data.notices || data.notices.length === 0) {

            body.innerHTML = `
                <tr>
                    <td colspan="8">
                        No notices found
                    </td>
                </tr>
            `;

            return;
        }


        data.notices.forEach(notice => {

            body.innerHTML += `
                <tr>

                    <td>${notice.notice_id}</td>

                    <td>${notice.title}</td>

                    <td>${notice.category || "-"}</td>

                    <td>${notice.priority}</td>

                    <td>
                        ${notice.target_type}
                    </td>

                    <td>
                        ${notice.status}
                    </td>

                    <td>
                        ${
                            notice.published_at
                            ?
                            new Date(
                                notice.published_at
                            ).toLocaleString()
                            :
                            "-"
                        }
                    </td>

                    <td>

                        ${
                            notice.status === "PUBLISHED"
                            ?
                            `
                            <button
                                class="small-btn"
                                onclick="expireNotice(${notice.notice_id})">
                                Expire
                            </button>
                            `
                            :
                            "—"
                        }

                    </td>

                </tr>
            `;

        });

    } catch (error) {

        console.error(
            "LOAD NOTICES ERROR:",
            error
        );

    }
}


// =========================
// ADD NOTICE
// =========================

document
    .getElementById("noticeForm")
    .addEventListener("submit", async event => {

        event.preventDefault();


        const targetType =
            document.getElementById(
                "target_type"
            ).value;


        const expiresValue =
            document.getElementById(
                "expires_at"
            ).value;


        const noticeData = {

            title:
                document.getElementById(
                    "title"
                ).value,

            description:
                document.getElementById(
                    "description"
                ).value,

            category:
                document.getElementById(
                    "category"
                ).value || null,

            priority:
                document.getElementById(
                    "priority"
                ).value,

            target_type:
                targetType,

            target_block_id:
                targetType === "BLOCK"
                    ?
                    Number(
                        document.getElementById(
                            "target_block_id"
                        ).value
                    )
                    :
                    null,

            attachment_url: null,

            expires_at:
                expiresValue
                    ?
                    new Date(
                        expiresValue
                    ).toISOString()
                    :
                    null,

            status: "PUBLISHED"

        };


        try {

            const response = await fetch(
                `${API}/notices`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(
                            noticeData
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
                    .getElementById("noticeForm")
                    .reset();

                document
                    .getElementById("blockField")
                    .classList.add("hidden");

                loadNotices();

            }

        } catch (error) {

            console.error(
                "NOTICE ERROR:",
                error
            );

            document.getElementById(
                "message"
            ).textContent =
                "Cannot connect to backend";

        }

    });


// =========================
// EXPIRE NOTICE
// =========================

window.expireNotice = async function(id) {

    const confirmed =
        confirm(
            "Are you sure you want to expire this notice?"
        );

    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${API}/notices/${id}/status`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    status: "EXPIRED"
                })
            }
        );


        const result =
            await response.json();


        alert(result.message);

        loadNotices();

    } catch (error) {

        console.error(
            "EXPIRE NOTICE ERROR:",
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

loadBlocks();
loadNotices();