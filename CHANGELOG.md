# Dev
## New Features
- Add support for multiple Discord servers to source information from
- Reimplement several environment variables as part of the application instead
  - One or more users can now be named as superusers, who immediately gain all
    base privileges as well as superuser specific access rights. This replaces
    the `DISCORD_ADMIN_OVERRIDE` environment variable
    - Superusers are configured via `/config/superusers.json`, which is an array
      of Discord user ids (as strings) to grant privileges to
  - Superusers have the ability to configure the following (mostly migrated from
    environment variables)
    - Base Discord servers
    - Admin role(s)
  - Superusers *cannot* create additional superusers
# 1.0.1
## Bug Fixes
- Fix incorrect auth requirement for dynamic data routes
# 1.0.0
## New Features
### Core
- Added Discord OAuth implementation
- SQLite Database implementation
- Security class and security point implementation
- Logger
### Dynamic Data
- Added endpoints for managing dynamic data types
- Added endpoints for managing dynamic data entries
### Asyncs
- Added endpoints for managing asyncs
- Added endpoints for managing async submissions
### Files
- Added endpoints for file management
### Discord Bot
- Created initial Discord Bot implementation
  - Slash command support
  - Button interaction support