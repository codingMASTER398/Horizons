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

  /*let c = users.find();
  while (await c.hasNext()) {
    object = await c.next();
    await users.updateOne({_id: object._id}, {$set: {actualID: object.ID, ID: Math.round(Math.random()*999999999999999)}});
    console.log(`Updated ${object.Username}`)
  }*/

  let c = maps.find();
  while (await c.hasNext()) {
    object = await c.next();

    let u = await users.findOne({ actualID: object.CreatorId });

    await maps.updateOne({ _id: object._id }, { $set: { CreatorId: u.ID } });
    console.log(`Updated ${object.Name}`);
  }
})();
