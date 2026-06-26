function createPerson(person, x, y){

    const div = document.createElement("div");

    div.className = "person";
    div.id = "person-" + person.id;

    div.style.left = x + "px";
    div.style.top = y + "px";

    div.onclick = () => showPopup(person);

    const genderClass =
        person.gender === "ช" ? "male" : "female";

    const icon =
        person.gender === "ช" ? "👨" : "👩";

    div.innerHTML = `
        <div class="circle ${genderClass}">
            ${icon}
        </div>
        <div class="person-name">
            ${person.name}
        </div>
    `;

    canvas.appendChild(div);
}

function createHeart(x,y){

    const heart=document.createElement("div");

    heart.className="heart";
    heart.innerHTML="❤️";

    heart.style.left=x+"px";
    heart.style.top=y+"px";

    canvas.appendChild(heart);
}

function drawLine(x,y,width,height){

    const line=document.createElement("div");

    line.className="line";

    line.style.left=x+"px";
    line.style.top=y+"px";
    line.style.width=width+"px";
    line.style.height=height+"px";

    canvas.appendChild(line);
}
