/**
 * @Description Todo tipo de scripts
 */

const Coordinate = require("../classes/Coordinate");
const Fleet = require("../classes/Fleet");

async function sendAllShipsToDebris(origin, speed, page, type = "planet") {
  let [galaxy, system, planet] = origin.split(":");
  let destination = new Coordinate(galaxy, system, planet);
  let fleet = new Fleet();
  fleet.setPage(page);
  fleet.setOrigin(origin);
  fleet.setType(type);
  fleet.setDestination(destination.generateCoords());
  fleet.setSpeed(speed);
  fleet.SetAllResources();
  fleet.SetAllShips();
  fleet.setMission("debris");
  return await fleet.sendNow();
}

module.exports = {
  sendAllShipsToDebris,
};
