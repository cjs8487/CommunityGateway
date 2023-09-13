# Community Gateway Discord Bot
The Community Gateway Discord Bot offers a Discord interface for interacting
with the features of Community Gateway, as well as additional ways to consume them.

# Modules
## Data Sync
The Data Sync module syncs dynamic data from the server to one or more Discord
channels. The data updates effectively in real time as changes are made to the
data

# Commands
The Discord Bot offers a suite of commands for interacting with the server and
setting up consumers. Commands are the primary interface for interacting with
the system through Discord. The bot also offers a suite of utility commands.

## Dynamic Data
- `/data sync <format> <type> <params>`
  - Registers this channel as a data sync target. A channel can only be
    registered as one data sync target at a time
  - `type` is the name of the dynamic data type to sync
  - `format` accepts one of three values, each value requires a different set of keys
    - `list` formats the requested data as a simple bulleted list
      - `key` is the property name in the data to display in the list
    - `label-and-link` formats the data as a list of labeled links
      - `label-key` is the property name of the value to display as the label
      - `link-key` is the property name of the value to display as the link
      - Each entry in the list is formatted as `label: link`
    - `group-label-and-link` formats the list as a list of labeled links, but
      additionally groups them under a header
      - `label-key` is the property name of the value to display as the label
      - `link-key` is the property name of the value to display as the link
      - `group-key` is the property name of the value to group items by
      - Each entry in the list is formatted as `label: link`
- `/data sync clear` clears the sync data for the channel, deleting the messages.

## Utilities
- `/forum` various utilities for dealing with forum channels
  - `/forum autoadd add <channel>` will cause the user to be automatically
    added to new threads in `channel` when they are opened
  - `/forum autoadd delete <channel>` deletes the subscription to `channel`
  - `/forum autoadd list` lists all the channels in the server the user is
    subscribed to
  - `/forum autoadd clear` deletes all subscriptions in this server for the user