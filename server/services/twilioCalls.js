const config = require("../config");
var accountSid = config.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = config.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console

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
      });
  });
};

// (async () => {
//   console.log(await makePhoneCall("+51951342603"));
// })();

module.exports = {
  makePhoneCall,
};
