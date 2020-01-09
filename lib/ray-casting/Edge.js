const Vector = require("./Vector");

class Edge {
    constructor(x1, y1, x2, y2) {
        this.start = new Vector(x1, y1);
        this.end = new Vector(x2, y2);
    }

    intersection(edge) {
        let a = this.start;
        let b = this.end;
        let c = edge.start;
        let d = edge.end;
        let cDiffA = c.minus(a);
        let r = b.minus(a);
        let s = d.minus(c);
        let rCrossS = r.crossProduct(s);
        let t = cDiffA.crossProduct(s) / rCrossS;
        let u = cDiffA.crossProduct(r) / rCrossS;
        if (t <= 1 && t >= 0 && u <= 1 && u >= 0) return a.plus(r.scale(t));
    }
    
}

module.exports = Edge;