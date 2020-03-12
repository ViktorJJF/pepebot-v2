let speeds = [
  "7:05:15",
  "3:32:40",
  "2:21:48",
  "1:46:23",
  "1:25:07",
  "1:10:57",
  "1:00:49",
  "0:53:14",
  "0:47:19",
  "0:42:36"
];

speeds = speeds.map(e => miliseconds(e));

console.log(speeds);

function miliseconds(time) {
  [hrs, min, sec] = time.split(":");
  return (parseInt(hrs) * 60 * 60 + parseInt(min) * 60 + parseInt(sec)) * 1000;
}

function getCloserDurationIndex(durations, goalDuration) {
  //milliseconds
  //1h:45min 6h
  if (goalDuration === undefined || goalDuration === null) return;
  let goalIsGreater = durations.every(e => e < goalDuration);
  let goalIsLess = durations.every(e => e > goalDuration);
  if (goalIsGreater) return 1;
  if (goalIsLess) return durations.length;
  let closerDuration, index;
  for (var i = durations.length - 1; i >= 0; i--) {
    if (goalDuration < durations[i]) {
      console.log("la siguiente hora es: ", durations[i]);
      console.log("la hora anterior es: ", durations[i + 1]);
      if (durations[i] - goalDuration < goalDuration - durations[i + 1]) {
        closerDuration = durations[i];
        index = i;
      } else {
        closerDuration = durations[i + 1];
        index = i + 1;
      }
      i = -1;
    }
  }
  return index + 1;
}

function getDuration(duration) {
  let matches = duration.match(/\d+/g);
  if (matches === undefined || matches === null) return;
  console.log("match es:", matches);
  if (matches.length === 1 && duration.includes("h"))
    return (millisecs = matches[0] * 60 * 60 * 1000);
  if (matches.length === 1 && duration.includes("min"))
    return (millisecs = matches[0] * 60 * 1000);
  return (millisecs = (matches[0] * 60 * 60 + matches[1] * 60) * 1000);
}

// console.log(getCloserDurationIndex(speeds, getDuration("0h")));
console.log(getDuration("0h"));
