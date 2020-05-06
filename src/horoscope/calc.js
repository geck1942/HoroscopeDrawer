export class Calc {

  /**
   * Calculates a point on a zodiac circle.
   * http://www.onlinemathe.de/forum/Kreis-Punkte-auf-der-Linie-Berechnen
   * https://upload.wikimedia.org/wikipedia/commons/8/82/Sinus_en_cosinus.png
   *
   * @param radius The radius of the circle.
   * @param degree of the poit on the circle.
   * @param offsetFromRadius
   * @param traditionalDirection Calculate point starting (degree = 0) from ascendent and moving counter-clockwise. Defaults to true.
   * If set to false, the calculation starts from descendent and moves counter-clockwise.
   * @returns {{x: *, y: *}}
   */
  static getPointOnCircle(radius, degree, offsetFromRadius, traditionalDirection = true) {
    if (typeof radius === 'undefined' || typeof degree === 'undefined') {
      throw new Error("Degree and radius parameters required!");
    }

    degree = this.convertDegreeMinutesSecondsToFloat(degree);

    const degreeNormalized = degree * (Math.PI / 180.0);

    // Fixes JS bug of Math.sin(Math.PI) (or Math.cos(Math.PI)) not returning correct values on 0, 90, 180, 270, 360
    // degrees. See http://stackoverflow.com/q/6223616/3757139
    let xNormalized = null;
    if (this.isEachDegree(90, degree) && !this.isEachDegree(180, degree)) {
      xNormalized = 0;
    } else if (this.isEachDegree(180, degree) && !this.isEachDegree(360, degree)) {
      xNormalized = -1;
    } else if (this.isEachDegree(360, degree)) {
      xNormalized = 1;
    } else {
      xNormalized = Math.cos(degreeNormalized);
    }

    let yNormalized = null;
    if (this.isEachDegree(90, degree) && !this.isEachDegree(180, degree) && !this.isEachDegree(270, degree)) {
      yNormalized = 1;
    } else if (this.isEachDegree(180, degree) && !this.isEachDegree(270)) {
      yNormalized = 0;
    } else if (this.isEachDegree(270, degree)) {
      yNormalized = -1;
    } else {
      yNormalized = Math.sin(degreeNormalized);
    }

    let x = null;
    let y = null;
    const ySvgInverse = true;

    if (offsetFromRadius) {
      x = (radius - offsetFromRadius) * xNormalized;
      y = (radius - offsetFromRadius) * yNormalized;
    } else {
      x = radius * xNormalized;
      y = radius * yNormalized;
    }

    if (ySvgInverse) {
      y = -y;
    }

    if (traditionalDirection) {
      x = -x;
      y = -y;
    }
    // realx = snap.node.clientWidth / 2 + (x * snap.node.clientWidth / 100);
    // realy = snap.node.clientHeight / 2 + (y * snap.node.clientHeight / 100);
    return { x, y };
  }

  static getOppositeDegree(degree) {
    if (degree < 180) {
      return degree + 180;
    } else {
      return degree - 180;
    }
  }

  static convertDegreeMinutesSecondsToFloat(degreeObj) {
    if (typeof degreeObj !== 'object') {
      return degreeObj;
    }

    let degree = null;
    let degreeMinutes = null;
    let degreeSeconds = null;

    if (degreeObj.hasOwnProperty('degree')) {
      degree = degreeObj.degree;
    } else {
      throw new Error("No degree property on degree-object.");
    }
    if (degree < 0 || degree > 360) {
      throw new Error("Degree must be between 0 and 360.");
    }

    degreeMinutes = (degreeObj.hasOwnProperty('minutes')) ? degreeObj.minutes : null;
    degreeSeconds = (degreeObj.hasOwnProperty('seconds')) ? degreeObj.seconds : null;
    if (0 <= degreeMinutes && degreeMinutes <= 60) {
      degreeMinutes = degreeMinutes * 1 / 60;
    }
    if (0 <= degreeSeconds && degreeSeconds <= 60) {
      degreeSeconds = degreeSeconds * 1 / 60 ^ 2;
    }

    return degree + degreeMinutes + degreeSeconds;
  }

  static getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  static isEachDegree(interval, degree) {
    return degree % interval == 0 && degree > 0;
  }
}