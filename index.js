// UTILS
const utils = require("./utils");
const fetch = require(`node-fetch`); // Install as @2

// CONFIG
const clientVersion = 0.902;
let realIWM = [];

// IWM-API
let iwmAPI = new require("iwm-api").client();

// DISCORD WEBHOOK
const { Webhook } = require("simple-discord-wh");
const webhook = new Webhook(process.env.webhook);
const adminWebhook = new Webhook(process.env.adminWebhook);

function webhookMessage(message) {
  webhook
    .send({ content: message })
    .then(() => {
      console.log(`Sent webhook message ${message}`);
    })
    .catch(() => {
      console.log(`Couldn't send webhook message ${message}`);
    });
}

function adminWebhookMessage(message) {
  adminWebhook
    .send({ content: message })
    .then(() => {
      console.log(`Sent admin webhook message ${message}`);
    })
    .catch(() => {
      console.log(`Couldn't send admin webhook message ${message}`);
    });
}

webhookMessage(`The server rebooted`);

// MONGODB
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.mongoUsername}:${process.env.mongoPassword}@horizons.wekwpci.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

let db, users, maps;

(async () => {
  await client.connect();
  console.log(`Connected to MongoDB!`);

  db = client.db("test");
  users = db.collection(`users`);
  maps = db.collection(`maps`);

  /*await users.updateMany(
    { },
    { $set: { Notifications: [] } }
  );*/
})();

// EXPRESS
const express = require(`express`);
const app = express();

let bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
    type: () => {
      return true;
    },
    limit: "5mb",
    parameterLimit: 15000,
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// DISCORD LOGIN

const Client = require("discord-oauth2-api");
const loginClient = new Client({
  clientID: process.env.clientID,
  clientSecret: process.env.clientSecret,
  scopes: ["identify"],
  redirectURI: "https://horizons.coding398.dev/after",
});

app.use((req, res, next) => {
  if (!users || !maps) {
    res.status(500);
    res.send(`The server's still booting up.`);
  } else {
    next();
  }
});

app.use(express.static(`public`));

