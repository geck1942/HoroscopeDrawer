import { elements } from "./elements";

export class Zodiac {
  constructor() {
    this.pngImagePath = "./resources/celestialchapters/signs/";
    this.radius = {
      outer: 50,
      inner: 43,
      get innerAuxiliary() {
        return this.inner + 0.5;
      },
      get betweenOuterInner() {
        return this.outer - ((this.outer - this.inner) / 2);
      }
    };
    this.signs = [{
      number: 0,
      name: "Aries",
      symbol: "♈",
      imageUrl: this.pngImagePath + "aries.png",
      element: "fire"
    }, {
      number: 1,
      name: "Taurus",
      symbol: "♉",
      imageUrl: this.pngImagePath + "taurus.png",
      element: "earth"
    }, {
      number: 2,
      name: "Gemini",
      symbol: "♊",
      imageUrl: this.pngImagePath + "gemini.png",
      element: "wind"
    }, {
      number: 3,
      name: "Cancer",
      symbol: "♋",
      imageUrl: this.pngImagePath + "cancer.png",
      element: "water"
    }, {
      number: 4,
      name: "Leo",
      symbol: "♌",
      imageUrl: this.pngImagePath + "leo.png",
      element: "fire"
    }, {
      number: 5,
      name: "Virgo",
      symbol: "♍",
      imageUrl: this.pngImagePath + "virgo.png",
      element: "earth"
    }, {
      number: 6,
      name: "Libra",
      symbol: "♎",
      imageUrl: this.pngImagePath + "libra.png",
      element: "wind"
    }, {
      number: 7,
      name: "Scorpio",
      symbol: "♏",
      imageUrl: this.pngImagePath + "scorpio.png",
      element: "water"
    }, {
      number: 8,
      name: "Sagittarius",
      symbol: "♐",
      imageUrl: this.pngImagePath + "sagittarius.png",
      element: "fire"
    }, {
      number: 9,
      name: "Capricorn",
      symbol: "♑",
      imageUrl: this.pngImagePath + "capricorn.png",
      element: "earth"
    }, {
      number: 10,
      name: "Aquarius",
      symbol: "♒",
      imageUrl: this.pngImagePath + "aquarius.png",
      element: "wind"
    }, {
      number: 11,
      name: "Pisces",
      symbol: "♓",
      imageUrl: this.pngImagePath + "pisces.png",
      element: "water"
    }];

    return {
      radius: this.radius,
      signs: this.signs,
      getStartSignIndex: this.getStartSignIndex,
      validateSignDegree: this.validateSignDegree
    };
  }

  getStartSignIndex(sign) {
    if (!sign) {
      return 0;
    }

    let index = 0;
    if (typeof sign === "number") {
      if (!Number.isInteger(sign)) {
        throw new TypeError("Sign start sign as a number must be of type integer.");
      }
      if (sign < 0 || sign > 11) {
        throw new RangeError("Zodiac start sign index must be in the range between 0 and 11.");
      }

      index = this.signs.findIndex((elem) => {
        return elem.number === sign;
      });
    } else if (typeof sign === "string") {
      sign = sign.charAt(0).toUpperCase() + sign.slice(1);
      index = this.signs.findIndex((elem) => {
        return elem.name === sign;
      });
      if (index === -1) {
        index = 0;
      }
    }
    return index;
  }

  validateSignDegree(degree) {
    if (!degree) {
      return 0;
    }
    if (typeof degree !== "number") {
      throw new TypeError("Parameter must be of type number.");
    }
    if (degree < 0 || degree > 30) {
      throw new RangeError("Zodiac degree must be in the range between 0 and 30.");
    }
    return degree;
  }
}
export let zodiac = new Zodiac();