const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oxbfj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const doctors_DB = client.db('doctors_DB');
    const patient_info = doctors_DB.collection('patient_info');
    app.post('/appointment', async (req, res) => {
      const fullPatientInfo = req.body;
      const result = await patient_info.insertOne(fullPatientInfo);
      res.send(JSON.stringify(result));
    });
    app.get('/appointments', async (req, res) => {
      const email = req.query.email;
      const date = new Date(req.query.date).toLocaleDateString();
      const query = { email: email, date: date };
      const cursor = patient_info.find(query);
      const appointments = await cursor.toArray();
      res.json(appointments);
    });

    const usersCollection = doctors_DB.collection('users');

    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.json(result);
    });

    app.put('/users', async (req, res) => {
      const newUser = req.body;
      const filter = { email: newUser.email };
      const options = { upsert: true };
      const updateDoc = { $set: newUser };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.json(user);
    });
  } finally {
    // await client.close()
  }
}
run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('Hello Doctors Portal!');
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
