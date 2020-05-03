
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
  //console.log("Hurray! You have drawn your horoscope.", drawn);
}
function refresh() {
  parseAsc(document.getElementById("tools_planets").value);
  parsePlanets(document.getElementById("tools_planets").value);
  properties.houses.hasHouses = parseHouses(document.getElementById("tools_houses").value)
  draw();
}

function initTools() {
  // houses 
  document.getElementById("tools_planets").onkeyup =
    document.getElementById("tools_planets").onchange = refresh;
  document.getElementById("tools_houses").onkeyup =
    document.getElementById("tools_houses").onchange = refresh;

  // // sign list
  // var tools_input_asc = document.getElementById("tools_input_asc");
  // h.zodiac.signs.forEach(sign => {
  //   var option_sign = document.createElement("option");
  //   option_sign.text = sign.name;
  //   option_sign.value = sign.number;
  //   tools_input_asc.options.add(option_sign);
  // });
  // tools_input_asc.onchange = function () {
  //   refresh();
  // };

}

function parseHouses(text) {
  var reg_houseposition = new RegExp(/House\s?([\d]+)\s+([\d]+)°([\d]+)'\s*([\w]+)(\n|$)/ig);
  var matches = text.match(reg_houseposition);
  properties.houses.axes = [];
  if (!matches)
    return false;
  matches.forEach(match => {
    var house = match.replace(reg_houseposition, "$1") - 0;
    var sign = h.zodiac.signs.find((elem) => {
      return elem.name == match.replace(reg_houseposition, "$4");
    });
    if (sign) {
      var basedegrees = (sign.number - properties.zodiac.ascendant.sign) * 30 - properties.zodiac.ascendant.degree;
      if (basedegrees < 0) basedegrees += 360;
      else if (basedegrees >= 360) basedegrees -= 360;
      var degrees = match.replace(reg_houseposition, "$2") - 0;
      var minutes = match.replace(reg_houseposition, "$3") - 0;
      properties.houses.axes.push((degrees + (minutes / 60) + basedegrees) % 360);
    }
  });
  return true;
}

function parseAsc(text) {
  var reg_ascposition = new RegExp(/AS\s*([\d]+)°([\d]+)'\s*Я?\s*([\w]+)(\n|$)/);
  var matches = text.match(reg_ascposition);
  if (!matches || matches.length == 0)
    return false;
  var sign = h.zodiac.signs.find((elem) => {
    return elem.name == matches[0].replace(reg_ascposition, "$3");
  });
  if (!sign)
    return false;
  properties.zodiac.ascendant.sign = sign.number;
  var degrees = matches[0].replace(reg_ascposition, "$1") - 0;
  var minutes = matches[0].replace(reg_ascposition, "$2") - 0;
  properties.zodiac.ascendant.degree = degrees + (minutes / 60);
  return true;
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

      var basedegrees = (sign.number - properties.zodiac.ascendant.sign) * 30 - properties.zodiac.ascendant.degree;
      if (basedegrees < 0) basedegrees += 360;
      else if (basedegrees >= 360) basedegrees -= 360;
      var degrees = match.replace(reg_planetposition, "$2") - 0;
      var minutes = match.replace(reg_planetposition, "$3") - 0;
      properties.planets[planet.name.toLowerCase()] = (degrees + (minutes / 60) + basedegrees) % 360;
    }
  });
}