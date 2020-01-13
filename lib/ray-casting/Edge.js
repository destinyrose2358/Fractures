const Vector = require("./Vector");

class Edge {
    constructor(start, end) {
        console.log(start, end);
        this.start = start;
        this.end = end;
        this.length = start.distance(end);
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
        console.log("edge", t, u);
        if (t === Infinity || t === -Infinity || u === Infinity || u === -Infinity) return true;
        if (t <= 1 && t >= 0 && u <= 1 && u >= 0) return { point: a.plus(r.scale(t)), t};    
    }

    rotate(rotationPoint, theta) {
        return new Edge(this.start.rotate(rotationPoint, theta), this.end.rotate(rotationPoint, theta));
    }

    project(t = 0) {
        return this.start.plus(this.end.minus(this.start).scale(t));
    }

    RandomSubSegment(length = this.length) {
        let randomT = Math.random() * (length / this.length);
        return new Edge(this.project(randomT), this.project(1 - randomT));
    }
    
}

module.exports = Edge;