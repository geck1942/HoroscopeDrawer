import Snap from "snapsvg/dist/snap.svg-min";
import { Calc } from "./calc";
import { zodiac } from "./zodiac";
import { planets } from "./planets";

export class Drawer {
  draw(properties) {
    if (properties.hasOwnProperty('selector')) {
      this.selector = properties.selector;
    } else {
      throw new Error('Irregular selector');
    }

    this.PLANET_IMAGE_WIDTH = 8;
    this.PLANET_IMAGE_HEIGHT = 8;
    this.PLANET_COLLISION_MARGIN_IN_DEGREE = this.PLANET_IMAGE_HEIGHT * Math.PI / 4;
    this.PLANET_COLLISION_CORRECTION_RADIUS = 5;
    this.MAX_PLANET_COLLISION_CORRECTION = 10;

    this.radius = {
      outer: 49.5
    };
    if (properties.houses.hasHouses) {
      this.radius.houses_outertick = this.radius.outer;
      this.radius.houses_outer = this.radius.houses_outertick - 4;
      this.radius.houses_inner = this.radius.houses_outer - 4;
      this.radius.houses_center = (this.radius.houses_outer + this.radius.houses_inner) / 2;
      this.radius.zodiac_outer = this.radius.houses_inner;
    }
    else {
      this.radius.zodiac_outer = this.radius.outer;
    }
    this.radius.zodiac_inner = this.radius.zodiac_outer - 6;
    this.radius.zodiac_innertick = this.radius.zodiac_inner - 3;
    this.radius.zodiac_innertick5 = this.radius.zodiac_inner - 4.5;
    this.radius.zodiac_innertick10 = this.radius.zodiac_inner - 6;
    this.radius.zodiac_center = (this.radius.zodiac_outer + this.radius.zodiac_inner) / 2;
    this.radius.planets = this.radius.zodiac_inner - 5;


    this.planets = (properties.hasOwnProperty('planets')) ? properties.planets : null;
    this.houses = (properties.hasOwnProperty('houses')) ? properties.houses : null;

    this.snap = Snap(this.selector);
    this.snap.attr({ viewBox: "-50 -50 100 100" });
    this.snap.clear();

    this.drawn = {
      circles: this.drawZodiacCircles(),
      degrees: this.drawZodiacDegrees(),
      zodiac: {
        signs: this.drawZodiacSigns(properties.zodiac.ascendant.sign, properties.zodiac.ascendant.degree),
        ascendant: {
          signIndex: properties.zodiac.ascendant.sign,
          correctedByDegrees: properties.zodiac.ascendant.degree,
        }
      },
      houses: {
        circles: this.drawHousesCircles(),
        numbers: this.drawHousesNumbers(),
        axes: this.drawHouses(),
        meta: this.houses
      },
      planets: [
        this.drawSun(),
        this.drawMercury(),
        this.drawVenus(),
        this.drawMars(),
        this.drawMoon(),
        this.drawJupiter(),
        this.drawSaturn(),
        this.drawUranus(),
        this.drawNeptune(),
        this.drawPluto()
      ],
      snap: this.snap
    };

    this.correctCollidingPlanets(this.drawn.planets);

    return this.drawn;
  }

