
const properties = {
  zodiac: {
    ascendant: {
      sign: 1,      // Sets ascendant by sign. See src/zodiac.js.
      degree: 5    // Sets degree offset for ascendant sign.
    }
  },
  planets: {        // Sets degree of planets.
    sun: 5,
    mercury: 12,
    venus: 151.31,
    mars: 231,
    moon: 188,
    jupiter: 311,
    saturn: 100,
    uranus: 199,
    neptune: 278,
    pluto: 31
  },
  houses: {
    hasHouses: true,
    axes: {
      axis2to8: 27,   // Sets degree of axis.
      axis3to9: 56,
      axis4to10: 81,
      axis5to11: 114,
      axis6to12: 156
    }
  }
};
const h = new zastro.Horoscope(properties);
var drawn = null;
initTools();
draw();

function draw() {
  console.log(properties);
  drawn = h.draw("#horoscope");
  console.log("Hurray! You have drawn your horoscope.", drawn);
}

function initTools() {
  // Ascendant
  var tools_input_asc = document.getElementById("tools_input_asc");
  tools_input_asc.options = [];
  console.log(h.zodiac.signs);
  h.zodiac.signs.forEach(sign => {
    var option_sign = document.createElement("option");
    option_sign.text = sign.name;
    option_sign.value = sign.number;
    tools_input_asc.options.add(option_sign);
  });
  tools_input_asc.onchange = function () {
    properties.zodiac.ascendant.sign = tools_input_asc.value - 0;
    draw();
  };
  // ascendant degree
  var tools_input_ascdeg = document.getElementById("tools_input_ascdeg");
  tools_input_ascdeg.onchange = function () {
    properties.zodiac.ascendant.degree = tools_input_ascdeg.value - 0;
    draw();
  };

}