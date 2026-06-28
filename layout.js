const LEVEL_HEIGHT = 260;

let layout = {};

function layoutTree(rootId){

    layout = {};

    let maxWidth = 0;

    generations.forEach(level=>{

        let width = 0;

        level.forEach(id=>{

            const person = people[id];

            width += getPersonWidth(person);

        });

        if(width > maxWidth)
            maxWidth = width;

    });

    canvasWidth = maxWidth + 400;
    canvasHeight = generations.length * LEVEL_HEIGHT + 300;

    resizeCanvas();

    generations.forEach((level,row)=>{

        layoutGeneration(
            level,
            row,
            maxWidth
        );

    });

}
