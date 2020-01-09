class EdgeSet {
    constructor(edges) {
        this.edges = edges;
    }

    broadCollisionTest(edgeSet) {
        //use axis aligned bounding box test
        return !(((this.bounds().left > edgeSet.bounds().right) || (edgeSet.bounds().left > this.bounds().right)) || ((this.bounds().top > edgeSet.bounds().bottom) || (edgeSet.bounds().top > this.bounds().bottom)))
    };
    
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
}

module.exports = EdgeSet;