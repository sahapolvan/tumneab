const NODE_WIDTH = 130;    // ระยะห่างระหว่างบุคคลแต่ละคน
const LEVEL_HEIGHT = 240;  // ระยะห่างแนวตั้งระหว่างรุ่น

let layout = {};

function layoutTree() {
    layout = {};
    const personLevels = {};

    // 1. คำนวณเจเนอเรชันล็อกตามสายเลือดจริงจากตารางข้อมูล
    Object.values(people).forEach(person => {
        if (person.id == "1" || person.id == "2") {
            personLevels[person.id] = 0;
        }
    });

    for (let run = 0; run < 3; run++) {
        Object.values(people).forEach(person => {
            const fatherLevel = personLevels[person.father];
            const motherLevel = personLevels[person.mother];
            if (fatherLevel !== undefined) {
                personLevels[person.id] = fatherLevel + 1;
            } else if (motherLevel !== undefined) {
                personLevels[person.id] = motherLevel + 1;
            }
        });
    }

    Object.values(people).forEach(person => {
        if (personLevels[person.id] === undefined) {
            const spouseField = person.spouse || person.spoues;
            if (spouseField) {
                const spouseIds = spouseField.split("|").map(id => id.trim());
                for (let sId of spouseIds) {
                    if (personLevels[sId] !== undefined) {
                        personLevels[person.id] = personLevels[sId];
                        break;
                    }
                }
            }
        }
    });

    // 2. จัดกลุ่มครอบครัวตามโครงสร้าง Families
    const rows = {};
    Object.keys(personLevels).forEach(pId => {
        const gen = personLevels[pId];
        if (!rows[gen]) rows[gen] = [];
        rows[gen].push(people[pId]);
    });

    // 3. วางตำแหน่งจากล่างขึ้นบนเพื่อให้รุ่นพ่อแม่จัดกึ่งกลางเหนือรุ่นลูกเสมอ
    let currentX = 100;
    
    // วางรุ่นที่ 2 (รุ่นหลาน) ก่อนเพื่อเป็นฐานสเปซในการจัดกึ่งกลาง
    if (rows[2]) {
        const visited = new Set();
        // วนลูปตามครอบครัวในรุ่นลูกเพื่อจัดกลุ่มหลานให้อยู่ด้วยกัน
        families.forEach(fam => {
            const parentLevel = personLevels[fam.father] || personLevels[fam.mother];
            if (parentLevel === 1 && fam.children && fam.children.length > 0) {
                
                // วางกลุ่มลูก (รุ่นหลาน) ของครอบครัวนี้เรียงกัน
                fam.children.forEach(childId => {
                    const child = people[childId];
                    if (child && !visited.has(childId)) {
                        layout[childId] = { x: currentX, y: 2 * LEVEL_HEIGHT + 100 };
                        visited.add(childId);
                        currentX += NODE_WIDTH;

                        // ดึงคู่สมรสของหลานมานั่งติดกันทันที
                        const spouseField = child.spouse || child.spoues;
                        if (spouseField) {
                            spouseField.split("|").forEach(sId => {
                                const partnerId = sId.trim();
                                if (people[partnerId] && !visited.has(partnerId)) {
                                    layout[partnerId] = { x: currentX, y: 2 * LEVEL_HEIGHT + 100 };
                                    visited.add(partnerId);
                                    currentX += NODE_WIDTH;
                                    
                                    // เขยิบช่องไฟเพิ่มหลังคู่แต่งงานเพื่อแยกกลุ่มบ้าน
                                    currentX += 30; 
                                }
                            });
                        }
                    }
                });
                currentX += 60; // เว้นช่องว่างระหว่างกลุ่มบ้านหลานแต่ละสาย
            }
        });
    }

    // วางรุ่นที่ 1 (รุ่นลูกของเภา) โดยคำนวณให้อยู่กึ่งกลางกลุ่มลูก ๆ ของตัวเอง
    if (rows[1]) {
        const visited = new Set();
        families.forEach(fam => {
            if (fam.id === "1|2" || fam.id === "2|1") return; // ข้ามครอบครัวต้นตระกูลไปก่อน
            
            const father = people[fam.father];
            const mother = people[fam.mother];
            
            // หาจุดกึ่งกลางจากพิกัดของลูก ๆ ที่เราวางไว้ในฐานรุ่นหลานเมื่อครู่
            let childrenXSum = 0;
            let validChildrenCount = 0;
            if (fam.children) {
                fam.children.forEach(cId => {
                    if (layout[cId]) {
                        childrenXSum += layout[cId].x;
                        validChildrenCount++;
                        // เผื่อพิกัดคู่สมรสของลูกด้วยถ้ามี
                        const spouseField = people[cId]?.spouse || people[cId]?.spoues;
                        if (spouseField) {
                            spouseField.split("|").forEach(sId => {
                                if (layout[sId.trim()]) {
                                    childrenXSum += layout[sId.trim()].x;
                                    validChildrenCount++;
                                }
                            });
                        }
                    }
                });
            }

            let targetCenterX = currentX;
            if (validChildrenCount > 0) {
                targetCenterX = childrenXSum / validChildrenCount;
            }

            // จัดวางตำแหน่งพ่อและแม่ให้อยู่คร่อมจุดกึ่งกลางใต้กลุ่มลูกพอดี
            if (father && !visited.has(father.id) && mother && !visited.has(mother.id)) {
                layout[father.id] = { x: targetCenterX - 70, y: 1 * LEVEL_HEIGHT + 100 };
                layout[mother.id] = { x: targetCenterX + 70, y: 1 * LEVEL_HEIGHT + 100 };
                visited.add(father.id);
                visited.add(mother.id);
            } else {
                // ถ้าเป็นคนโสด (เช่น นายแอ้ ไอดี 11) หรือโหนดเดี่ยว
                if (father && !visited.has(father.id)) {
                    layout[father.id] = { x: targetCenterX, y: 1 * LEVEL_HEIGHT + 100 };
                    visited.add(father.id);
                }
                if (mother && !visited.has(mother.id)) {
                    layout[mother.id] = { x: targetCenterX, y: 1 * LEVEL_HEIGHT + 100 };
                    visited.add(mother.id);
                }
            }
        });

        // เก็บตกคนที่ไม่มีครอบครัวในรุ่น 1 ให้วางต่อท้ายแถว
        rows[1].forEach(p => {
            if (!layout[p.id]) {
                // หาค่า X ขวาสุดที่มีในรุ่น 1 แล้วบวกเพิ่ม
                let maxX = 100;
                Object.keys(layout).forEach(id => {
                    if (personLevels[id] === 1 && layout[id].x > maxX) maxX = layout[id].x;
                });
                layout[p.id] = { x: maxX + NODE_WIDTH + 50, y: 1 * LEVEL_HEIGHT + 100 };
            }
        });
    }

    // วางรุ่นที่ 0 (ต้นตระกูล เภา-สวัสดิ์) ให้อยู่กึ่งกลางหน้าจอของรุ่นลูกทั้งหมดแบบสมดุล
    if (rows[0]) {
        let r1XSum = 0;
        let r1Count = 0;
        Object.keys(layout).forEach(id => {
            if (personLevels[id] === 1) {
                r1XSum += layout[id].x;
                r1Count++;
            }
        });
        
        const midR1X = r1Count > 0 ? r1XSum / r1Count : 300;
        const rootFather = people["1"];
        const rootMother = people["2"];
        
        if (rootFather) layout[rootFather.id] = { x: midR1X - 75, y: 0 * LEVEL_HEIGHT + 100 };
        if (rootMother) layout[rootMother.id] = { x: midR1X + 75, y: 0 * LEVEL_HEIGHT + 100 };
    }
}
