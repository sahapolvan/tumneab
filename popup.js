// ==========================
// Popup
// ==========================

let currentPerson = null;

function showPopup(person){

    currentPerson = person;

    const popup =
        document.getElementById("personPopup");

    popup.style.display = "flex";

    // ----------------------
    // ชื่อ
    // ----------------------

    const prefix =
        person.prefix || "";

    document.getElementById("popName").innerText =
        prefix + " " + person.name;

    // ----------------------
    // วันเกิด
    // ----------------------

    document.getElementById("popBirthday").innerText =
        person.birthday || "-";

    // ----------------------
    // บิดา
    // ----------------------

    const father =
        people[person.father];

    document.getElementById("popFather").innerText =
        father ? father.name : "-";

    // ----------------------
    // มารดา
    // ----------------------

    const mother =
        people[person.mother];

    document.getElementById("popMother").innerText =
        mother ? mother.name : "-";

    // ----------------------
    // คู่สมรส
    // ----------------------

    renderSpouses(person);

    // ----------------------
    // บุตร
    // ----------------------

    renderChildren(person);

    // ----------------------
    // ติดต่อ
    // ----------------------

    renderContact(person);

    // ----------------------
    // รายละเอียด
    // ----------------------

    renderDetail(person);

}

function closePopup(){

    document.getElementById("personPopup").style.display = "none";

}

// ==========================
// คู่สมรส
// ==========================

function renderSpouses(person){

    const box =
        document.getElementById("popSpouses");

    const spouses =
        getSpouses(person);

    if(spouses.length==0){

        box.innerHTML = "-";

        return;

    }

    box.innerHTML = spouses
        .map(p=>`❤️ ${p.name}`)
        .join("<br>");

}

// ==========================
// บุตร
// ==========================

function renderChildren(person){

    const box =
        document.getElementById("popChildren");

    const children =
        getChildren(person);

    if(children.length==0){

        box.innerHTML="-";

        return;

    }

    box.innerHTML = children
        .map(c=>"👶 "+c.name)
        .join("<br>");

}

// ==========================
// ติดต่อ
// ==========================

function renderContact(person){

    const box =
        document.getElementById("popContact");

    let html = "";

    if(person.phone){

        html +=
            "📞 " + person.phone + "<br>";

    }

    if(person.line){

        html +=
            "💬 " + person.line + "<br>";

    }

    if(person.facebook){

        html +=
            "📘 " + person.facebook + "<br>";

    }

    if(html=="")
        html="-";

    box.innerHTML = html;

}

// ==========================
// รายละเอียด
// ==========================

function renderDetail(person){

    const box =
        document.getElementById("popDetail");

    box.innerHTML =
        person.note || "-";

}

