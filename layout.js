const NODE_WIDTH = 140; // เว้นช่องไฟระหว่างบุคคลแต่ละคน
const LEVEL_HEIGHT = 220; // ระยะห่างระหว่างรุ่น (แนวตั้ง)

let layout = {};

function layoutTree(){
    layout = {};

    // 1. แยกกลุ่มบุคคลออกเป็นกลุ่มตามรุ่น (Level)
    const rows = {};
    
    Object.values(people).forEach(person => {
        // หาข้อมูลครอบครัวที่คนนี้เป็นลูกเพื่อดูระดับรุ่น
        let personLevel = 0;
        const parentFamily = families.find(f => f.children.includes(person.id));
        
        if (parentFamily && parentFamily.level !== -1) {
            personLevel = parentFamily.level + 1;
        } else {
            // ถ้าไม่เจอครอบครัวพ่อแม่ ให้ดูว่าคนนี้ไปเป็นพ่อแม่ในครอบครัวไหนที่มีการตั้งระดับรุ่นไว้แล้วไหม
            const ownFamily = families.find(f => f.father == person.id || f.mother == person.id);
            if (ownFamily && ownFamily.level !== -1) {
                personLevel = ownFamily.level;
            }
        }

        if (!rows[personLevel]) rows[personLevel] = [];
        rows[personLevel].push(person);
    });

    // 2. จัดระเบียบแถวหน้ากระดานเรียงคิวทีละรุ่น
    Object.keys(rows).forEach(level => {
        let currentX = 100; // จุดเริ่มต้นแกน X ซ้ายสุดของแต่ละแถว
        const currentY = Number(level) * LEVEL_HEIGHT + 100; // พิกัดแกน Y ของรุ่นนั้นๆ

        // วนลูปวางตำแหน่งทุกคนในรุ่นนี้ต่อคิวเรียงกันไปข้างหน้า
        rows[level].forEach(person => {
            layout[person.id] = {
                x: currentX,
                y: currentY
            };
            currentX += NODE_WIDTH; // ดันระยะ X ไปข้างหน้าเพื่อไม่ให้คนถัดไปมาทับซ้อน
        });
    });
}
