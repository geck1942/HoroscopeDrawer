class Planets {
  constructor() {
    const pngImagePath = "./resources/celestialchapters/planets/";

    var planets = [{
      number: 1,
      name: "Sun",
      symbol: "☉",
      imageUrl: pngImagePath + "sun.png",
    }, {
      number: 2,
      name: "Mercury",
      symbol: "☿",
      imageUrl: pngImagePath + "mercury.png",
    }, {
      number: 3,
      name: "Venus",
      symbol: "♀",
      imageUrl: pngImagePath + "venus.png",
    }, {
      number: 4,
      name: "Mars",
      symbol: "♂",
      imageUrl: pngImagePath + "mars.png",
    }, {
      number: 5,
      name: "Moon",
      symbol: "☽",
      imageUrl: pngImagePath + "moon.png",
    }, {
      number: 6,
      name: "Jupiter",
      symbol: "♃",
      imageUrl: pngImagePath + "jupiter.png",
    }, {
      number: 7,
      name: "Saturn",
      symbol: "♄",
      imageUrl: pngImagePath + "saturn.png",
    }, {
      number: 8,
      name: "Uranus",
      symbol: "⛢",
      imageUrl: pngImagePath + "uranus.png",
    }, {
      number: 9,
      name: "Neptune",
      symbol: "♆",
      imageUrl: pngImagePath + "neptune.png",
    }, {
      number: 10,
      name: "Pluto",
      symbol: "♇",
      imageUrl: pngImagePath + "pluto.png",
    }];

    // var canvas = document.getElementById("loader-canvas");
    // planets.forEach(planet => {
    //   console.log("init " + planet.name);
    //   var image = new Image();
    //   canvas.appendChild(planet.image);
    //   image.onload = function(){

    //   }
    //   image.src = planet.imageUrl;
    // });

    return planets;
  }
}
export let planets = new Planets();