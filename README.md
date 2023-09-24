# Community Gateway
*The online portal for community connection*

Community Gateway is a multi-layer software system designed to allow online
communities to connect their members in new and unique ways.

Community Gateway was originally designed to meet the needs for the Skyward
Sword Randomizer Community, however many of the modules are applicable to
various other communities as well.

# Modules
## Dynamic Data
The Dynamic Data module is at hte core of any Community Gateway instance. It serves as a mini-CMS, designed specifically for list-like data. Dynamic Data can
be used to populate lists, store content, or anything else. Data is typed, but
type validity is not checked on the server.

## Files
Community Gateway provides a simple file store, great for storing long form
dynamic content, similar to a wiki.

## Asyncs
For communities centered around racing, Community Gateway provides a module for
managing asynchronous races.

## Website Serving
The Community Gateway server can also serve your communities website. This gives
your website easy, safe, and secure access to all the data stored within
Community Gateway.

## Bots
### Discord

# Security
Community Gateway supports logging in through the following applications via
OAuth or a similar system
- Discord

Community Gateway relies primarily on Discord for authentication, as well as
permission management. This is accomplished using roles. Roles on the target
server can be added to the system's security list, and the specific permissions
they are granted can be fine tuned. The following security points are offered
- Manage Dynamic Data
  - Create data types
  - Delete data types
  - Create new data elements
  - Delete data elements
  - Modify data elements
  - Manage the sort order of elements
- Manage Content Pages
  - Create new files
  - Edit files
  - Delete existing files
- Manage Asyncs
  - Create asyncs without submitting a time
  - Delete asyncs
  - Delete submissions they do not own

# Setup
## Environment Variables
### Required
- **DISCORD_CLIENT_ID** - Discord application client id
- **DISCORD_CLIENT_SECRET** - Discord application client secret
- **DISCORD_REDIRECT** - URL to redirect to at the conclusion of the OAuth flow
- **SESSION_SECRET** - Secret key used in the session store to sign the cookie.
  Should be a cryptographically secure string for production environments.
- **DISCORD_BOT_TOKEN** - Discord bot application token. Used to log the bot in,
  as well as make "user-less" API requests

### Optional
- **DISCORD_COMMAND_SERVER_ID** - When testing mode is enabled, slash commands
  provided by the Discord Bot 
- **testing** - settings this flag will enable various testing utilities,
  including more verbose logging and automatic database restoration as well as
  lower various security thresholds