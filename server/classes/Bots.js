class Bots {
  constructor() {
    this.bots = new Map();
  }
  addBot(id, bot) {
    this.bots.set(id, bot);
  }
  getBot(id) {
    return this.bots.get(id);
  }
}

let bots = new Bots();

module.exports = bots;
