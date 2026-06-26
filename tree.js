let drawn = {};

function drawTree() {

    canvas.innerHTML = "";

    const root = Object.values(people).find(
        p => p.name === "เภา"
    );

    if (!root) {
        alert("ไม่พบต้นตระกูล");
        return;
    }

    layoutTree(root.id);
    drawn = {};
    drawFamily(root.id);

    offsetX = 100;
    offsetY = 50;
    applyTransform();
}

function drawFamily(personId) {
    if(drawn[personId]) return;
    
    const person = people[personId];
    if (!person) return;

    const pos = layout[personId];

    const x = pos.x + 300;
    const y = pos.y * LEVEL_HEIGHT + 80;

    drawn[personId]=true;

    createPerson(person, x, y);

    const spouses = getSpouses(person);

let centerX = x + 45;

if (spouses.length > 0) {

    const firstX = x + 160;
    const lastX = x + 160 + (spouses.length - 1) * 180;

    centerX = (firstX + lastX) / 2 - 35;

    spouses.forEach((spouse, index) => {

        const sx = x + 160 + index * 180;

        createHeart(sx - 55, y + 25);

        createPerson(
            spouse,
            sx,
            y
        );

    });

}

    const children = getChildren(person);

    if (children.length === 0)
        return;

    drawLine(
        centerX,
        y + 90,
        4,
        50
    );

    const first = layout[children[0].id];
    const last = layout[children[children.length - 1].id];

    const lineStart = first.x + 345;
    const lineEnd = last.x + 345;

    drawLine(
        lineStart,
        y + 140,
        lineEnd - lineStart,
        4
    );

    children.forEach(child => {

        const childPos = layout[child.id];

        drawLine(
            childPos.x + 345,
            y + 140,
            4,
            80
        );

        drawFamily(child.id);

    });

}
