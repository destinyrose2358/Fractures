const Edge = require("./Edge");

class EdgeSet {
    constructor(edges) {
        this.edges = edges;
    }

    broadCollisionTest(edgeSet) {
        //use axis aligned bounding box test
        return !(((this.bounds().left > edgeSet.bounds().right) || (edgeSet.bounds().left > this.bounds().right)) || ((this.bounds().top > edgeSet.bounds().bottom) || (edgeSet.bounds().top > this.bounds().bottom)))
    };

    merge(edgeSet) {
        return new EdgeSet(this.edges.concat(edgeSet.edges));
    }

    randomEdge(minLength = 0) {
        let edges = this.edges.filter(edge => edge.length >= minLength);
        return edges[Math.floor(Math.random() * edges.length)];
    }

    //this function is returning false when it shouldnt
    inBounds(edgeSet) {
        //check if point is in aabb, if not then return false
        if (!this.broadCollisionTest(edgeSet)) {
            return false;
        } else {
            //else check if point is to the right of an odd amount of edges and if not return false
            if (this.isColliding(edgeSet) || edgeSet.vertices().some(vector => !this.inBoundsVector(vector))) return false;
        }
        return true;    
    }

    inBoundsVector(vector) {
        let bounds = this.bounds();
        let testEdge = new Edge(vector, new Vector(bounds.right, vector.y));
        let intersections = 0;
        this.edges.forEach(edge => {
            if (!!testEdge.intersection(edge)) intersections++;
        });
        return intersections % 2 === 1;
    }

    vertices() {
        let vertices = [];
        this.edges.forEach(edge => vertices.push(edge.start));
        // vertices.push(this.edges[this.edges.length - 1].end);
        return vertices;
    }
    
    bounds() {
        if (!this.bound) {
            let edgesLeftBound = Infinity;
            let edgesRightBound = -Infinity;
            let edgesTopBound = Infinity;
            let edgesBottomBound = -Infinity;
        
            this.edges.forEach(edge => {
                if (edge.start.x < edgesLeftBound) edgesLeftBound = edge.start.x;
                if (edge.start.x > edgesRightBound) edgesRightBound = edge.start.x;
                if (edge.end.x < edgesLeftBound) edgesLeftBound = edge.end.x;
                if (edge.end.x > edgesRightBound) edgesRightBound = edge.end.x;
                if (edge.start.y < edgesTopBound) edgesTopBound = edge.start.y;
                if (edge.start.y > edgesBottomBound) edgesBottomBound = edge.start.y;
                if (edge.end.y < edgesTopBound) edgesTopBound = edge.end.y;
                if (edge.end.y > edgesBottomBound) edgesBottomBound = edge.end.y;
            });
        
            this.bound =  { left: edgesLeftBound, right: edgesRightBound, top: edgesTopBound, bottom: edgesBottomBound };
        }
        return this.bound;
    };
    
    isColliding(edgeSet) {
        for (let i = 0; i < this.edges.length; i++) {
            for (let j = 0; j < edgeSet.edges.length; j++) {
                if (!!this.edges[i].intersection(edgeSet.edges[j])) return true;
            }
        }
        return false;
    }

    rotate(rotationPoint = new Vector(0, 0), theta) {
        return new EdgeSet(this.edges.map(edge => edge.rotate(rotationPoint, theta)));
    }

    translate(vector) {
        return new EdgeSet(this.edges.map(edge => edge.translate(vector)));
    }
}

module.exports = EdgeSet;