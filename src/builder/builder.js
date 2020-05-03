
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
refresh();

function draw() {
  console.log(properties);
  drawn = h.draw("#horoscope");
  console.log("Hurray! You have drawn your horoscope.", drawn);
}
function refresh() {
  properties.zodiac.ascendant.sign = document.getElementById("tools_input_asc").value - 0;
  properties.zodiac.ascendant.degree = document.getElementById("tools_input_ascdeg").value - 0;
  properties.houses.hasHouses = document.getElementById("tools_draw_houses").checked;
  parsePlanets(document.getElementById("tools_planets").value);
  draw();
}

function initTools() {
  // houses 
  document.getElementById("tools_draw_houses").onchange = refresh;
  document.getElementById("tools_input_asc").onchange = refresh;
  document.getElementById("tools_input_ascdeg").onchange = refresh;
  document.getElementById("tools_planets").onkeyup = refresh;
  document.getElementById("tools_planets").onchange = refresh;

  // sign list
  var tools_input_asc = document.getElementById("tools_input_asc");
  h.zodiac.signs.forEach(sign => {
    var option_sign = document.createElement("option");
    option_sign.text = sign.name;
    option_sign.value = sign.number;
    tools_input_asc.options.add(option_sign);
  });
  tools_input_asc.onchange = function () {
    refresh();
  };

}

function parsePlanets(text) {
  var reg_planetposition = new RegExp(/([\w]+)\s*([\d]+)°([\d]+)'\s*Я?\s*([\w]+)(\n|$)/ig);
  var matches = text.match(reg_planetposition);
  properties.planets = {};
  matches.forEach(match => {
    var planet = h.planets.find((elem) => {
      return elem.name == match.replace(reg_planetposition, "$1");
    });
    var sign = h.zodiac.signs.find((elem) => {
      return elem.name == match.replace(reg_planetposition, "$4");
    });
    if (planet && sign) {

      var signdegrees = (sign.number - properties.zodiac.ascendant.sign) * 30 - properties.zodiac.ascendant.degree;
      if (signdegrees < 0) signdegrees += 360;
      var degrees = match.replace(reg_planetposition, "$2") - 0;
      var minutes = match.replace(reg_planetposition, "$3") - 0;
      properties.planets[planet.name.toLowerCase()] = degrees + (minutes / 60) + signdegrees;
    }
  });
}