app.get(`/`, (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get(`/hats`, (req, res) => {
  res.sendFile(__dirname + "/public/hats.html");
});

app.get(`/setup`, (req, res) => {
  res.sendFile(__dirname + "/public/setup.html");
});

app.get(`/login`, (req, res) => {
  res.redirect(
    `https://discord.com/oauth2/authorize?client_id=${process.env.clientID}&redirect_uri=https%3A%2F%2Fhorizons.coding398.dev%2Fafter&response_type=code&scope=identify`
  );
});

app.get(`/after`, async (req, res) => {
  if (!req.query.code) return;

  try {
    let r = await loginClient.getAccessToken(req.query.code);
    let user = await loginClient.getUser(r.accessToken);

    let u = await users.findOne({ actualID: user.id });

    if (u) {
      res.send(`Welcome back to Horizons!<br>
It's great to see you again.<br>
Please join our Discord for any support: <a href="https://discord.gg/EM9GWS4tfk">https://discord.gg/EM9GWS4tfk</a><br>
<br>
Your Horizons username: ${u.Username}<br>
Your Horizons password: ${u.Password}`);
    } else {
      let dis = ``;
      let usr = user.username
        .replace(/:/g, "")
        .replace(/[^\x00-\x7F]/g, "")
        .trim();
      while (true) {
        u = await users.findOne({ Username: `${usr}${dis !== 0 ? dis : ""}` });
        if (u) {
          dis++;
        } else {
          let createUsername = `${usr}${dis !== 0 ? dis : ""}`;
          let pass = utils.makeid(10);

          webhookMessage(`${createUsername} signed up!`);

          console.log(`Found spot for ${user.tag}: ${createUsername}`);
          await users.insertOne({
            actualID: user.id,
            ID: Math.round(Math.random() * 999999999999999),
            CreatedAt: new Date().toISOString(),
            UpdatedAt: new Date().toISOString(),
            DeletedAt: null,
            Username: createUsername,
            Password: pass,
            Banned: false,
            Admin: false,
            ShoesColor: 0,
            PantsColor: 0,
            ShirtColor: 0,
            CapeColor: 0,
            SkinColor: 0,
            HairColor: 0,
            HatSpr: 0,
            Country: 0,
            HairSpr: 0,
            HatColor: 0,
            HatColorInv: 0,
            FacialExpression: 0,
            DeathEffect: 0,
            GunSpr: 0,
            BulletSpr: 0,
            SwordSpr: 0,
            Costume: 0,
            FollowerSpr: 0,
            FollowerColor: 0,
            SaveEffect: 0,
            TextSnd: 0,
            RecordScribble0: 0,
            RecordScribble1: 0,
            RecordScribble2: 0,
            RecordScribble3: 0,
            RecordExplorer: 0,
            RecordRoulette: 0,
            RecordEndurance0: 0,
            RecordEndurance1: 0,
            RecordEndurance2: 0,
            RecordEndurance3: 0,
            RecordHardcore: 0,
            NumMapsCreated: 0,
            NumMapsClear: 0,
            NumSpeedrunRecords: 0,
            Unlocks: "",
            Followed: false,
            Notifications: [
              {
                ID: Math.floor(Math.random() * 100000),
                CreatedAt: new Date().toISOString(),
                UpdatedAt: new Date().toISOString(),
                DeletedAt: null,
                ForUserID: u.ID,
                Type: 4,
                IsRead: false,
                MapID: 0,
                NotifData: JSON.stringify({
                  Message:
                    "Welcome to Horizons! Join our Discord: https://discord.gg/EM9GWS4tfk",
                }),
              },
            ],
          });

          res.send(`Welcome to Horizons!<br>
We hope you enjoy your stay.<br>
Please join our Discord for any support: <a href="https://discord.gg/EM9GWS4tfk">https://discord.gg/EM9GWS4tfk</a><br>
<br>
Your Horizons username: ${createUsername}<br>
Your Horizons password: ${pass}`);
          break;
        }
      }
    }
  } catch (e) {
    res.status(500);
    res.send(`Internal server error! We'll try to get this fixed.`);
    if (e.toString().includes(`< in JSON`) || e.toString() == `Error`) {
      process.kill(1);
    }
  }
});

// SERVER ENDPOINTS

app.post(`/api/v1/login`, async (req, res) => {
  realIWM = utils.removeFromArray(realIWM, req.headers["x-forwarded-for"]);
  if (!req.body.username || !req.body.password || !req.body.version) {
    res.sendStatus(400);
    return;
  }

  let u = await users.findOne({
    Username: req.body.username,
    Password: req.body.password,
  });
  if (u) {
    if (Number(req.body.version) !== clientVersion) {
      res.status(400);
      res.send(
        `You need to be on version ${clientVersion} to use a Horizon account`
      );
      return;
    }
    if (u.Banned) {
      res.status(403);
      res.send(`This account is banned/disabled.`);
    } else {
      webhookMessage(`${req.body.username} signed in!`);
      res.json({
        token: `${req.body.username}:${req.body.password}`,
        userId: u.ID,
        twitch: 0,
      });
    }
  } else {
    // Cross-compatibility with the official IWM servers

    iwmAPI
      .login(req.body.username, req.body.password, req.body.version)
      .then((r) => {
        if (r.loggedIn) {
          if (!realIWM.includes(req.headers["x-forwarded-for"])) {
            realIWM.push(req.headers["x-forwarded-for"]);
          }
          res.json({
            token: r.token,
            userId: r.userId,
            twitch: 0,
          });
        } else {
          res.status(403);
          res.send(
            `Incorrect username or password! https://horizons.coding398.dev/login`
          );
        }
      })
      .catch((e) => {
        res.status(403);
        res.send(
          `Incorrect username or password! https://horizons.coding398.dev/login`
        );
      });
  }
});

app.use(async (req, res, next) => {
  if (realIWM.includes(req.headers["x-forwarded-for"])) {
    fetch(`http://make.fangam.es${req.originalUrl}`, {
      headers: {
        Authorization: req.headers.authorization || "",
        "user-agent": `IWM Private Server (Horizons)`,
        "content-type": req.headers["content-type"],
      },
      body: req.rawBody ? req.rawBody.toString() : null,
      method: req.method,
    }).then(async (r) => {
      let t = await r.text();
      t = t.replace(`Admin":false`, `Admin":true`);
      res.status(r.status).send(t);
    });
    //res.redirect(307,`http://make.fangam.es${req.originalUrl}`)
  } else {
    next();
  }
});

app.get(`/api/v1/mapcount`, async (req, res) => {
  if (!maps) return;
  let c = await maps.count();
  res.send(c.toString());
});

app.get(`/api/v1/user/:id`, async (req, res) => {
  req.params.id = Number(req.params.id);
  if (!users) return;
  let u = await users.findOne({ ID: req.params.id });
  if (u) {
    u = utils.cleanUser(u);
    res.json(u);
  } else {
    res.sendStatus(404);
  }
});

app.get(`/api/v1/followcheck`, (req, res) => {
  // No clue what this does
  res.end(`0`);
});

app.get(`/api/v1/featuredlist`, (req, res) => {
  res.json({});
});

app.get(`/api/v1/list/:u`, (req, res) => {
  res.status(501);
  res.send(`poopy`);
});

app.get(`/api/v1/list`, (req, res) => {
  res.json([
    {
      ID: 1,
      CreatedAt: "2020-02-13T10:29:10Z",
      UpdatedAt: "2020-03-01T18:24:18Z",
      DeletedAt: null,
      CreatorID: "626618189450838027",
      Name: "404 Not Found (yet)!!!",
      IsFavorites: false,
      MapIDs: "6",
      MapCount: 1,
      Maps: null,
      CreatorName: "coding",
      ShoesColor: 0,
      PantsColor: 0,
      ShirtColor: 0,
      CapeColor: 0,
      SkinColor: 0,
      HairColor: 0,
      HatSpr: 0,
      Country: 0,
      HairSpr: 0,
      HatColor: 0,
      HatColorInv: 0,
      FacialExpression: 0,
      DeathEffect: 0,
      GunSpr: 0,
      BulletSpr: 0,
      SwordSpr: 0,
      Costume: 0,
      FollowerSpr: 0,
      FollowerColor: 0,
      SaveEffect: 0,
      TextSnd: 0,
    },
  ]);
});

app.use(async (req, res, next) => {
  if (!req.headers.authorization) {
    res
      .status(403)
      .send(
        `Forbidden (403) or Not Found (404). Make sure you don't have an ending / on the server in your client's config.ini.`
      );
    return;
  } else {
    let u = await users.findOne({
      Username: req.headers.authorization.split(":")[0],
      Password: req.headers.authorization.split(":")[1],
    });
    if (u) {
      req.user = u;
      if (u.Banned) {
        res.status(403);
        res.send(`Your Horizons account has been banned/disabled.`);
      } else {
        next();
      }
    } else {
      if (!req.headers.authorization.includes(`:`)) {
        realIWM.push(req.headers["x-forwarded-for"]);
      }
      res.status(403).send(`Incorrect username or password! (403 Forbidden)`);
      return;
    }
  }
});

const customHatPermissions = {
  35: [`280517002303373312`, `1024041275726508135`],
  3: [
    `626618189450838027`,
    `280517002303373312`,
    `230046015619727368`,
    `320763486395170816`,
    `346304868643766293`,
    `1024041275726508135`,
    `485801343165136906`,
    `590640104587132958`,
    `469024971599904780`,
    `771841759621414922`,
  ],
  33: [`626618189450838027`],
};

app.post(`/customHat/:id`, async (req, res) => {
  let hat = 0;
  let message = `You can't have that hat!`;

  switch (req.params.id) {
    case "45":
      hat = 45;
      break;
    case "47":
      hat = 47;
      break;
    case "35":
      if (customHatPermissions[35].includes(req.user.actualID)) {
        hat = 35;
      } else {
        message = `You aren't marked as a furry!`;
      }
      break;
    case "3":
      if (customHatPermissions[3].includes(req.user.actualID)) {
        hat = 3;
      } else {
        message = `You aren't one of the first 10 users!`;
      }
      break;
    case "33":
      if (customHatPermissions[33].includes(req.user.actualID)) {
        hat = 33;
      } else {
        message = `You aren't one of the contributors!`;
      }
      break;
  }

  if (!hat) {
    if (
      req.user.customHats &&
      req.user.customHats.includes(Number(req.params.id))
    ) {
      hat = Number(req.params.id);
    } else {
      res.status(400).send(message);
      return;
    }
  }

  await users.updateOne(
    {
      ID: req.user.ID,
    },
    {
      $set: {
        HatSpr: hat,
      },
    }
  );

  console.log(`Custom hat update for ${req.user.Username} : ${hat}`);

  webhookMessage(`${req.user.Username} put on some new swag!`);

  res.send(`Applied!`);
});

app.get(`/api/v1/notifunread`, (req, res) => {
  res.end(
    req.user.Notifications.filter((n) => {
      return !n.IsRead;
    }).length.toString()
  );
});

app.get(`/api/v1/notif`, (req, res) => {
  if (
    !req.query.notifType ||
    !req.query.start ||
    !req.query.limit ||
    !req.query.notifRead
  ) {
    res.sendStatus(400);
    return;
  }
  let notifs = req.user.Notifications.slice(
    req.query.start,
    req.query.start + req.query.limit
  );

  if (req.query.notifType == 0) {
    notifs = notifs.filter((n) => {
      return n == 0;
    });
  } else if (req.query.notifType == -2) {
    notifs = notifs.filter((n) => {
      return n !== 0;
    });
  }

  if (req.query.notifRead == 0) {
    notifs = notifs.filter((n) => {
      return !n.IsRead;
    });
  } else if (req.query.notifRead == 1) {
    notifs = notifs.filter((n) => {
      return n.IsRead;
    });
  }

  notifs = notifs.reverse();

  res.json(notifs);
});

app.post(`/api/v1/notifread`, async (req, res) => {
  let s = req.body[Object.keys(req.body)[0]].split(`\n`);
  let checking = 0;
  let notifType = 0;
  let notifId = 0;
  for (let i = 0; i < s.length; i++) {
    if (!(s[i] == `` || s[i].includes(`-----`) || s[i].includes(`clear`))) {
      if (s[i].includes(`notifType`)) {
        checking = 2;
      } else if (s[i].includes(`notifID`)) {
        checking = 1;
      }

      switch (checking) {
        case 1:
          notifId = s[i];
          break;
        case 2:
          notifType = s[i];
          break;
      }
    }
  }

  for (let i = 0; i < req.user.Notifications.length; i++) {
    if (req.user.Notifications[i].ID == notifId || notifId == 0) {
      req.user.Notifications[i].IsRead = true;
    }
  }

  await users.updateOne(
    {
      ID: req.user.ID,
    },
    {
      $set: {
        Notifications: req.user.Notifications,
      },
    }
  );

  res.send(`Applied!`);
});

const sorts = {
  '[{ "Dir": "desc", "Name": "average_rating" }]': { NumThumbsUp: -1 },
  '[{ "Dir": "desc", "Name": "created_at" }]': { CreatedAt: -1 },
  '[{ "Dir": "asc", "Name": "created_at" }]': { CreatedAt: 1 },
  '[{ "Dir": "asc", "Name": "average_difficulty" }]': { ClearRate: 1 },
  '[{ "Dir": "desc", "Name": "average_difficulty" }]': { ClearRate: -1 },
  '[{ "Dir": "asc", "Name": "play_count" }]': { PlayCount: 1 },
};

function mapUserDetails(map, enableBanned = false) {
  return new Promise(async function (res) {
    let u = await users.findOne({ ID: map.CreatorId });

    if (u) {
      map.ShoesColor = u.ShoesColor;
      map.PantsColor = u.PantsColor;
      map.ShirtColor = u.ShirtColor;
      map.CapeColor = u.CapeColor;
      map.SkinColor = u.SkinColor;
      map.HairColor = u.HairColor;
      map.HatSpr = u.HatSpr;
      map.Country = u.Country;
      map.HairSpr = u.HairSpr;
      map.HatColor = u.HatColor;
      map.HatColorInv = u.HatColorInv;
      map.FacialExpression = u.FacialExpression;

      map.CreatorName = u.Username;
    } else {
      console.log(`Simply can't`);
      map.ShoesColor = 0;
      map.PantsColor = 0;
      map.ShirtColor = 0;
      map.CapeColor = 0;
      map.SkinColor = 0;
      map.HairColor = 0;
      map.HatSpr = 0;
      map.Country = 0;
      map.HairSpr = 0;
      map.HatColor = 0;
      map.HatColorInv = 0;
      map.FacialExpression = 0;
    }

    map.CreatedAt = new Date(map.CreatedAt).toISOString();

    if (map.AverageUserDifficulty > 5) {
      map.AverageUserDifficulty = 5;
    }
    if (map.AverageUserDifficulty < 0) {
      map.AverageUserDifficulty = 0;
    }
    if (map.ComputedDifficulty > 5) {
      map.ComputedDifficulty = 5;
    }
    if (map.ComputedDifficulty < 0) {
      map.ComputedDifficulty = 0;
    }
    if (map.ClearRate < 0) {
      map.ClearRate = 0;
    }
    if (map.ClearRate > 1) {
      map.ClearRate = 1;
    }

    if (u.Banned && !enableBanned) {
      map.ID = Math.floor(Math.random() * 100000) + 9000000;
      map.Name = `Banned map`;
      map.CreatorName = `Banned`;
      map.Description = `This map was made by a banned account and is unplayable.`;
      map.CreatorId = 0;
      map.MapCode = `00000000`;
    }

    map.Played = true;
    map.Clear = true;
    map.FullClear = true;
    map.BestFullTimeUserID = 0
    map.BestFullTimeUsername = ""
    map.BestFullTimePlaytime = 2147483647
    map.ReplayVisibility = 0

    if (map.ClearCount < 5) map.ClearCount = 5;
    if (map.AverageUserDifficulty <= 0) map.AverageUserDifficulty = 0.1;

    delete map._id;
    delete map.Ratings;
    delete map.HiddenInChallenges;
    delete map.Shadow;

    map.NumRatings = map.NumThumbsUp + map.NumThumbsDown;

    res(map);
  });
}

app.delete(`/api/v1/map/:id`, async (req, res) => {
  const mapId = Number(req.params.id);
  let map = await maps.findOne({ ID: mapId });
  if (map) {
    if (map.CreatorId == req.user.ID || req.user.Admin) {
      await maps.deleteOne({ ID: mapId });
      res.send(`Deleted`);
      adminWebhookMessage(
        `${req.user.Username} ${
          req.user.Admin ? "<:admin:1038598397550145569> " : ""
        }deleted the map ${map.Name}`
      );
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(404);
  }
});

app.get(`/api/v1/map`, async (req, res) => {
  // Oh boy, here we go...

  let lastin = Number(req.query.last_x_hours) || 0;
  let min = Number(req.query.min_diff) || 0;
  let max = Number(req.query.max_diff) || 5;
  let start = Number(req.query.start) || 0;
  let limit = Number(req.query.limit) || 10;
  let search = req.query.name || "";
  let author = req.query.author || "";
  let authorID = req.query.author_id || "";
  let code = req.query.code || "";
  let sort = sorts[req.query.order] || { AverageRating: -1 };
  let tags = req.query.required_tags ? req.query.required_tags.split(",") : "";
  let unlisted = false;

  if (req.query.admin_show_unlisted && req.user.Admin) {
    unlisted = true;
  }

  let matches = {};

  if (!unlisted) {
    matches["Listed"] = true;
  }

  if (author) {
    matches["CreatorName"] = author;
  }

  if (authorID) {
    matches["CreatorId"] = Number(authorID);
  }

  if (code) {
    matches["MapCode"] = code;
  } else {
    matches["Shadow"] = null;
  }

  if (tags) {
    matches["TagIDs"] = {
      $regex: new RegExp(tags.join("|")),
    };
  }

  if (lastin) {
    matches[`CreatedAt`] = {
      $gte: Date.now() - lastin * 60 * 60 * 1000,
    };
  }

  matches["AverageUserDifficulty"] = {
    $lte: max,
    $gte: min,
  };

  if (limit > 50) limit = 50;
  if (limit < 1) limit = 1;

  let aggr = [
    {},
    {
      $sort: sort,
    },
    {
      $match: matches,
    },
    {
      $skip: start,
    },
  ];

  if (
    req.query.order &&
    req.query.order == `[{ "Dir": "desc", "Name": "random" }]`
  ) {
    aggr.push({ $sample: { size: 1 } });
  }
  aggr.push({
    $limit: limit,
  });

  if (search) {
    aggr[0] = {
      $search: {
        index: "maps",
        text: {
          query: search,
          path: {
            wildcard: "*",
          },
        },
      },
    };
  } else {
    aggr.shift();
  }

  let r = await maps.aggregate(aggr);

  let arr = await r.toArray();

  for (let i = 0; i < arr.length; i++) {
    arr[i] = await mapUserDetails(arr[i], unlisted);
  }

  res.json(arr);
});

app.get(`/api/v1/useruploadcooldown`, (req, res) => {
  res.json({ success: true });
});

app.get(`/api/v1/map/:id`, async (req, res) => {
  req.params.id = Number(req.params.id);
  try {
    let m = await maps.findOne({ ID: req.params.id });
    m.BestFullTimeUserID = 0
    m.BestFullTimePlaytime = 0
    m.BestFullTimeUsername = 0
    if (m) {
      m = await mapUserDetails(m);
      res.json(m);
    } else {
      res.sendStatus(404);
    }
  } catch {
    if (m) res.json(m);
    else res.sendStatus(500);
  }
});

app.post(`/api/v1/map/:id/start`, async (req, res) => {
  req.params.id = Number(req.params.id);
  let m = await maps.findOne({ ID: req.params.id });
  m.BestFullTimeUserID = 0
  m.BestFullTimePlaytime = 0
  m.BestFullTimeUsername = 0
  if (m) {
    res.json({
      Rating: m.AverageRating,
      Difficulty: m.ClearRate * 5,
      Played: false,
      Clear: false,
      BestPlaytime: 0,
      BestDeaths: 0,
      TagIDs: m.TagIDs,
      TagNames: m.TagNames,
      Followed: false,
      CurMap: m,
    });
  } else {
    res.sendStatus(404);
  }

  /*Rating: 0,
  Difficulty: 0,
  Played: true,
  Clear: false,
  BestPlaytime: 0,
  BestDeaths: 0,
  TagIDs: '',
  TagNames: '',
  Followed: false*/
});

const hatLevels = {
  XSAG0ZPM: 28, // Cherry
  VBEJL6RV: 13, // Leek
  PO7LZJT2: 34, // Ribbon
  V393R8OG: 41, // Devil horns
};

app.post(`/api/v1/map/:id/stop`, async (req, res) => {
  // TODO: ADD RATELIMIT

  req.params.id = Number(req.params.id);

  let m = await maps.findOne({ ID: req.params.id });
  try {
    if (m) {
      m = await mapUserDetails(m);

      let s = req.body[Object.keys(req.body)[0]].split(`\n`);
      let checking = 1;
      let clear = false;
      let deaths = 0;
      for (let i = 0; i < s.length; i++) {
        if (!(s[i] == `` || s[i].includes(`-----`) || s[i].includes(`clear`))) {
          if (s[i].includes(`name="deaths"`)) {
            checking = 2;
          } else if (s[i].includes(`name=`)) {
            checking = 0;
          }

          switch (checking) {
            case 1:
              if (s[i].includes("1")) clear = true;
              break;
            case 2:
              deaths = Number(s[i]);
              break;
          }
        }
      }

      if (clear) {
        m.ClearCount++;
        m.DeathCount += deaths;
        let rate = 0.5;
        if (m.ClearCount > m.DeathCount) {
          rate = Number((m.DeathCount / m.ClearCount).toFixed(1));
        } else {
          rate = Number(1 - (m.ClearCount / m.DeathCount).toFixed(1));
        }
        if (rate > 1) rate = 1;
        if (rate < 0) rate = 0;
        let actualRate = Number((rate * 4).toFixed(1)) + 1;

        await maps.updateOne(
          { ID: m.ID },
          {
            $set: {
              PlayCount: m.PlayCount + 1,
              DeathCount: m.DeathCount + deaths,
              ClearCount: m.ClearCount + 1,
              ClearRate: rate,
              AverageUserDifficulty: actualRate,
              ComputedDifficulty: actualRate,
            },
          }
        );
      }

      webhookMessage(`${req.user.Username} finished the level ${m.Name}!`);

      res.send({
        success: true,
        isWorldRecord: false,
      });

      if (hatLevels[m.MapCode]) {
        if (!req.user.customHats) {
          req.user.customHats = [];
        }
        if (!req.user.customHats.includes(hatLevels[m.MapCode])) {
          req.user.customHats.push(hatLevels[m.MapCode]);
          req.user.Notifications.push({
            ID: Math.floor(Math.random() * 100000),
            CreatedAt: new Date().toISOString(),
            UpdatedAt: new Date().toISOString(),
            DeletedAt: null,
            ForUserID: req.user.ID,
            Type: 4,
            IsRead: false,
            MapID: 0,
            NotifData: JSON.stringify({
              Message: `You are now eligible for a new hat for completing the level ${m.MapCode}! Head over to https://horizons.coding398.dev/hats to claim!`,
            }),
          });
          webhookMessage(
            `${req.user.Username} earned a new hat for completing ${m.Name}!`
          );
        }
        await users.updateOne(
          { ID: req.user.ID },
          {
            $set: {
              customHats: req.user.customHats,
              Notifications: req.user.Notifications,
            },
          }
        );
      }
    } else {
      res.sendStatus(404);
    }
  } catch {
    res.sendStatus(500);
  }
});

const uploadFileThings = {
  '"mapName"': 1,
  'Content-Disposition: form-data; name="mapDescription"': 2,
  'Content-Disposition: form-data; name="mapVersion"': 3,
  'Content-Disposition: form-data; name="mapData"': 4,
  'Content-Disposition: form-data; name="listed"': 5,
  'Content-Disposition: form-data; name="hideInChallenges"': 6,
  'Content-Disposition: form-data; name="tags"': 7,
  'Content-Disposition: form-data; name="clientVersion"': 8,
};

const tagIDsToTagNames = {
  2: "Needle",
  7: "Trap/Troll",
  0: "Adventure",
  6: "Gimmick",
  3: "Joke/Meme",
  5: "Puzzle",
  1: "Boss/Avoidance",
  9: "Art",
  8: "Music",
  4: "Auto",
};

app.put(`/api/v1/map`, async (req, res) => {
  let o = ``;

  let ok = Object.keys(req.body);

  for (let i = 0; i < ok.length; i++) {
    let section = req.body[ok[i]];

    if (typeof section == "object") {
      let sectionKeys = Object.keys(section);

      for (let e = 0; e < sectionKeys.length; e++) {
        o += sectionKeys[e];
        if (typeof section[sectionKeys[e]] == "object") {
          o += section[sectionKeys[e]][Object.keys(section[sectionKeys[e]])[0]];
        } else {
          o += section[sectionKeys[e]];
        }
      }
    } else {
      o += section;
    }
  }

  let mapData = ``;
  let mapName = `Default`;
  let mapDescription = ``;
  let mapTags = ``;
  let listed = 0;
  let hiddenInChallenges = 1;
  let mapVersion = 90;
  let cv = 0;

  let curget = 0;

  o = o.split(`\n`);

  let dl = 0;

  for (let i = 0; i < o.length; i++) {
    let switched = false;

    o[i] = o[i].trim();

    if (Object.keys(uploadFileThings).includes(o[i])) {
      switched = true;
      curget =
        uploadFileThings[
          Object.keys(uploadFileThings)[
            Object.keys(uploadFileThings).indexOf(o[i])
          ]
        ];
    }

    if (switched) continue;
    if (o[i].includes(`-----`)) {
      curget = 0;
    }
    if (o[i] == "") continue;

    switch (curget) {
      case 1: // NAME
        mapName = o[i];
        dl++;
        break;
      case 2: // DESCRIPTION
        mapDescription = o[i];
        dl++;
        break;
      case 3: // VERSION
        mapVersion = Number(o[i]);
        dl++;
        break;
      case 4: // MAP DATA
        mapData = o[i].replace(/ /g, "+");
        dl++;
        break;
      case 5: // LISTED
        dl = true;
        listed = Number(o[i]);
        dl++;
        break;
      case 6:
        hiddenInChallenges = Number(o[i]);
        dl++;
        break;
      case 7:
        mapTags = o[i];
        dl++;
        break;
      case 8:
        cv = Number(o[i]);
        dl++;
        break;
    }
  }

  if (dl < 4) {
    require(`fs`).writeFileSync(`./awkward.log`, o.join(`\n`));
    res.status(500);
    res.send(
      `Something went wrong here... but we don't know what. I'll let you think with that one.`
    );
    return;
  }

  if (listed == 0) {
    hiddenInChallenges = 1;
    listed = false;
  } else if (listed == 1) {
    listed = true;
  } else {
    listed = false;
  }

  if (cv !== clientVersion) {
    res.sendStatus(426);
    return;
  }

  if (
    mapName.length > 35 ||
    mapDescription.length > 100 ||
    mapVersion < 90 ||
    mapVersion > 100 ||
    mapTags.length > 20
  ) {
    res.sendStatus(413);
    return;
  }

  if (mapData.length > 10000 && !req.user.Admin) {
    res.status(413);
    res.send(
      `Woah there, that's too big of a level for our database. If you'd like an exemption, contact us on our Discord.`
    );
    return;
  }

  let tagNames = [];
  for (let i = 0; i < mapTags.split(`,`).length; i++) {
    if (Object.keys(tagIDsToTagNames).includes(mapTags.split(`,`)[i])) {
      tagNames.push(tagIDsToTagNames[mapTags.split(`,`)[i]]);
    }
  }

  tagNames = tagNames.join(`,`);

  let m = await maps.find({
    CreatorId: req.user.ID,
  });
  if ((await m.count()) > 150) {
    res.status(400);
    res.send(
      `You've already created too many maps! The limit for your Horizons account is 150.`
    );
  } else {
    let mc = utils.makeid(8);
    let latestMap = await maps.findOne(
      {},
      {
        sort: { CreatedAt: -1 },
      }
    );

    webhookMessage(
      `${req.user.Username} uploaded "${mapName}" with a description of "${mapDescription}" (${mc})`
    );

    await maps.insert({
      ID: latestMap.ID + 1,
      CreatorId: req.user.ID,
      CreatorName: req.user.Username,
      Name: mapName,
      Description: mapDescription,
      Version: mapVersion,
      CreatedAt: Date.now(),
      DeletedAt: null,
      MapCode: mc,
      Listed: listed,
      DragonCoins: false,
      DeathEffect: 0,
      GunSpr: 0,
      BulletSpr: 0,
      SwordSpr: 0,
      Costume: 0,
      FollowerSpr: 0,
      FollowerColor: 0,
      SaveEffect: 0,
      TextSnd: 0,
      AverageRating: 50,
      AverageUserDifficulty: 0,
      ComputedDifficulty: 0,
      NumRatings: 0,
      NumThumbsUp: 0,
      NumThumbsDown: 0,
      HiddenInChallenges: hiddenInChallenges,
      Ratings: {},
      TagIDs: mapTags,
      TagNames: tagNames,
      TagFreqs: "",
      PlayCount: 0,
      ClearCount: 0,
      ClearRate: 0,
      FavoriteCount: 0,
      DeathCount: 0,
      PlayerCount: 0,
      BestTimeUserID: 0,
      BestTimeUsername: "",
      BestTimePlaytime: 0,
      MyBestPlaytime: 0,
      FirstClearUserID: 0,
      FirstClearUsername: "",
      MapData: mapData,
      MapReplay: "",
      Played: false,
      Clear: false,
      FullClear: false,
    });
    res.json({
      MapCode: mc,
    });
    console.log(`ADDED MAP ${mapName} (${mc})`);
  }
});

const allowedHats = [0, 1, 6, 7, 9, 10, 16, 22, 24, 37, 46, 48];

app.post(`/api/v1/user/:id`, async (req, res) => {
  req.params.id = Number(req.params.id);

  if (req.user.ID !== req.params.id && !req.user.Admin) {
    res.status(403);
    res.send(`You can't edit other users's profiles!`);
    return;
  }

  try {
    if (
      req.user.Admin &&
      typeof JSON.parse(Object.keys(req.body)[0])["BanReason"] === "number"
    ) {
      await users.updateOne(
        {
          ID: req.params.id,
        },
        {
          $set: {
            Banned:
              JSON.parse(Object.keys(req.body)[0])["BanReason"] === -1
                ? false
                : true,
          },
        }
      );

      let u = await users.findOne({ ID: req.params.id });
      if (u) {
        adminWebhookMessage(
          `${req.user.Username} ${
            JSON.parse(Object.keys(req.body)[0])["BanReason"] === -1
              ? "unbanned"
              : "banned"
          } ${u.Username}`
        );
        u = utils.cleanUser(u);
        res.json(u);
      } else {
        res.sendStatus(404);
      }
      return;
    }

    let data = JSON.parse(Object.keys(req.body)[0]);
    let fixedData = {
      // Makes it so people can't exploit it to like make themselves an admin
      Country: data.Country || 0,
      PantsColor: data.PantsColor || 0,
      HatSpr: data.HatSpr || 0,
      HairColor: data.HairColor || 0,
      CapeColor: data.CapeColor || 0,
      ShoesColor: data.ShoesColor || 0,
      ShirtColor: data.ShirtColor || 0,
      SkinColor: data.SkinColor || 0,
    };

    if (!req.user.Admin && !allowedHats.includes(fixedData.HatSpr)) {
      res.sendStatus(400);
      return;
    }

    if (Object.keys(req.body)[0].length < 500) {
      await users.updateOne(
        {
          ID: req.params.id,
        },
        {
          $set: fixedData,
        }
      );

      webhookMessage(`${req.user.Username} updated their looks`);

      console.log(fixedData.HatSpr);

      let u = await users.findOne({ ID: Number(req.params.id) });
      if (u) {
        u = utils.cleanUser(u);
        res.json(u);
      } else {
        res.sendStatus(404);
      }
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

app.get(`/api/v1/challenges`, (req, res) => {
  res.status(501).send(`Haven't been bothered to add challenges yet`);
});

app.post(`/api/v1/map/:id/rating`, async (req, res) => {
  let m = await maps.findOne({ ID: Number(req.params.id) });

  if (m) {
    if (Object.keys(req.body)[0] == `{"Rating":5}`) {
      if (m.Ratings[req.user.ID]) {
        if (m.Ratings[req.user.ID] == 1) {
          m.Ratings[req.user.ID] = 5;
          m.NumThumbsUp++;
          m.NumThumbsDown--;
        }
      } else {
        m.Ratings[req.user.ID] = 5;
        m.NumThumbsUp++;
      }
    } else {
      if (m.Ratings[req.user.ID]) {
        if (m.Ratings[req.user.ID] == 5) {
          m.Ratings[req.user.ID] = 1;
          m.NumThumbsUp--;
          m.NumThumbsDown++;
        }
      } else {
        m.Ratings[req.user.ID] = 1;
        m.NumThumbsDown++;
      }
    }

    await maps.updateOne(
      { ID: m.ID },
      {
        $set: {
          Ratings: m.Ratings,
          NumThumbsUp: m.NumThumbsUp,
          NumThumbsDown: m.NumThumbsDown,
        },
      }
    );

    res.json({
      Exists: true,
      UserMap: m,
      TagIDs: m.TagIDs,
      TagNames: m.TagNames,
    });
  } else {
    console.log(m);
    res.sendStatus(404);
  }
});

// ADMIN

app.post(`/api/v1/map/:id/shadow`, async (req, res) => {
  let m = await maps.findOne({ ID: Number(req.params.id) });
  if (m && req.user.Admin) {
    if (req.query.shadowed == "1") {
      m.Shadow = true;
    } else {
      m.Shadow = null;
    }

    console.log(
      await maps.updateOne(
        { ID: m.ID },
        {
          $set: {
            Shadow: m.Shadow,
          },
        }
      )
    );
    res.send(`Shadowed/unshadowed`);

    adminWebhookMessage(
      `${req.user.Username} changed the shadow status of ${m.Name}`
    );
  } else {
    res.sendStatus(404);
  }
});

app.post(`/api/v1/adminmessage`, async (req, res) => {
  if (!req.user.Admin) {
    res.sendStatus(403);
    return;
  }

  let s = req.body[Object.keys(req.body)[0]].split(`\n`);
  let checking = 0;
  let user = 0;
  let message = ``;
  for (let i = 0; i < s.length; i++) {
    if (!(s[i] == `` || s[i].includes(`-----`) || s[i].includes(`clear`))) {
      if (s[i].includes(`forUserID`)) {
        checking = 2;
      } else if (s[i].includes(`name="message"`)) {
        checking = 1;
      }

      switch (checking) {
        case 1:
          message = s[i];
          break;
        case 2:
          user = s[i];
          break;
      }
    }
  }

  let u = await users.findOne({ ID: Number(user) });

  if (u) {
    u.Notifications.push({
      ID: Math.floor(Math.random() * 100000),
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
      DeletedAt: null,
      ForUserID: u.ID,
      Type: 4,
      IsRead: false,
      MapID: 0,
      NotifData: JSON.stringify({ Message: message }),
    });

    adminWebhookMessage(
      `${req.user.Username} messaged ${u.Username} "${message.replace(
        `\n`,
        ``
      )}"`
    );

    await users.updateOne(
      {
        ID: user,
      },
      {
        $set: {
          Notifications: u.Notifications,
        },
      }
    );

    res.send(`Sent`);
  } else {
    res.sendStatus(404);
  }
});

app.post(`/api/v1/reports`, (req, res) => {
  let s = req.body[Object.keys(req.body)[0]].split(`\n`);
  let checking = 0;
  let user = 0;
  let message = ``;
  for (let i = 0; i < s.length; i++) {
    if (!(s[i] == `` || s[i].includes(`-----`) || s[i].includes(`clear`))) {
      if (s[i].includes(`user_id`)) {
        checking = 2;
      } else if (s[i].includes(`name="content"`)) {
        checking = 1;
      } else if (s[i].includes(`name="report_type"`)) {
        checking = 0;
      }

      switch (checking) {
        case 1:
          message = s[i];
          break;
        case 2:
          user = s[i];
          console.log(s[i]);
          break;
      }
    }
  }

  adminWebhookMessage(
    `${req.user.Username} reported user/level ID ${user} for ${message}`
  );

  res.send(`Sent`);
});

app.all(`*`, (req, res) => {
  res.sendStatus(501);
});

app.listen();
