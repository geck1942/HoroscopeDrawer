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
    this.PLANET_RADIUS_OFFSET = 5;
    this.PLANET_COLLISION_MARGIN_IN_DEGREE = 4;
    this.PLANET_COLLISION_CORRECTION_RADIUS = 4;
    this.MAX_PLANET_COLLISION_CORRECTION = 4;

    this.radius = {
      outer: 49
    };
    if (properties.houses.hasHouses) {
      this.radius.houses_outer = this.radius.outer;
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
    this.radius.planets = this.radius.zodiac_inner;


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
      ]
    };

    this.drawn.planets = this.correctCollidingPlanets(this.drawn.planets);

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
    axis.push(this.drawHouseAxis(0, "house-axis-ascendant-descendant"))
    axis.push(this.drawHouseAxis(this.houses.axes.axis2to8, "house-axis-2-8"))
    axis.push(this.drawHouseAxis(this.houses.axes.axis3to9, "house-axis-3-9"))
    axis.push(this.drawHouseAxis(this.houses.axes.axis4to10, "house-axis-immum-medium"))
    axis.push(this.drawHouseAxis(this.houses.axes.axis5to11, "house-axis-5-11"))
    axis.push(this.drawHouseAxis(this.houses.axes.axis6to12, "house-axis-6-12"))
    axis.push(this.drawHouseAxis(180, "house-axis-ascendant-descendant"))
    axis.push(this.drawHouseAxis(Calc.getOppositeDegree(this.houses.axes.axis2to8), "house-axis-2-8"))
    axis.push(this.drawHouseAxis(Calc.getOppositeDegree(this.houses.axes.axis3to9), "house-axis-3-9"))
    axis.push(this.drawHouseAxis(Calc.getOppositeDegree(this.houses.axes.axis4to10), "house-axis-immum-medium"))
    axis.push(this.drawHouseAxis(Calc.getOppositeDegree(this.houses.axes.axis5to11), "house-axis-5-11"))
    axis.push(this.drawHouseAxis(Calc.getOppositeDegree(this.houses.axes.axis6to12), "house-axis-6-12"))
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
      this.drawHouseNumber("I", 0, this.houses.axes.axis2to8),
      this.drawHouseNumber("II", this.houses.axes.axis2to8, this.houses.axes.axis3to9),
      this.drawHouseNumber("III", this.houses.axes.axis3to9, this.houses.axes.axis4to10),
      this.drawHouseNumber("IV", this.houses.axes.axis4to10, this.houses.axes.axis5to11),
      this.drawHouseNumber("V", this.houses.axes.axis5to11, this.houses.axes.axis6to12),
      this.drawHouseNumber("VI", this.houses.axes.axis6to12, 180),
      this.drawHouseNumber("VII", 180, Calc.getOppositeDegree(this.houses.axes.axis2to8)),
      this.drawHouseNumber("VIII", Calc.getOppositeDegree(this.houses.axes.axis2to8), Calc.getOppositeDegree(this.houses.axes.axis3to9)),
      this.drawHouseNumber("IX", Calc.getOppositeDegree(this.houses.axes.axis3to9), Calc.getOppositeDegree(this.houses.axes.axis4to10)),
      this.drawHouseNumber("X", Calc.getOppositeDegree(this.houses.axes.axis4to10), Calc.getOppositeDegree(this.houses.axes.axis5to11)),
      this.drawHouseNumber("XI", Calc.getOppositeDegree(this.houses.axes.axis5to11), Calc.getOppositeDegree(this.houses.axes.axis6to12)),
      this.drawHouseNumber("XII", Calc.getOppositeDegree(this.houses.axes.axis6to12), 360)
    ];
    return numbers;
  }
  drawHouseNumber(text, start_degree, end_degree) {
    var degree = (start_degree + end_degree) / 2;
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

  drawHouseAxis(axeDegree, className) {
    var points = [
      Calc.getPointOnCircle(this.radius.houses_outer + 2, axeDegree),
      Calc.getPointOnCircle(this.radius.zodiac_inner, axeDegree, 0)
    ]
    var line = this.snap.line(points[0].x, points[0].y, points[1].x, points[1].y);
    line.addClass("house-axis");
    if (className)
      line.addClass(className);
    return line;
  }

  drawPlanet(planet, degree) {
    const linePoint1 = Calc.getPointOnCircle(this.radius.planets, degree);
    const linePoint2 = Calc.getPointOnCircle(this.radius.planets, degree, 1);
    const planetAuxiliaryLine = this.snap.line(linePoint1.x, linePoint1.y, linePoint2.x, linePoint2.y);
    planetAuxiliaryLine.addClass("planet-auxiliary-line")

    const planetBackgroundPosition = Calc.getPointOnCircle(this.radius.planets, degree, this.PLANET_RADIUS_OFFSET);
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
      return a.meta.degree > b.meta.degree;
    });

    let planetsCollideInRow = 0;
    return planets.map((planet, i) => {
      const nextPlanetIndex = i + 1;

      if (nextPlanetIndex in planets) {
        const nextPlanet = planets[nextPlanetIndex];
        if (this.planetsDoCollide(planet.meta.degree, nextPlanet.meta.degree)) {
          if (planetsCollideInRow == this.MAX_PLANET_COLLISION_CORRECTION) {
            planetsCollideInRow = 0;
          }
          planetsCollideInRow++;

          const correctedRadius = this.radius.zodiac_inner - (planetsCollideInRow * this.PLANET_COLLISION_CORRECTION_RADIUS);
          if (correctedRadius <= 0) {
            console.warn("Cannot draw colliding planets when the correction radius is below 0.");
          }

          const correctedBackgroundPosition = Calc.getPointOnCircle(correctedRadius, nextPlanet.meta.degree, this.PLANET_RADIUS_OFFSET);
          const correctedBackgroundPositionForCircle = {
            cx: correctedBackgroundPosition.x,
            cy: correctedBackgroundPosition.y,
          }
          nextPlanet.background.attr(correctedBackgroundPositionForCircle);

          const correctedPlanetSymbolPosition = this.getPlanetSymbolPosition(correctedBackgroundPosition);
          nextPlanet.symbol.attr(correctedPlanetSymbolPosition);


          planets[nextPlanetIndex].symbol = nextPlanet.symbol;
          planets[nextPlanetIndex].background = nextPlanet.background;
        } else {
          planetsCollideInRow = 0;
        }
      }

      return planet;
    });
  }

  planetsDoCollide(currentPlanetDegree, nextPlanetDegree) {
    let lowerBound = currentPlanetDegree - this.PLANET_COLLISION_MARGIN_IN_DEGREE;
    let upperBound = currentPlanetDegree + this.PLANET_COLLISION_MARGIN_IN_DEGREE;

    if (upperBound > 360) {
      upperBound = upperBound - 360;
    } else if (lowerBound < 0) {
      lowerBound = lowerBound + 360;
    }

    return (lowerBound <= nextPlanetDegree && nextPlanetDegree <= upperBound);
  }
}
export let drawer = new Drawer();