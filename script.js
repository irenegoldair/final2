/* ==========================================================
   ORTHODOX EASTER & GREEK HOLIDAYS
========================================================== */
function getOrthodoxEaster(year) {
    const a = year % 4;
    const b = year % 7;
    const c = year % 19;
    const d = (19 * c + 15) % 30;
    const e = (2 * a + 4 * b - d + 34) % 7;
    const month = Math.floor((d + e + 114) / 31);
    const day = ((d + e + 114) % 31) + 1;
    return new Date(year, month - 1, day + 13);
}

function getGreekHolidays(year) {
    const easter = getOrthodoxEaster(year);
    const easterMonday = new Date(easter);
    easterMonday.setDate(easter.getDate() + 1);

    return [
        new Date(year, 0, 1),
        new Date(year, 0, 6),
        new Date(year, 2, 25),
        easterMonday,
        new Date(year, 4, 1),
        new Date(year, 7, 15),
        new Date(year, 9, 28),
        new Date(year, 11, 25),
        new Date(year, 11, 26)
    ];
}

function parseLocalDate(value) {
    if (!value) return null;

    const [year, month, day] = value.split("-").map(Number);

    // 🔥 FORCE local date χωρίς timezone issues
    const date = new Date();
    date.setFullYear(year, month - 1, day);
    date.setHours(12, 0, 0, 0); // midday = no timezone shift

    return date;
}

function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
}

function isInvalidDate(date) {
    if (!(date instanceof Date)) return true;

    const today = new Date();

    // ❌ αυθημερόν
    if (isSameDay(date, today)) return true;

    // ❌ ΣΚ
    const day = date.getDay();
    if (day === 0 || day === 6) return true;

    // ❌ αργίες
    const holidays = getGreekHolidays(date.getFullYear());

    return holidays.some(h => isSameDay(h, date));
}

/* ==========================================================
    MODAL POPUP
========================================================== */
const modal = document.getElementById("modalOverlay");
const modalMessage = document.getElementById("modalMessage");
const modalClose = document.getElementById("modalClose");

function showPopup(msg) {
    modalMessage.textContent = msg;
    modal.classList.remove("hidden");
}

modalClose.addEventListener("click", () => {
    modal.classList.add("hidden");
});


/* ==========================================================
    DATE PICKER
========================================================== */
const deliveryDate = document.getElementById("deliveryDate");
const dateBar = document.querySelector(".date-bar");

if (dateBar && deliveryDate) {
    dateBar.addEventListener("click", () => {
        deliveryDate.showPicker?.();
        deliveryDate.focus();
    });
}
applyDateCutoff()
if (deliveryDate) {
deliveryDate.addEventListener("blur", () => {
    if (!deliveryDate.value) return;

    const d = parseLocalDate(deliveryDate.value);

    if (d && isInvalidDate(d)) {
        deliveryDate.value = "";
        showPopup(
            "Η ημερομηνία επιλογής δεν μπορεί να είναι αυθημερών, " +
            "Σάββατο, Κυριακή ή αργία.");
        }
    });
}


function applyDateCutoff() {
    if (!deliveryDate) return;

    const now = new Date();
    const minutesNow = now.getHours() * 60 + now.getMinutes();

    let minDate = new Date();
    minDate.setHours(12, 0, 0, 0);

    // ⏰ πριν τις 14:00 → αύριο
    if (minutesNow < 840) {
        minDate.setDate(minDate.getDate() + 1);
    }
    // ⏰ μετά τις 14:00 → μεθαύριο
    else {
        minDate.setDate(minDate.getDate() + 2);
    }

    const yyyy = minDate.getFullYear();
    const mm = String(minDate.getMonth() + 1).padStart(2, "0");
    const dd = String(minDate.getDate()).padStart(2, "0");

    deliveryDate.min = `${yyyy}-${mm}-${dd}`;
}

/* ==========================================================
   VALIDATION HELPER
========================================================== */

function validateDeliveryDate(showError) {
    if (!deliveryDate.value) {
        if (showError) showPopup("Επιλέξτε ημερομηνία παράδοσης.");
        return false;
    }

    const d = parseLocalDate(deliveryDate.value);

    if (!d || isInvalidDate(d)) {

        deliveryDate.value = "";      
        deliveryDate.focus();        

        if (showError) {
            showPopup(
                "Δεν επιτρέπεται η επιλογή ραντεβού για επόμενη ημέρα μετά τις 14:00" +
                "καθώς αυθημερών, Σάββατο, Κυριακή ή αργία."
            );
        }

        return false;
    }
 // Cut off ώρα 
    
const now = new Date();

const selectedDate = parseLocalDate(deliveryDate.value);

// tomorrow normalized
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(12, 0, 0, 0);

if (selectedDate && isSameDay(selectedDate, tomorrow)) {

    const currentTime = now.getHours() * 60 + now.getMinutes();

    // 14:00 = 840 λεπτά
    if (currentTime > 840) {

        deliveryDate.value = "";

        if (showError) {
            showPopup(
                "Για παράδοση επόμενης ημέρας οι παραγγελίες γίνονται έως τις 14:00."
            );
        }

        return false;
    }
}

    return true;
}

/* ==========================================================
    NEW ADDRESS — SHOW / HIDE
========================================================== */
const changeAddressBtn = document.getElementById("changeAddressBtn");
const cancelNewAddress = document.getElementById("cancelNewAddress");
const newAddressSection = document.getElementById("newAddressSection");

