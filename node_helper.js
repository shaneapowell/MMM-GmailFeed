var NodeHelper = require('node_helper');
var request = require('request');
var xml2js = require('xml2js');

module.exports = NodeHelper.create({
	start: function () {
		console.log('MMM-GmailFeed helper started...');
	},

	getFeed: function (config) {
		var self = this;
		var feedUrl = "https://mail.google.com/mail/feed/atom";

		request({url: feedUrl, auth: { user: config.username, pass: config.password } } , function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var parser = new xml2js.Parser({trim:true, explicitArray: false });
				parser.parseString(body, function (err, result) {

				if (result.feed.entry) {
					if (!Array.isArray(result.feed.entry)) {
						result.feed.entry = [ result.feed.entry ]
					}
					
					result.feed.entry = result.feed.entry.slice(0, config.maxEmails);
				}

//console.log("----");
//console.log(JSON.stringify(result.feed, null, 2));
//console.log("----");
					// Send the json data back with teh url to distinguish it on the receiving port
					self.sendSocketNotification("MMM-GmailFeed_JSON_RESULT", {username: config.username, data: result.feed});
				});
			}
			else {
				self.sendSocketNotification("MMM-GmailFeed_JSON_ERROR", {username: config.username, error: error });
			}
		});

	},

	//Subclass socketNotificationReceived received.
	socketNotificationReceived: function (notification, config) {
		if (notification === "MMM-GmailFeed_GET_JSON") {
			this.getFeed(config);
		}
	}
});
