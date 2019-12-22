'use strict';

Module.register("MMM-GmailFeed", {

	jsonData: null,
	errorData: null,

	// Default module config.
	defaults: {
		updateInterval: 60000,
		maxEmails: 5,
		maxSubjectLength: 40,
		maxFromLength: 15
	},

	start: function () {
		this.getJson();
		this.scheduleUpdate();
	},

	scheduleUpdate: function () {
		var self = this;
		setInterval(function () {
			self.getJson();
		}, this.config.updateInterval);
	},

	// Define required scripts.
	getStyles: function () {
		return ["MMM-GmailFeed.css"];
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Request node_helper to get json from url
	getJson: function () {
		this.sendSocketNotification("MMM-GmailFeed_GET_JSON", this.config);
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === "MMM-GmailFeed_JSON_RESULT") {
			// Only continue if the notification came from the request we made
			// This way we can load the module more than once
			if (payload.username === this.config.username) {
				this.jsonData = payload.data;
				this.errorData = null;
				this.updateDom(500);
			}
		}
		if (notification === "MMM-GmailFeed_JSON_ERROR") {
			if(payload.username === this.config.username) {
				this.jsonData = null;
				this.errorData = "Error: [" + payload.error + "]";
				this.updateDom(500);
			}
		}
	},

	// Override getHeader method.
	getHeader: function() {
		if (!this.jsonData) {
			return "GmailFeed";
		}
		return this.jsonData.title + "  -  " + this.jsonData.fullcount;
	},

	// Override dom generator.
	getDom: function () {

		var wrapper = document.createElement("table");
		wrapper.classList.add("mailtable");
		if (this.errorData) {
			wrapper.innerHTML = this.errorData;
			return wrapper;
		}

		if (!this.jsonData) {
			wrapper.innerHTML = "Loading...";
			return wrapper;
		}

		if (!this.jsonData.entry) {
			var row = document.createElement("tr");
			wrapper.append(row);

			var cell = document.createElement("td");
			row.append(cell);
			cell.append(document.createTextNode("No New Mail"));
			cell.setAttribute("colspan", "4");
			return wrapper;
		}

		var items = this.jsonData.entry;

		// If the items is null, no new messages
		if (!items) {
			return wrapper;
		}
	
		// If the items is not an array, it's a single entry
		if (!Array.isArray(items)) {
			items = [ items ]
		}
	
		items.forEach(element => {
			var row = this.getTableRow(element);
			wrapper.appendChild(row);
		});

		return wrapper;
	},

	getTableRow: function (jsonObject) {
		var row = document.createElement("tr");
		row.classList.add("normal");

		var fromNode = document.createElement("td");
		var subjNode = document.createElement("td");
		var dtNode = document.createElement("td");
		var tmNode = document.createElement("td");

		var issueDt = moment(jsonObject.issued);

		fromNode.append(document.createTextNode(jsonObject.author.name.substring(0, this.config.maxFromLength)));
		subjNode.append(document.createTextNode(jsonObject.title.substring(0, this.config.maxSubjectLength)));
		if (!issueDt.isSame(new Date(), "day")) {
			dtNode.append(document.createTextNode(issueDt.format("MMM DD - ")));
		}
		tmNode.append(document.createTextNode(issueDt.format("h:mm a")));

		fromNode.classList.add("colfrom");
		subjNode.classList.add("colsubj");
		dtNode.classList.add("coldt");
		tmNode.classList.add("coltm");

		row.append(fromNode);
		row.append(subjNode);
		row.append(dtNode);
		row.append(tmNode);
	
		return row;
	}

});
