const config = require("../config");
const callMebot = require("./callMeBot");
var accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console

const client = require("twilio")(accountSid, authToken, {
  lazyLoading: true,
});

// Function to send message to WhatsApp
const makePhoneCall = async (number) => {
  return new Promise((resolve, reject) => {
    client.calls
      .create({
        to: number,
        url: "http://demo.twilio.com/docs/voice.xml",
        from: `(252) 429-5033`, //numero del bot
      })
      .then((call) => resolve(call.sid))
      .catch((err) => {
        console.log(err);
        reject(err);
        callMebot(config.TELEGRAM_OWN_USERNAME, "Error en llamada twilio");
      });
  });
};

// (async () => {
//   console.log(await makePhoneCall("+51983724476"));
// })();

module.exports = {
  makePhoneCall,
};
