const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wn7mjif.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const db = client.db("plantDB");
    const plantCollection = db.collection("plants");
    const myPlantCollection = db.collection("myPlants");
    const usersCollection = client.db('plantDB').collection('users');

    // GET all plants (global)
    app.get('/plants', async (req, res) => {
      const result = await plantCollection.find().toArray();
      res.send(result);
    });

    // GET single plant (global)
    app.get('/plants/:id', async (req, res) => {
      const id = req.params.id;
      const plant = await plantCollection.findOne({ _id: new ObjectId(id) });
      plant ? res.send(plant) : res.status(404).send({ message: "Not found" });
    });

    // POST new plant to global
    app.post('/plants', async (req, res) => {
      const result = await plantCollection.insertOne(req.body);
      res.send(result);
    });

    // PUT update global plant (optional, for admins)
    app.put('/plants/:id', async (req, res) => {
      const result = await plantCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body },
        { upsert: true }
      );
      res.send(result);
    });

    // POST to MyPlants
    app.post('/myPlants', async (req, res) => {
      const result = await myPlantCollection.insertOne(req.body);
      res.send(result);
    });

    // GET all MyPlants
    app.get('/myPlants', async (req, res) => {
      const result = await myPlantCollection.find().toArray();
      res.send(result);
    });

    // GET single MyPlant
    app.get('/myPlants/:id', async (req, res) => {
      const result = await myPlantCollection.findOne({ _id: new ObjectId(req.params.id) });
      result ? res.send(result) : res.status(404).send({ message: "Not found" });
    });

    // PUT update MyPlant (✅ important)
    app.put('/myPlants/:id', async (req, res) => {
      const result = await myPlantCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body },
        { upsert: false }
      );
      res.send(result);
    });

    // DELETE from MyPlants
    app.delete('/myPlants/:id', async (req, res) => {
      const result = await myPlantCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.send(result);
    });



    // User related APIs
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })


        app.post('/users', async (req, res) => {
            const userProfile = req.body;
            console.log(userProfile)
            const result = await usersCollection.insertOne(userProfile);
            res.send(result);
        })

        app.patch('/users', async(req, res) =>{
            const {email, lastSignInTime} = req.body;
            const filter = {email: email}
            const updatedDoc = {
                $set: {
                    lastSignInTime: lastSignInTime
                }
            }

            const result = await usersCollection.updateOne(filter, updatedDoc)
            res.send(result);
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })
        

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB");
  } finally {
    // Keeping DB connection open
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Plant Care API is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
