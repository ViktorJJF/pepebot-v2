const schedule = require("node-schedule");
const { Random, timeout } = require("../utils/utils.js");
const beginFleetSave = require("./fleetSave.js");
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(0, 6)];
rule.hour = 0;
rule.minute = Random(1, 5);
// rule.minute = 1;

let beginDailyFleetSave = bots => {
  var j = schedule.scheduleJob(rule, async () => {
    console.log("activando fleetSave diario");
    for (const bot of bots) {
      console.log("enviare el fleet para: ", bot.ogameEmail);
      await beginFleetSave(bot, "0min", "5h");
      console.log("se culmino el fleet save para: ", bot.ogameEmail);
      await timeout(Random(2 * 60 * 1000, 4 * 60 * 1000));
    }
    rule.minute = Random(1, 10);
  });
};

module.exports = beginDailyFleetSave;
