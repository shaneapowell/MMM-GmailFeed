# MMM-GmailFeed
A module for the MagicMirror project which creates a table filled with the current list of unread gmail messages.  This module uses the gmail RSS feed instead of IMAP.

## Example 1 (tba)
End result:

![](example1.png)

Configuration:

```javascript
{
	module: 'MMM-GmailFeed',
	position: 'bottom_bar',
	config: {
		username: 'yourname@gmail.com',
		password: 'yourpassword',
		updateInterval: 60000,
		maxEmails: 5,
		maxSubjectLength: 38,
		maxFromLength: 15
	}
}
```

## Installation
````
git clone https://github.com/shaneapowell/MMM-GmailFeed.git
````

## Config Options
| **Option** | **Default** | **Description** |
| --- | --- | --- |
| username | "" | Your full gmail username.  This can be your coprorate email if you are using a gsuite account |
| password | null | Your gmail password. |
| updateInterval | 60000 | milliseconds between updates |
| maxEmails | 5 | The maximum number of emails to show in the table. The table header will still show the full list of unread emails. |
| maxSubjectLength | 40 | Maximum number of characters to show in the subject column |
| maxFromLength | 15 | Maximum number of characters to show in the from column |
