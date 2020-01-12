class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.theta = Math.atan2(y, x);
    }

    plus(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    minus(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    scale(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    crossProduct(vector) {
        return this.x * vector.y - vector.x * this.y;
    };

    distance(vector) {
        return Math.sqrt((this.x - vector.x) ** 2 + (this.y - vector.y) ** 2);
    }

    rotate(rotationPoint = new Vector(0,0), theta) {
        return new Vector(Math.cos(theta) * (this.x - rotationPoint.x) 
            - Math.sin(theta) * (this.y-rotationPoint.y) + rotationPoint.x,
            Math.sin(theta) * (this.x - rotationPoint.x)
            + Math.cos(theta) * (this.y - rotationPoint.y) + rotationPoint.y)
    }

    mirror(center = new Vector(0, 0), reflectionVector = new Vector(1, 0)) {
        let translatedMirrorPoint = this.minus(center);
        let translatedVector = reflectionVector.minus(center);
        let scalar = 2 * (translatedMirrorPoint.dotProduct(translatedVector) / translatedVector.dotProduct(translatedVector));
        return translatedVector.scale(scalar).minus(translatedMirrorPoint).plus(center);
    }

    dotProduct(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    Random() {
        return new Vector(Math.floor(Math.random() * 30) * 16, Math.floor(Math.random() * 30) * 16)
    }
}

module.exports = Vector;