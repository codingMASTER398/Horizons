# Horizons

A private server for [I Wanna Maker](https://www.iwannamakergame.com/).

See a public deploy of this with no rules at [horizons.coding398.dev](https://horizons.coding398.dev/).

## Limitations

- 10,000 character limit on compressed map files for upload
- 150 maps per account
- No playlists
- No leaderboards
- No clears/records
- "tags" sort in search doesn't work properly
- No map images
- Unlisted levels may be wonky
- No following
- No multiplayer
- No challenges

Limits can be configured

## Pros

- Unlockable admin hat system located at /hats
- No map upload cooldown
- Cross-compatibility with the main server with a proxy that makes it look like everyone's an admin
- Every level is played and cleared by default so you can view any level in the editor
- Discord login (more secure)
- More fun!

# Setup

**This program best runs on Replit. [Create a Replit account here](https://join.replit.com/lachie).**

Create a MongoDB atlas database and a Discord client with identify permissions and a redirect URI.

In .env:

- `webhook` a Discord webhook
- `adminWebhook` a Discord webhook for administrator actions
- `clientID` a Discord client ID (with identify permissions)
- `clientSecret` a Discord client secret (with identify permissions)
- `mongoUsername` a mongoDB database username
- `mongoPassword` a mongoDB database password

Change the `redirectURI` and redirect for `/login` in `index.js`

Create a search index in your MongoDB database with the following for `test.maps`

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "Name": [
        {
          "dynamic": true,
          "type": "document"
        },
        {
          "type": "string"
        }
      ]
    }
  }
}
```

Run!

# Post-setup

To give some users special admin hats in `/hats` go to where `customHatPermissions` is declared in `index.js` and edit what IDs of Discord accounts can have specific hat IDs (may need to change /public/hats.html)

To give users administrator permissions, use the MongoDB website to update a user with `Admin` set to `true`

Make sure it doesn't break

# Contributing

Contributing is always welcome. Make a branch and a pull request!
