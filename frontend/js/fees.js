const API = "http://localhost:5000/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}


function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}


// =========================
// LOAD FEES
// =========================

async function loadFees() {

    try {

        const response = await fetch(
            `${API}/fees`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        const body =
            document.getElementById("feesBody");

        const select =
            document.getElementById("student_fee_id");

        body.innerHTML = "";

        select.innerHTML =
            `<option value="">
                Select Fee Record
            </option>`;


        data.fees.forEach(fee => {

            body.innerHTML += `
                <tr>

                    <td>${fee.student_fee_id}</td>

                    <td>${fee.full_name}</td>

                    <td>${fee.academic_year}</td>

                    <td>₹${fee.total_amount}</td>

                    <td>₹${fee.paid_amount}</td>

                    <td>₹${fee.pending_amount}</td>

                    <td>${fee.payment_option}</td>

                    <td>${fee.status}</td>

                </tr>
            `;


            select.innerHTML += `
                <option value="${fee.student_fee_id}">
                    ${fee.full_name} -
                    ₹${fee.pending_amount} pending
                </option>
            `;

        });

    } catch (error) {

        console.error(
            "LOAD FEES ERROR:",
            error
        );

    }

}


// =========================
// RECORD PAYMENT
// =========================

document
    .getElementById("paymentForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const data = {

                student_fee_id:
                    Number(
                        document.getElementById(
                            "student_fee_id"
                        ).value
                    ),

                installment_no:
                    Number(
                        document.getElementById(
                            "installment_no"
                        ).value
                    ),

                amount:
                    Number(
                        document.getElementById(
                            "amount"
                        ).value
                    ),

                payment_mode:
                    document.getElementById(
                        "payment_mode"
                    ).value,

                transaction_ref:
                    document.getElementById(
                        "transaction_ref"
                    ).value || null,

                receipt_no:
                    document.getElementById(
                        "receipt_no"
                    ).value

            };


            try {

                const response = await fetch(
                    `${API}/payments`,
                    {
                        method: "POST",
                        headers: authHeaders(),
                        body: JSON.stringify(data)
                    }
                );


                const result =
                    await response.json();


                document.getElementById(
                    "paymentMessage"
                ).textContent =
                    result.message;


                if (response.ok) {

                    document
                        .getElementById("paymentForm")
                        .reset();

                    await loadFees();

                    await loadPayments();

                }

            } catch (error) {

                console.error(
                    "PAYMENT ERROR:",
                    error
                );

                document.getElementById(
                    "paymentMessage"
                ).textContent =
                    "Cannot connect to backend";

            }

        }
    );


// =========================
// LOAD PAYMENT HISTORY
// =========================

async function loadPayments() {

    try {

        const response = await fetch(
            `${API}/payments`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        const body =
            document.getElementById("paymentsBody");

        body.innerHTML = "";


        data.payments.forEach(payment => {

            body.innerHTML += `
                <tr>

                    <td>${payment.payment_id}</td>

                    <td>${payment.full_name}</td>

                    <td>${payment.installment_no}</td>

                    <td>₹${payment.amount}</td>

                    <td>
                        ${payment.payment_date
                            ? payment.payment_date.substring(0, 10)
                            : "-"}
                    </td>

                    <td>${payment.payment_mode}</td>

                    <td>${payment.receipt_no}</td>

                </tr>
            `;

        });

    } catch (error) {

        console.error(
            "LOAD PAYMENTS ERROR:",
            error
        );

    }

}


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

loadFees();
loadPayments();