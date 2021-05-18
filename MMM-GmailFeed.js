'use strict';

Module.register("MMM-GmailFeed", {

	mailCount: 0,
	jsonData: null,
	errorData: null,

	// Default module config.
	defaults: {
		updateInterval: 60000,
		maxEmails: 5,
		maxSubjectLength: 40,
		maxFromLength: 15,
		playSound: true,
		autoHide: true,
		displayMode: "table",
		color: true,
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

		if (this.config.playSound && this.jsonData.fullcount > this.mailCount) {
			new Audio(this.file("eventually.mp3")).play();
		}

		this.mailCount = this.jsonData.fullcount;

		if (this.config.displayMode == "table") {
			if (this.jsonData.fullcount == 0 && this.config.autoHide) {
				return this.jsonData.title = "";
			} else {
				return this.jsonData.title + "  -  " + this.jsonData.fullcount;
			}
		} else if (this.config.displayMode == "notification") {
			/*if (this.jsonData.fullcount == 0 && this.config.autoHide) {*/
				return this.jsonData.title = "";
			/*} else {
				return this.jsonData.title = "GMAIL" + "  -  " + this.jsonData.fullcount;
			}*/
		}
	},

	// Override dom generator.
	getDom: function () {

		var table = document.createElement("table");
		
		if (this.jsonData.fullcount == 0 && this.config.autoHide) {
			table.classList.add("hidden");
		} else {
			table.classList.add("mailtable");
		}
		
		if (this.errorData) {
			table.innerHTML = this.errorData;
			return table;
		}

		if (!this.jsonData) {
			table.innerHTML = "Loading...";
			return table;
		}

		if (!this.jsonData.entry) {
			var row = document.createElement("tr");
			table.append(row);
			if (this.config.displayMode == "table") {
				var cell = document.createElement("td");
				row.append(cell);
				cell.append(document.createTextNode("No New Mail"));
				cell.setAttribute("colspan", "4");
				return table; 
			}
		}

		var items = this.jsonData.entry;
		if (this.config.displayMode == "table") {
		// If the items is null, no new messages
		if (!items) {
			return table;
		}
		}
	
		// If the items is not an array, it's a single entry
		if (!Array.isArray(items)) {
			items = [ items ]
		}
	
		if (this.config.displayMode == "table") {
			items.forEach(element => {
				var row = this.getTableRow(element);
				table.appendChild(row);
			});
		} else if (this.config.displayMode == "notification") {
			var z = document.createElement("a");
			z.setAttribute("height", "50px");
			z.setAttribute("width", "100px");
			z.setAttribute("href", "#");
			z.classList.add("notification");
			var logo = document.createElement("img");
			if (this.config.color == true) {
				logo.setAttribute("src", "/modules/MMM-GmailFeed/Gmail-logo.png");
			} else if (this.config.color == false) {
				logo.setAttribute("src", "/modules/MMM-GmailFeed/Gmail-logo-grayscale.png");
			}
			logo.setAttribute("height", "50px");
			logo.setAttribute("width", "50px");
			var x = document.createElement("span");
			x.classList.add("badge");
			x.innerHTML = this.jsonData.fullcount;
			z.appendChild(x);
			z.appendChild(logo);
			table.appendChild(z);
        }
		
		return table;
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
