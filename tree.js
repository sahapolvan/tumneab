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

    drawFamily(root.id);

    offsetX = 100;
    offsetY = 50;
    applyTransform();
}

function drawFamily(personId) {

    if (layout[personId]) return;

    const person = people[personId];
    if (!person) return;

    const pos = layout[personId];

    const x = pos.x + 300;
    const y = pos.y * LEVEL_HEIGHT + 80;

    layout[personId] = true;

    createPerson(person, x, y);

    const spouse = people[person.spoues];

    let centerX = x + 45;

    if (spouse) {

        createHeart(x + 105, y + 25);

        createPerson(
            spouse,
            x + 160,
            y
        );

        centerX = x + 125;
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
