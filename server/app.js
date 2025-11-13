const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 8000;
const cors = require("cors");

//middleware
app.use(cors());
app.use(express.json());

//this is for local mongodb
const { ObjectId } = require("mongodb");
// const url = process.env.mongoUrl;
// const client = new MongoClient(url);

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@yoga-mastery.w2nc2vw.mongodb.net/?appName=yoga-mastery`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDb() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    await client.connect();

    //Create a database and collection
    const database = client.db("yogamasterydb");
    const userCollection = database.collection("users");
    const classesCollection = database.collection("classes");
    const cartCollection = database.collection("cart");
    const paymentCollection = database.collection("payments");
    const enrolledCollection = database.collection("enrolled");
    const appliedCollection = database.collection("applied");

    //classes routes
    //1: to add new classes
    app.post("/new-class", async (req, res) => {
      const newClass = req.body; //want data from body
      const result = await classesCollection.insertOne(newClass);
      res.send(result);
    });

    //2: to get data based on approved clasees
    app.get("/classes", async (req, res) => {
      //we want to show data based on only approved courses
      const query = { status: "approved" };
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    });

    //3: get course by instructor email:
    app.get("/classes/:email", async (req, res) => {
      //get email through req.body.params
      const email = req.params.email;
      const query = {
        instructorEmail: email,
      };
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    });

    //4: Manage classes get all classes
    app.get("/classes-manage", async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    });

    //5: update classes status and reason: using patch as we want to update specific field based on id
    app.patch("/classes-status/:id", async (req, res) => {
      const id = req.params.id;
      //need to take status and reson from req.body
      const status = req.body.status;
      const reason = req.body.reason;
      const query = {
        _id: new ObjectId(id),
      };
      //to update  [ updateOne(condition, set:values change) ]
      const result = await classesCollection.updateOne(query, {
        $set: {
          status: status,
          reason: reason,
        },
      });
      res.send(result);
    });

    //6 get approved classes
    app.get("/approved-classes", async (req, res) => {
      const query = { status: "approved" };
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    });

    //7 get single class details
    app.get("/class/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    });

    //8 update class details all data
    app.put("/update-class/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classesCollection.updateOne(query, {
        $set: {
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          availableSeats: req.body.availableSeats,
          videoLink: req.body.videolink,
          status: "pending",
        },
      });
      res.send(result);
    });

    //CART ROUTES ............... IT WILL have id, name, classId, Email

    //2.1 Add to Cart
    app.post("/add-to-cart", async (req, res) => {
      const newCartItem = req.body;
      const result = await cartCollection.insertOne(newCartItem);
      res.send(result);
    });

    //2.2 Get Cart Item by class id
    app.get("/cart-item/:id", async (req, res) => {
      const id = req.params.id;
      // const email = req.body.email;
      const query = {
        classId: id,
        // Email: email,
      };
      //mongodb shell we can directly write findOne({condition}{projection eg. classID:1}) but in mongodb driver we have to give projections:{projectionData}
      const result = await cartCollection.findOne(query, {
        projection: { classId: 1 },
      });
      res.send(result);
    });

    //2.3 cart info by using user email
    app.get("/cart/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userMail: email };
      const carts = await cartCollection.find(query, {
        projection: { classId: 1 },
      });

      //now we want to show show class details that are in user's cart so we
      //first extract class ids and then get matching class info
      const classIds = carts.map((cart) => new ObjectId(cart.classId));
      const queryTwo = { _id: classIds }; //find all ids whose data is in the classIds list
      const result = await classesCollection.find(queryTwo).toArray();
      res.send(result);
    });

    //2.4 delete cart item
    app.delete("/delete-cart-item/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        classId: id,
      };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}

connectDb().catch(console.dir);

//Health Check
app.get("/", (req, res) => {
  res.send("Health Ok");
});
app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