changeAddressBtn.addEventListener("click", () => {

    const selectedRadio = document.querySelector("input[name='deliveryMethod']:checked");

    if (!selectedRadio || selectedRadio.value !== "address") {
        showPopup("Πρώτα επιλέξτε 'Παράδοση στη δηλωθείσα διεύθυνση'.");
        return;
    }

    newAddressSection.classList.remove("hidden");
});

cancelNewAddress.addEventListener("click", () => {
    newAddressSection.classList.add("hidden");
});


/* ==========================================================
    CUSTOMER SERVICE CHECKBOX
========================================================== */
const customerService = document.getElementById("customerService");
const customerServicePanel = document.getElementById("customerServicePanel");



/* ==========================================================
    PHONE VALIDATION (10 digits)
========================================================== */
const phone = document.getElementById("phone");

if (phone) {
    phone.addEventListener("input", () => {
        const cleaned = phone.value.replace(/\D/g, "");
        phone.value = cleaned;
    });
}


/* ==========================================================
    REQUIRED VALIDATION — ΜΕ ΑΝΑΦΟΡΑ ΣΕ ΚΑΘΕ ΠΕΔΙΟ
========================================================== */
function validateNewAddressFields() {

    const fieldMap = [
        { id: "new_street", label: "Οδός & Αριθμός" },
        { id: "new_zip", label: "Τ.Κ." },
        { id: "new_city", label: "Πόλη" },
        { id: "new_region", label: "Νομός" },
        { id: "phone", label: "Τηλέφωνο επικοινωνίας" },
        { id: "new_code", label: "Κωδικός εγκατάστασης" }
    ];

    
    for (let f of fieldMap) {
        const el = document.getElementById(f.id);
        if (el && el.value.trim() === "") {
            el.style.borderColor = "#ff4444";
            showPopup(`Συμπληρώστε ${f.label}.`);
            return false;
        } else {
            el.style.borderColor = "#444"; 
        }
    }

    
    const phoneVal = document.getElementById("phone").value;
    if (phoneVal.length !== 10) {
        document.getElementById("phone").style.borderColor = "#ff4444";
        showPopup("Το τηλέφωνο πρέπει να έχει υποχρεωτικά 10 ψηφία.");
        return false;
    }

    return true;
}


/* ==========================================================
    DELIVERY METHOD — FIXED BEHAVIOR (radio but uncheckable)
========================================================== */

const deliveryRadios = document.querySelectorAll("input[name='deliveryMethod']");
const rampMapSection = document.getElementById("rampMapSection");
const newAddressSection2 = document.getElementById("newAddressSection");
const defaultAddress2 = document.getElementById("defaultAddress");

deliveryRadios.forEach(radio => {

   
    radio.addEventListener("click", (e) => {
        if (radio.dataset.waschecked === "true") {
            radio.checked = false;
            radio.dataset.waschecked = "false";

           
            rampMapSection.classList.add("hidden");
            newAddressSection2.classList.remove("disabled");
            newAddressSection2.classList.add("hidden");
            defaultAddress2.classList.remove("hidden");
        } else {
            
            deliveryRadios.forEach(r => r.dataset.waschecked = "false");
            radio.dataset.waschecked = "true";
        }
    });

   
    radio.addEventListener("change", () => {

        if (radio.checked && radio.value === "ramp") {
            rampMapSection.classList.remove("hidden");
            newAddressSection2.classList.add("hidden");
            newAddressSection.classList.add("hidden");
            newAddressSection2.classList.add("disabled");
            defaultAddress2.classList.add("hidden");
        }

    if (radio.checked && radio.value === "address") {
    rampMapSection.classList.add("hidden");

    newAddressSection2.classList.remove("disabled");

    // ❗ ΔΕΝ ανοίγουμε τα πεδία εδώ
    newAddressSection2.classList.add("hidden");

    defaultAddress2.classList.remove("hidden");
}
    });
});

/* ==========================================================
   FORM SUBMISSION — Redirect to success page
========================================================== */
const submitForm = document.getElementById("submitForm");

submitForm.addEventListener("click", () => {

    if (deliveryDate.value.trim() === "") {
        showPopup("Επιλέξτε ημερομηνία παράδοσης.");
        return;
    }

    
 // ✅ validation ημερομηνίας + cutoff 14:00
    if (!validateDeliveryDate(true)) {
        return;
    }

const selectedRadio = document.querySelector("input[name='deliveryMethod']:checked");


if (!selectedRadio) {
    showPopup("Επιλέξτε τρόπο παράδοσης.");
    return;
}


const method = selectedRadio.value;

    let finalAddress = "";

    if (method === "ramp") {
        finalAddress = "Κισσάβου, Ασπρόπυργος 193 00";
    } else {

        if (!newAddressSection.classList.contains("hidden")) {

         if (!validateNewAddressFields()) {
    return; // ❗ αφήνουμε τη function να δείξει το σωστό μήνυμα
}

            finalAddress =
                `${new_street.value}, ${new_zip.value} ${new_city.value}, ${new_region.value}`;

        } else {

            finalAddress = "ΑΛΦΑ ΑΕ, Λεωφόρος Κηφισίας 124, 15125 Μαρούσι, Αττική";
        }
    }

    const redirect = `success.html?date=${encodeURIComponent(deliveryDate.value)}&address=${encodeURIComponent(finalAddress)}`;
    window.location.href = redirect;
});
