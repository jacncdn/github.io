# CyTube 3.0

## Table of Contents
  1. [What's New](#whats-new)

## What's new
  * UI Changes
    * Updated bootstrap to v3.0
    * Redesigned playlist controls
    * Redesigned channel moderation settings
    * Added HD layout
    * Added Slate and Cyborg themes
    * Moved guest login form to the chat box
    * Added alias list to user profile box (for moderators)
  * Webserver changes
    * Changed login system
      * Allows you to be logged in from more than one device
      * Permits more secure storage of authentication data
    * Changed account management system
  * New channel features
    * Built-in emote support
    * Private messaging
    * JWPlayer serverside synch via user-entered video lengths.

## Channel UI

Each channel page consists of several basic sections: the chat box, the video, the playlist controls, the playlist, and the poll area.

#### Chat box

The chat box allows you to communicate with the other users in the channel.  At the top, there is a bar with the number of connected users.  Clicking this will hide the userlist to expand the message area.

The userlist consists of all the names of users in the channel who are logged in.  Right click a name to pop up available actions for that user.  If you are not a moderator, you can ignore the user or send them a private message.  Moderators can use this menu to kick, ban, and perform other moderating tasks.

At the bottom, there is a chat input bar.  If you are not logged in, it will prompt you to choose a guest name.  After logging in, simply type your message in the input box and press enter to send it.  Certain types of messages will be interpreted as commands, which will be covered below.

#### Playlist controls

Below the video, there are two strips of buttons for playlist and video control.  Depending on your permission level, certain buttons may be disabled.  Hover over each button to see what it does.

On the left are playlist controls:
  * Search for a video: Search for a video title in the channel library or on YouTube
  * Add from URL: Paste a supported media link and add it to the playlist
  * Embed a custom frame: Embed an `<iframe>` or `<object>` tag for media that is not officially supported
  * Manage playlists: Save and load playlists from your user account
  * Clear playlist: Remove all videos from the playlist
  * Shuffle playlist: Randomize the order of the playlist and start playing from the top
  * Lock/Unlock playlist: Toggle the locked status of the playlist.  Unlocked state is useful for allowing non-moderators to add videos to the playlist.  Exact open/locked permissions can be configured under the channel settings permissions editor

On the right are video controls:
  * Reload the video player: Remove the current video and load it again (useful for dealing with playback issues)
  * Retrieve playlist links: Get a comma-separated list of all the videos in the playlist
  * Voteskip: Vote to skip the currently playing video.  If enough votes are counted, the next item in the playlist will immediately begin playing

#### Playlist

The playlist is a list of videos that will be played in order from top to bottom.  Each entry will display the title and duration of the video.  Each item has a few buttons to perform certain actions, the location of which depends on your user preferences. Click and drag playlist items to rearrange the order.

Item actions:
  * Play: Immediately jump to this playlist item and begin playing
  * Queue Next: Move this video to the next slot after the currently playing video
  * Make Temporary/Permanent: Toggle whether this video will be automatically removed from the playlist after playing once
  * Delete: Remove this item from the playlist

#### Poll area

The poll area allows moderators to conduct polls.  When a moderator opens a poll, a poll-box will be added to the poll area.  Each option in the poll has a button next to it for you to select that option.  Each IP address can only vote once, and your vote is cleared when you leave the page.

The buttons next to each option will display the number of votes for that option.  If it displays "?", then the poll opener has elected to hide the poll results until the poll is over.

## Channel Management

You must be logged in to your account to manage your channels.

### Registering

Go to Account -> Channels.  On the right column, enter the desired channel name and click "Register".  If that channel is not already registered to another account, it will be created and registered to your name.  The website administrator may limit the number of channels that can be registered to one account.

### Deleting

Go to Account -> Channels.  The left column lists all channels registered to your name.  Click the "Delete" button to unregister a channel.  This will permanently clear all database information (ranks, library, bans), and state information (playlist, configuration, MOTD, filters, etc) and is not reversible.  You will be asked to confirm your deletion.

### Channel Settings

From your channel page (/r/channelname), users with moderator or higher rank will see a "Channel Settings" button on the top navigation bar.  This opens a dialog which allows you to manage various aspects of your channel, explained below.

#### General Settings

  * Convert URLs in chat to links: If enabled, URLs entered into chat (e.g. http://google.com) will be converted to clickable hyperlinks
  * Allow voteskip: If enabled, users may click the voteskip button to indicate a preference to skip the currently playing video
  * Voteskip ratio: The proportion of votes from non-AFK users required to skip the current video.  The number of votes required is calculated as `ceil(voteskip ratio * number of non-AFK users)`
  * Max video length: Specify the maximum duration of a playlist item.  Set this to `00:00:00` to allow unlimited length
  * Auto-AFK Delay: After this many seconds of a user sending no chat messages and not voteskipping, the user will be automatically marked as "AFK"
  * Throttle chat: Enables a flood filter that will limit how quickly a user can send chat messages
  * # of messages allowed before throttling: When Throttle chat is active, the number of messages a user can send with no time delay before the flood filter engages
  * # of messages allowed per second: After the above limit is exceeded, only this many messages are allowed per second.  Additional messages are ignored.

#### Admin Settings

  * Page title: The title displayed on the browser window / tab
  * Password: An optional password required for non-moderators to enter the room.  Leave blank to disable
  * External CSS: URL to an external stylesheet to apply to the page
  * External Javascript: URL to an external script to run on the page
  * List channel publicly: When enabled, display the channel name on the index page.  Only active channels (channels with at least 1 user) will be displayed

#### Edit / Chat Filters

Chat filters provide a way for certain text to be recognized and changed in chat messages.  For example, it could be used to transform curse words to strings of asterisks.  DO NOT USE CHAT FILTERS FOR IMAGE EMOTES.  Use the Emotes feature instead.

*Adding a new filter*

  * Filter name: A name to identify the filter.  For informational purposes only, but must be unique
  * Filter regex: A regular expression describing the text to match
  * Flags: A set of regular expression flags to apply.  `g` means to match all instances in the message (instead of just the first), `i` means to match without case sensitivity.  *TODO ADD LINK TO MDN*
  * Replacement: The HTML that will replace the matched text.

*Managing existing filters*

Filters will be applied in the order they are listed.  You can click and drag individual filters to rearrange them.  The "Active" checkbox allows you to easily enable/disable individual filters.  Under the "Control" column, the left button with a list icon opens an editor to change the regular expression, flags, and replacement for a filter.  The red button with a trash icon will delete the filter.

*Importing/Exporting filters* (New in CyTube 3.0)

You can export and import your channel's filter list in order to back it up or transfer it to another room.  Clicking Export filter list will populate the textarea with a JSON-encoded list of filter data.  To import a filter list, paste the JSON data in the textbox and click Import filter list.  The import tool is very strict on format and will reject invalid filters, so please be careful to store the exported data verbatim.

#### Edit / Emotes (New in CyTube 3.0)

Channel emotes provides an easy way to replace certain words in chat with an image.  Each image will be rendered at a maximum of 200px by 200px.  If this is too large, you can use channel CSS to set the `max-width` and `max-height` properties of the `.channel-emote` CSS class, or you can scale your images before uploading them.

The emote editing interface is similar to chat filters, except the emote names are automatically converted from plain text to regular expressions.  Click on the text containing the image URL to change the image for an emote.

#### Edit / MOTD

The MOTD is a block at the top of the page where you can display a Message of the Day to your channel, for example a header image, rules, or important announcements.  The MOTD editor accepts HTML formatting, but will filter out any attempts to execute Javascript.

#### Edit / CSS

The CSS editor allows you to add up to 20,000 characters of inline CSS (as opposed to External CSS, which requires you to host the file elsewhere).  Use this to apply custom styles or colors to your channel.

#### Edit / Javascript

The Javascript editor allows you to add up to 20,000 characters of inline Javascript (as opposed to External Javascript, which requires you to host the file elsewhere).  Use this to run Javascript on your page, for example to make layout changes to the page or add your own timer.

#### Edit / Permissions

The permissions editor provides a way for you to configure what rank is required to carry out certain actions.  Each permission option has a dropdown for selecting the minimum rank required to perform that action.

Since there is sometimes some confusion over "Open Playlist" vs. "General Playlist", I'll note the difference here:  When the playlist is unlocked (the button below the video is green with a checkmark), the Open Playlist Permissions will take precedence over the same permissions under General Playlist Permissions.

#### Edit / Moderators

This menu allows you to manage the moderators of the channel.  To add a new moderator, enter their username in the text field and click "+Mod" for moderator rank, "+Admin" for channel admin rank, or "+Owner" for channel owner rank.  Moderators have most channel moderation permissions (by default), channel admins have additional permissions such as promoting users to moderators and editing certain channel settings, and channel owners are equivalent to channel admins except they can also add new administrators and owners.

In the moderator list, you can use the Edit dropdown to change a user's rank, or remove them from the moderator list.

#### Ban list

The ban list shows a table of ban entries for the channel.  Each entry consists of a name, partially obscured IP address (or `*` if only the username was banned), the name of the moderator who added the ban, and optionally a note on why the ban was added.  Hover over a row to reveal the ban reason.

#### Log

The log allows you to see chat history as well as moderation actions, playlist changes, and other data about your channel.  Above the log text, there is a multiple select box that you can use to display only certain kinds of log data (e.g. chat, joins/quits, playlist actions, moderation actions, etc.).