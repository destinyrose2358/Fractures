const Edge = require("./Edge");
const EdgeSet = require("./EdgeSet");
const Vector = require("./Vector");

const raytrace = (edgeSet, viewingPoint, width, height, extraEdgeSet = new edgeSet([])) => {
    //iterate over the edgeSet Points and check for intersection of the viewing point to each point, and the edge set
    points = [];
    let screenEdges = new EdgeSet(
        [
            new Edge(new Vector(0, 0), new Vector(0, height)),
            new Edge(new Vector(0, height), new Vector(width, height)),
            new Edge(new Vector(width, height), new Vector(width, 0)),
            new Edge(new Vector(width, 0), new Vector(0, 0))
        ]
    );
    edgeSet.merge(extraEdgeSet).merge(screenEdges).edges.forEach(edge => {
        let viewRay1 = new Edge(viewingPoint, edge.start);
        let viewRay2 = new Edge(viewingPoint, edge.end);

        points = [...new Set(points.concat(castRay(edgeSet, viewRay1), castRay(edgeSet, viewRay2)))];
    });

    return points.sort((a, b) => {
        return Math.sign(a.theta - b.theta);
    });
};

//generates a list of points based on the viewing ray
const castRay = (edgeSet, viewingRay) => {
    //cast the ray then rotate and cast the ray again, and if theyre within a certain error to the original then dispose of them.
    let points = [findClosest(edgeSet, viewingRay)];
    
    //rotate the viewing ray by small amount left and right
    for (let i = -1; i <= 1; i += 2) {
        let offshoot = viewingRay.rotate(viewingRay.start, i * 0.001);
        let newPoint = findClosest(edgeSet, offshoot);
        if (newPoint.distance(points[0]) >= 1) points.push(newPoint);
    }
    return points;
};

const findClosest = (edgeSet, viewingRay) => {
    let smallestT = Infinity;
    let closest;
    edgeSet.edges.forEach(edge => {
        let {point, t} = viewingRay.intersection(edge);
        if (t < smallestT) {
            smallestT = t;
            closest = point;
        }
    });
    return point;
};