const broadTest = (edges1Bounds, edges2Bounds) => {
    //use axis aligned bounding box test
    return !(((edges1Bounds.left > edges2Bounds.right) || (edges2Bounds.left > edges1Bounds.right)) || ((edges1Bounds.top > edges2Bounds.bottom) || (edges2Bounds.top > edges1Bounds.bottom)))
};

const scaleVector = (vector, scalar) => {
    return { x: vector.x * scalar, y: vector.y * scalar };
}

const findAABB = edges => {
    let edgesLeftBound = Infinity;
    let edgesRightBound = -Infinity;
    let edgesTopBound = Infinity;
    let edgesBottomBound = -Infinity;

    edges.forEach(edge => {
        if (edge.start.x < edgesLeftBound) edgesLeftBound = edge.start.x;
        if (edge.start.x > edgesRightBound) edgesRightBound = edge.start.x;
        if (edge.end.x < edgesLeftBound) edgesLeftBound = edge.end.x;
        if (edge.end.x > edgesRightBound) edgesRightBound = edge.end.x;
        if (edge.start.y < edgesTopBound) edgesTopBound = edge.start.y;
        if (edge.start.y > edgesBottomBound) edgesBottomBound = edge.start.y;
        if (edge.end.y < edgesTopBound) edgesTopBound = edge.end.y;
        if (edge.end.y > edgesBottomBound) edgesBottomBound = edge.end.y;
    });

    return { left: edgesLeftBound, right: edgesRightBound, top: edgesTopBound, bottom: edgesBottomBound };
};

const edgesIntersection = (edge1, edge2) => {
    let a = edge1.start;
    let b = edge1.end;
    let c = edge2.start;
    let d = edge2.end;
    let cDiffA = addVectors(c, scaleVector(a, -1));
    let r = addVectors(b, scaleVector(a, -1));
    let s = addVectors(d, scaleVector(c, -1));
    let rCrossS = crossProduct(r, s);
    let t = crossProduct(cDiffA, s) / rCrossS;
    let u = crossProduct(cDiffA, r) / rCrossS;
    if (t <= 1 && t >= 0 && u <= 1 && u >= 0) return addVectors(a, scaleVector(r, t));
};

const addVectors = (vector1, vector2) => {
    return { x: vector1.x + vector2.x, y: vector1.y + vector2.y };
};

const crossProduct = (vector1, vector2) => {
    return vector1.x * vector2.y - vector2.x * vector1.y;
};

module.exports = {
    //edges: { start: { x: 0, y: 0}, end: { x: 0, y: 0 } }
    broadTest,
    scaleVector,
    findAABB,
    edgesIntersection,
    addVectors,
    crossProduct
};