# Calendar
The `calendar` module is one of the default modules of the ReactiveMirror.
This module displays events from a public .ical calendar. It can combine multiple calendars.

## Using the module

Add it to the modules array in the `config/config.js` file:

````javascript
modules: [
	{
		module: "Calendar",
		position: "top_left",	// This can be any of the regions. Best results in left or right regions.
		config: {
			// The config property is optional.
			// If no config is set, an example calendar is shown.
			// See 'Configuration options' for more information.
		}
	}
]
````

## Configuration options

The following properties can be configured:


| Option                       | Description
| ---------------------------- | -----------
| `maximumEntries`             | The maximum number of events shown. / **Possible values:** `0` - `100` <br> **Default value:** `10`
| `maximumNumberOfDays`        | The maximum number of days in the future. <br><br> **Default value:** `365`
| `displaySymbol`              | Display a symbol in front of an entry. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `defaultSymbol`              | The default symbol. <br><br> **Possible values:** See [Font Awsome](http://fontawesome.io/icons/) website. <br> **Default value:** `calendar`
| `maxTitleLength`             | The maximum title length. <br><br> **Possible values:** `10` - `50` <br> **Default value:** `25`
| `wrapEvents`                 | Wrap event titles to multiple lines. Breaks lines at the length defined by `maxTitleLength`. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `false`
| `fetchInterval`              | How often does the content needs to be fetched? (Milliseconds) <br><br> **Possible values:** `1000` - `86400000` <br> **Default value:** `300000` (5 minutes)
| `animationSpeed`             | Speed of the update animation. (Milliseconds) <br><br> **Possible values:**`0` - `5000` <br> **Default value:** `2000` (2 seconds)
| `fade`                       | Fade the future events to black. (Gradient) <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `fadePoint`                  | Where to start fade? <br><br> **Possible values:** `0` (top of the list) - `1` (bottom of list) <br> **Default value:** `0.25`
| `calendars`                  | The list of calendars. <br><br> **Possible values:** An array, see _calendar configuration_ below. <br> **Default value:** _An example calendar._
| `titleReplace`               | An object of textual replacements applied to the tile of the event. This allow to remove or replace certains words in the title. <br><br> **Example:** `{'Birthday of ' : '', 'foo':'bar'}` <br> **Default value:** `{	"De verjaardag van ": "", "'s birthday": ""	}`
| `displayRepeatingCountTitle` | Show count title for yearly repeating events (e.g. "X. Birthday", "X. Anniversary") <br><br> **Possible values:** `true` or `false` <br> **Default value:** `false`
| `dateFormat`                 | Format to use for the date of events (when using absolute dates) <br><br> **Possible values:** See [Moment.js formats](http://momentjs.com/docs/#/parsing/string-format/) <br> **Default value:** `MMM Do` (e.g. Jan 18th)
| `fullDayEventDateFormat`     | Format to use for the date of full day events (when using absolute dates) <br><br> **Possible values:** See [Moment.js formats](http://momentjs.com/docs/#/parsing/string-format/) <br> **Default value:** `MMM Do` (e.g. Jan 18th)
| `timeFormat`                 | Display event times as absolute dates, or relative time <br><br> **Possible values:** `absolute` or `relative` <br> **Default value:** `relative`
| `getRelative`                | How much time (in hours) should be left until calendar events start getting relative? <br><br> **Possible values:** `0` (events stay absolute) - `48` (48 hours before the event starts) <br> **Default value:** `6`
| `urgency`                    | When using a timeFormat of `absolute`, the `urgency` setting allows you to display events within a specific time frame as `relative`. This allows events within a certain time frame to be displayed as relative (in xx days) while others are displayed as absolute dates <br><br> **Possible values:** a positive integer representing the number of days for which you want a relative date, for example `7` (for 7 days) <br><br> **Default value:** `7`
| `broadcastEvents`            | If this property is set to true, the calendar will broadcast all the events to all other modules with the notification message: `CALENDAR_EVENTS`. The event objects are stored in an array and contain the following fields: `title`, `startDate`, `endDate`, `fullDayEvent`, `location` and `geo`. <br><br> **Possible values:** `true`, `false` <br><br> **Default value:** `true`
| `hidePrivate`                | Hides private calendar events. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `false`
| `excludedEvents`             | An array of words / phrases from event titles that will be excluded from being shown. <br><br> **Example:** `['Birthday', 'Hide This Event']` <br> **Default value:** `[]`

### Calendar configuration

The `calendars` property contains an array of the configured calendars.
The `colored` property gives the option for an individual color for each calendar.

#### Default value:
````javascript
config: {
	colored: false,
	calendars: [
		{
			url: 'http://www.calendarlabs.com/templates/ical/US-Holidays.ics',
			symbol: 'calendar',
			auth: {
			    user: 'username',
			    pass: 'superstrongpassword',
			    method: 'basic'
			}
		},
	],
}
````

#### Calendar configuration options:
| Option                | Description
| --------------------- | -----------
| `url`	                | The url of the calendar .ical. This property is required. <br><br> **Possible values:** Any public accessble .ical calendar.
| `symbol`              | The symbol to show in front of an event. This property is optional. <br><br> **Possible values:** See [Font Awesome](http://fontawesome.io/icons/) website. To have multiple symbols you can define them in an array e.g. `["calendar", "plane"]`
| `color`              | The font color of an event from this calendar. This property should be set if the config is set to colored: true. <br><br> **Possible values:** HEX, RGB or RGBA values (#efefef, rgb(242,242,242), rgba(242,242,242,0.5)).
| `repeatingCountTitle`	| The count title for yearly repating events in this calendar.  <br><br> **Example:** `'Birthday'`
| `maximumEntries`      | The maximum number of events shown.  Overrides global setting. **Possible values:** `0` - `100`
| `maximumNumberOfDays` | The maximum number of days in the future.  Overrides global setting
| `auth`                | The object containing options for authentication against the calendar.


#### Calendar authentication options:
| Option                | Description
| --------------------- | -----------
| `user`                | The username for HTTP authentication.
| `pass`                | The password for HTTP authentication. (If you use Bearer authentication, this should be your BearerToken.)
| `method`              | Which authentication method should be used. HTTP Basic, Digest and Bearer authentication methods are supported. Basic authentication is used by default if this option is omitted. **Possible values:** `digest`, `basic`, `bearer` **Default value:** `basic`