  describeArc(radius, startDegree, endDegree) {
    const end = Calc.getPointOnCircle(radius, startDegree);
    const largeArcFlag = endDegree - startDegree <= 180 ? "0" : "1";

    const d = [
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;
  }

  drawZodiacCircles() {
    const circles = {
      outer: this.snap.circle(0, 0, this.radius.zodiac_outer),
      inner: this.snap.circle(0, 0, this.radius.zodiac_inner),
      innerAuxiliary: this.snap.circle(0, 0, this.radius.zodiac_innertick)
    }

    circles.outer.addClass("zodiac-circle-outer");
    circles.inner.addClass("zodiac-circle-inner");
    circles.innerAuxiliary.addClass("zodiac-circle-inner-auxiliary");

    return circles;
  }

  drawZodiacDegrees() {
    const degrees = [];

    for (let degree = 0; degree < 360; degree++) {

      const point1 = Calc.getPointOnCircle(this.radius.zodiac_inner, degree);
      const point2 = Calc.getPointOnCircle(degree % 10 == 0 ? this.radius.zodiac_innertick10 : degree % 5 == 0 ? this.radius.zodiac_innertick5 : this.radius.zodiac_innertick, degree);

      const zodiacDegree = this.snap.line(point1.x, point1.y, point2.x, point2.y);
      zodiacDegree.attr({
        index: degree
      });
      zodiacDegree.addClass("zodiac-degree");
      zodiacDegree.addClass("zodiac-degree-" + degree);

      degrees.push({
        meta: {
          degree,
          point1,
          point2
        },
        zodiacDegree
      });
    }

    return degrees;
  }

  drawZodiacSigns(startSign, signDegree) {
    const zodiacSignImageWidth = 6;
    const zodiacSignImageHeight = 6;

    const signs = [];

    const ascendantDegreeCorrection = zodiac.validateSignDegree(signDegree);
    const startSignIndex = zodiac.getStartSignIndex(startSign);

    for (let sign = 0; sign <= 11; sign++) {
      let signIndex = null;
      const regularIndex = startSignIndex + sign;
      const isIndexOutOfBound = (regularIndex > 11);
      if (isIndexOutOfBound) {
        signIndex = regularIndex - 12;
      } else {
        signIndex = regularIndex;
      }
      const signObj = zodiac.signs[signIndex];

      const degree = sign * 30 - ascendantDegreeCorrection;
      const degreeBetweenSigns = degree + 15;
      const degreePreviousSign = degree - 30;
      const degreeNextSign = degree + 30;

      const topLeftPoint = Calc.getPointOnCircle(this.radius.zodiac_outer, degree);
      const topRightPoint = Calc.getPointOnCircle(this.radius.zodiac_inner, degree);
      const rightArcDescription = this.describeArc(this.radius.zodiac_inner, degreeNextSign, degree);
      const bottomLeftPoint = Calc.getPointOnCircle(this.radius.zodiac_outer, degreeNextSign);
      const leftArcDescription = this.describeArc(this.radius.zodiac_outer, degreeNextSign, degree);

      const zodiacSignBackground = this.snap.path([
        "M", topLeftPoint.x, topLeftPoint.y,
        "L", topRightPoint.x, topRightPoint.y,
        rightArcDescription,
        "L", bottomLeftPoint.x, bottomLeftPoint.y,
        "M", topLeftPoint.x, topLeftPoint.y,
        leftArcDescription,
        "M", topLeftPoint.x, topLeftPoint.y,
        "Z"
      ].join(" "));

      const signElementClass = "zodiac-sign-element-" + signObj.element;
      const signNameClass = "zodiac-sign-" + signObj.name.toLowerCase();
      zodiacSignBackground.addClass("zodiac-sign");
      zodiacSignBackground.addClass(signElementClass);
      zodiacSignBackground.addClass(signNameClass);

      const zodiacSignPosition = Calc.getPointOnCircle(this.radius.zodiac_center, degreeBetweenSigns)
      const zodiacSignImagePositionX = zodiacSignPosition.x - zodiacSignImageWidth / 2;
      const zodiacSignImagePositionY = zodiacSignPosition.y - zodiacSignImageHeight / 2;
      const zodiacSignSymbol = this.snap.image(signObj.imageUrl, zodiacSignImagePositionX, zodiacSignImagePositionY, zodiacSignImageWidth, zodiacSignImageHeight);

      const meta = {};
      Object.assign(meta, signObj);
      meta['degree'] = {
        self: degree,
        nextSign: degreeNextSign,
        previousSign: degreePreviousSign
      };
      meta['position'] = zodiacSignPosition;

      signs.push({
        meta,
        symbol: zodiacSignSymbol,
        background: zodiacSignBackground
      });
    }
    return signs;
  }

  drawHouses() {
    const axis = [];
    if (!this.houses.hasHouses) return null;
    axis.push(this.drawHouseAxis("house-axis-ascendant-descendant", 0))
    axis.push(this.drawHouseAxis("house-axis-2-8", 1))
    axis.push(this.drawHouseAxis("house-axis-3-9", 2))
    axis.push(this.drawHouseAxis("house-axis-immum-medium", 3))
    axis.push(this.drawHouseAxis("house-axis-5-11", 4))
    axis.push(this.drawHouseAxis("house-axis-6-12", 5))
    axis.push(this.drawHouseAxis("house-axis-ascendant-descendant", 6))
    axis.push(this.drawHouseAxis("house-axis-2-8", 7))
    axis.push(this.drawHouseAxis("house-axis-3-9", 8))
    axis.push(this.drawHouseAxis("house-axis-immum-medium", 9))
    axis.push(this.drawHouseAxis("house-axis-5-11", 10))
    axis.push(this.drawHouseAxis("house-axis-6-12", 11))

    var asc_point = Calc.getPointOnCircle(this.radius.houses_outer, 0);
    this.snap.image("./resources/celestialchapters/planets/asc.png", asc_point.x - this.PLANET_IMAGE_WIDTH / 2, asc_point.y - this.PLANET_IMAGE_HEIGHT / 2, this.PLANET_IMAGE_WIDTH, this.PLANET_IMAGE_HEIGHT);

    return axis;
  }
  drawHousesCircles() {
    if (!this.houses.hasHouses) return null;
    const circles = {
      outer: this.snap.circle(0, 0, this.radius.houses_outer)
    }

    circles.outer.addClass("houses-circle-outer");
    return circles;
  }
  drawHousesNumbers() {
    if (!this.houses.hasHouses) return null;
    var numbers = [
      this.drawHouseNumber("I", 0),
      this.drawHouseNumber("II", 1),
      this.drawHouseNumber("III", 2),
      this.drawHouseNumber("IV", 3),
      this.drawHouseNumber("V", 4),
      this.drawHouseNumber("VI", 5),
      this.drawHouseNumber("VII", 6),
      this.drawHouseNumber("VIII", 7),
      this.drawHouseNumber("IX", 8),
      this.drawHouseNumber("X", 9),
      this.drawHouseNumber("XI", 10),
      this.drawHouseNumber("XII", 11)
    ];
    return numbers;
  }
  drawHouseNumber(text, index) {
    var start = properties.houses.axes[index];
    var end = properties.houses.axes[index == 11 ? 0 : index + 1];
    var degree = ((start + end) / 2) + (end < start ? 180 : 0);
    var point = Calc.getPointOnCircle(this.radius.houses_center, degree, 0);
    var number = this.snap.text(point.x, point.y, text);
    number.addClass("house-number");
    number.attr({
      //transform: "rotate(" + (-degree - 90) + "deg)",
      dominantBaseline: "middle",
      textAnchor: "middle"
    });
    return number;
  }

  drawHouseAxis(className, index) {
    var axeDegree = properties.houses.axes[index];
    var points = [
      Calc.getPointOnCircle(this.radius.houses_outertick, axeDegree),
      Calc.getPointOnCircle(this.radius.houses_inner, axeDegree, 0),
      Calc.getPointOnCircle(this.radius.houses_outertick, axeDegree - 1),
      Calc.getPointOnCircle(this.radius.houses_outertick, axeDegree + 1)
    ]
    var line = this.snap.line(points[0].x, points[0].y, points[1].x, points[1].y);
    line.addClass("house-axis");
    var tick = this.snap.line(points[2].x, points[2].y, points[3].x, points[3].y);
    tick.addClass("house-axis");
    if (className)
      line.addClass(className);
    return line;
  }

  drawPlanet(planet, degree) {
    if (!planet || degree == null)
      return;
    const linePoint1 = Calc.getPointOnCircle(this.radius.zodiac_inner, degree);
    const linePoint2 = Calc.getPointOnCircle(this.radius.planets, degree);
    const planetAuxiliaryLine = this.snap.line(linePoint1.x, linePoint1.y, linePoint2.x, linePoint2.y);
    planetAuxiliaryLine.addClass("planet-auxiliary-line")

    const planetBackgroundPosition = Calc.getPointOnCircle(this.radius.planets, degree);
    const planetBackgroundRadius = this.getPlanetBackgroundRadius();
    const planetBackground = this.snap.circle(planetBackgroundPosition.x, planetBackgroundPosition.y, planetBackgroundRadius);
    planetBackground.addClass("planet-background");

    const planetSymbolPosition = this.getPlanetSymbolPosition(planetBackgroundPosition);
    const planetSymbol = this.snap.image(planet.imageUrl, planetSymbolPosition.x, planetSymbolPosition.y, this.PLANET_IMAGE_WIDTH, this.PLANET_IMAGE_HEIGHT);

    const meta = {};
    Object.assign(meta, planet);
    meta['degree'] = degree;
    meta['position'] = planetBackgroundPosition;

    return {
      symbol: planetSymbol,
      background: planetBackground,
      tick: planetAuxiliaryLine,
      meta
    };
  }

  getPlanetSymbolPosition(planetBackgroundPosition) {
    const x = planetBackgroundPosition.x - this.PLANET_IMAGE_WIDTH / 2;
    const y = planetBackgroundPosition.y - this.PLANET_IMAGE_HEIGHT / 2;
    return {
      x,
      y
    }
  }

  getPlanetBackgroundRadius() {
    if (this.PLANET_IMAGE_WIDTH > this.PLANET_IMAGE_HEIGHT) {
      return this.PLANET_IMAGE_WIDTH / 2;
    } else {
      return this.PLANET_IMAGE_HEIGHT / 2;
    }
  }

  drawSun() {
    return this.drawPlanet(planets.find((elem) => {
      return elem.name == "Sun";
    }), this.planets.sun);
  }

  drawMercury() {
    return this.drawPlanet(planets.find((elem) => {
      return elem.name == "Mercury";
    }), this.planets.mercury);
  }

  drawVenus() {
    return this.drawPlanet(planets.find((elem) => {
      return elem.name == "Venus";
    }), this.planets.venus);
  }

  drawMars() {
    return this.drawPlanet(planets.find((elem) => {
      return elem.name == "Mars";
    }), this.planets.mars);
  }

  drawMoon() {
    return this.drawPlanet(planets.find((elem) => {
      return elem.name == "Moon";
    }), this.planets.moon);
  }

  drawJupiter() {
    return this.drawPlanet(planets.find((elem) => {
      return elem.name == "Jupiter";
    }), this.planets.jupiter);
  }

  drawSaturn() {
    return this.drawPlanet(planets.find((elem) => {
      return elem.name == "Saturn";
    }), this.planets.saturn);
  }

  drawUranus() {
    return this.drawPlanet(planets.find((elem) => {
      return elem.name == "Uranus";
    }), this.planets.uranus);
  }

  drawNeptune() {
    return this.drawPlanet(planets.find((elem) => {
      return elem.name == "Neptune";
    }), this.planets.neptune);
  }

  drawPluto() {
    return this.drawPlanet(planets.find((elem) => {
      return elem.name == "Pluto";
    }), this.planets.pluto);
  }

  correctCollidingPlanets(planets) {
    planets = planets.sort((a, b) => {
      return a.meta.degree > b.meta.degree ? 1 :
        a.meta.degree < b.meta.degree ? -1 : 0
    });

    for (var planetIndex = 0; planetIndex < planets.length; planetIndex++) {
      var planet = planets[planetIndex];
      var previousPlanetIndex = planetIndex - 1;
      while (planets[previousPlanetIndex] == null && previousPlanetIndex != planetIndex) {
        previousPlanetIndex--;
        if (previousPlanetIndex < 0)
          previousPlanetIndex = planets.length - 1;
      }
      if (planet == null || previousPlanetIndex == planetIndex)
        continue;
      var previousPlanet = planets[previousPlanetIndex];
      var offset = 0;
      while (this.planetsDoCollide(previousPlanet, planet, offset) && offset < this.MAX_PLANET_COLLISION_CORRECTION)
        offset += 3;
      var newPlanetPosition = Calc.getPointOnCircle(this.radius.planets - offset, planet.meta.degree);
      planet.symbol.attr(this.getPlanetSymbolPosition(newPlanetPosition));
      planet.tick.attr({
        x2: newPlanetPosition.x,
        y2: newPlanetPosition.y
      });
      planet.meta['position'] = newPlanetPosition;
    }
  }

  planetsDoCollide(previousPlanet, planet, tryWithOffset) {
    //console.log("comparing " + currentPlanetDegree + " & " + nextPlanetDegree);
    var xy2 = Calc.getPointOnCircle(this.radius.planets - tryWithOffset, planet.meta.degree);
    var x1 = previousPlanet.meta.position.x; // * this.snap.node.clientWidth / 100;
    var x2 = xy2.x; // * this.snap.node.clientWidth / 100;
    var y1 = previousPlanet.meta.position.y; // * this.snap.node.clientHeight / 100;
    var y2 = xy2.y; // * this.snap.node.clientHeight / 100;
    var distSq = ((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2));
    var radSumSq = this.PLANET_COLLISION_MARGIN_IN_DEGREE * this.PLANET_COLLISION_MARGIN_IN_DEGREE;
    //console.log("comparing " + distSq + " x " + radSumSq);
    return distSq < radSumSq;
  }
}
export let drawer = new Drawer();