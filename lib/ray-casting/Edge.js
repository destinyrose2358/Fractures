const Vector = require("./Vector");

class Edge {
    constructor(start, end) {
        this.start = start;
        this.end = end;
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
        if (t <= 1 && t >= 0 && u <= 1 && u >= 0) return { point: a.plus(r.scale(t)), t};
    }

    rotate(rotationPoint, theta) {
        return new Edge(this.start.rotate(rotationPoint, theta), this.end.rotate(rotationPoint, theta));
    }
    
}

module.exports = Edge;