function displayObject(id, x, y, width, height) {
    const o = {
        id, x,y, width, height
    };
    o.leftX = (o.x - o.y - o.height);
    o.rightX = (o.x + o.width - o.y);  // 注意这里应该要 / sqrt(2), 但只要比大小所以忽略
    o.leftY = o.x + o.y + o.height;
    o.rightY = o.x + o.width + o.y;
    o.topX = o.x - o.y;
    o.topY = o.x + o.y;
    return o;
}

let list = [];
let graph = [];

function addDisplayObject(id, x, y, width, height) {
    let node = displayObject(id, x, y, width, height);
    list.push(node);
}

// 6 种结果
// 1: 1 的右边与 2 的左边叠加 - 比较 1 的右角跟 2 的左角高度
// 2: 1 的左边与 2 的右边叠加 - 比较 1 的左角跟 2 的右角高度
// 3: 两个一样，比较顶点高度
// 4: 1 包含 2，如果 2 原点的 x或y 比 1 原点的 x或y 大
// 5: 2 包含 1，如果 1 原点的 x或y 比 2 原点的 x或y 大 （可能跟 4 一样）
// 0: 不相交
function _checkOverlap(obj1, obj2) {
    if (obj1.id == "A" && obj2.id == 'I') {
        console.log('here');
    }
    let rightAlign = obj1.rightX - obj2.rightX;

    if (rightAlign < 0) {
        if (obj1.rightX <= obj2.leftX) return 0;
        if (obj1.leftX < obj2.leftX) return 1;
        return 5;
    } else if (rightAlign > 0) {
        if (obj1.leftX >= obj2.rightX) return 0;
        if (obj1.leftX > obj2.leftX) return 2;
        return 4;
    } else {
        if (obj1.leftX == obj2.leftX) return 3;
        if (obj1.leftX < obj2.leftX) return 4;
        else return 5;
    }
}
// return:
// 1: obj1 在前面
// 0: 没关系
function isAtBack(obj1, obj2) {
    if (obj1.id == "G" && obj2.id == "A") {
        console.log("here");
    }
    const overlap = _checkOverlap(obj1, obj2);
    switch (overlap) {
        case 0: return false;
        case 1: return obj1.rightY < obj2.leftY;
        case 2: return obj1.leftY < obj2.rightY;
        case 3: return obj1.topY < obj2.topY;
        case 4: return obj2.x >= obj1.x + obj1.width || obj2.y >= obj1.y + obj1.height;
        case 5: return !isAtBack(obj2, obj1);
    }
}

function convertToGraph() {
    list.forEach( obj1 => {
        list.forEach(obj2 => {
            if(isAtBack(obj1, obj2)) {
                graph.push([obj1, obj2]);
            }
        })
    });
}

function unittest() {
    let a = displayObject("A", 0, 0, 2, 1);
    let b = displayObject("B", 1, 1, 1, 1);
    let c = displayObject("C", 2, 0, 1, 2);
    let d = displayObject("D", 3, 1, 1, 1);
    let e = displayObject("E", 0, 1, 1, 1);
    let f = displayObject("F", 0, 2, 1, 2);
    let g = displayObject("G", 1, 2, 3, 1);
    let h = displayObject("H", 1, 3, 2, 2);
    let i = displayObject("I", 5, 0, 1, 1);
    let j = displayObject("J", 4, 3, 1, 1);

    let list = [a, b, c, d, e, f, g, h, i, j];
    list.forEach( obj1 => {
        list.forEach(obj2 => {
            let overlap = _checkOverlap(obj1, obj2);
            if (overlap == 4 || overlap == 5) {
                console.log("Overlap", obj1.id, obj2.id, _checkOverlap(obj1, obj2), isAtBack(obj1, obj2));
            }
        })
    })

    // list.forEach( obj1 => {
    //     list.forEach(obj2 => {
    //         console.log(obj1.id, obj2.id, isAtBack(obj1, obj2));
    //     })
    // })
}

function unittest1() {
    let a = displayObject("A", 0, 0, 1, 1);
    let b = displayObject("B", 1, 0, 1, 1);
    let c = displayObject("C", 2, 0, 1, 1);
    let d = displayObject("D", 3, 0, 1, 1);
    let e = displayObject("E", 4, 0, 1, 1);
    let f = displayObject("F", 4, 1, 1, 1);
    let g = displayObject("G", 4, 2, 1, 1);
    let h = displayObject("H", 4, 3, 1, 1);
    let i = displayObject("I", 4, 4, 1, 1);
    let j = displayObject("J", 1, 1, 3, 3);   
    let list = [a, b, c, d, e, f, g, h, i, j];
    list.forEach( obj1 => {
        list.forEach(obj2 => {
            let overlap = _checkOverlap(obj1, obj2);
            if (overlap == 4 || overlap == 5) {
                console.log("Overlap", obj1.id, obj2.id, _checkOverlap(obj1, obj2), isAtBack(obj1, obj2));
            }
        })
    })
}

function test() {
    // addDisplayObject("A", 0, 0, 2, 1);
    // addDisplayObject("B", 1, 1, 1, 1);
    // addDisplayObject("C", 2, 0, 1, 2);
    // addDisplayObject("D", 3, 1, 1, 1);
    // addDisplayObject("E", 0, 1, 1, 1);
    // addDisplayObject("F", 0, 2, 1, 2);
    // addDisplayObject("G", 1, 2, 3, 1);
    // addDisplayObject("H", 1, 3, 2, 2);
    // addDisplayObject("I", 5, 0, 1, 1);
    // addDisplayObject("J", 4, 3, 1, 1);

    addDisplayObject("A", 0, 0, 1, 1);
    addDisplayObject("B", 1, 0, 1, 1);
    addDisplayObject("C", 2, 0, 1, 1);
    addDisplayObject("D", 3, 0, 1, 1);
    addDisplayObject("E", 4, 0, 1, 1);
    addDisplayObject("F", 4, 1, 1, 1);
    addDisplayObject("G", 4, 2, 1, 1);
    addDisplayObject("H", 4, 3, 1, 1);
    addDisplayObject("I", 4, 4, 1, 1);
    addDisplayObject("J", 1, 1, 3, 3); 
    convertToGraph();
    printGraph();
    toposort = require('toposort')
    const result = toposort(graph);
    result.forEach(l => console.log(l.id, ""))
}

function printGraph(){
    for (let edge of graph) {
        console.log(edge[0].id, edge[1].id);
    }
}

// unittest1();
test();
    