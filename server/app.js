const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 8000;
const cors = require("cors");
const jwt = require("jsonwebtoken"); //9.1 require jsonwebtoken
//3.11 This is your test secret API key.
const stripe = require("stripe")(process.env.PAYMENT_SECRET);

//middleware
app.use(cors());
app.use(express.json());

//9.3 Verify token
const verifyJWT = (req, res, next) => {
  //tokens are stored in headers so
  const authorization = req.headers.authorization;
  //if not authorized then return unauthorized
  if (!authorization) {
    return res.status(401).send({ message: "Invalid Authorization" });
  }
  //get token and do authorization, and bearer token comes with bearer key so need to split itand give index [1]
  const token = authorization?.split(" ")[1];
  //verify it
  jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" }); //token is expired
    }
    req.decoded = decoded;
    next();
  }); // so now when applied this jwt token on any route it will first ask for authorization:
};

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

    //add admin verification and extract the verification
    //implement jwt token authentication -> go to jwt.io ->libraries->node js or just seach jwt token and explore npm package and get code npm i jsonwebtoken
    //->copy and paste ->  require jwtwebtoken -> set jwt token 1. generate token to generate token first generate token then verify it
    //write post request and define "/app/set-token" when hit this url, in this define
    ////const user = req.body;
    //then creat token const token = jwt.sign(user, then define access token): to generate token -> nodej crypto random bytes: copy require('crypt')radomebytes and paste in terminal and u get secret code copy it
    //and past it in .env ACCESS_SECRET = "" AAND THEN ADD expiration: from node npm see ,{expiresIn:'24h'} aster one dat it will exprire and then send it res.send({token})
    //after token is generate then again go to top
    //->verify token: if u have they u must veryify
    //const verifyJwt = (req,res, next)=>{
    //to verifyin documentation we get .sign method,
    //const authorization = req.headers.authorization; we get it from headers
    //if not there then return res.status(401).send({message:"Invalid authorization"})
    //then define const and get token and it will have to do authorization and will have to split it(' ').and then start index no.1 [1]
    // then we have to verify it : jwt.verify(token, process.env.ASSESS_Secret,(err, decode)=>{
    //   if error the return err and  and in msg if exprired token then ({message:'FOrbidden access'
    //     req.decoded = decoded;
    //     next(); call next
    //   })
    // })

    //      }

    //9: Admin verification
    //Add Admin verificationJWT TOken Verification

    //9.2 To generate token
    app.post("/api/set-token", async (req, res) => {
      const user = req.body;
      //generate token : from npm documenttation ,
      //here we define user and access token, to generate access token we give: 1.node  2.require('crypto').randomBytes(64).toString('hex') copy this and add in env
      //and then expiration
      const token = jwt.sign(user, process.env.ACCESS_SECRET, {
        expiresIn: "24h",
      });
      res.send({ token });
    }); //this create jwt token to search jwt token and check it: we have to keep token in authorization and choose bearer token

    //10 middleware to check if admin delete user or instructor is there or not
    //need two middleware: two define middleweare need to pass thre parameters
    //10.1 middleware for admin
    async function verifyAdmin(req, res, next) {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      //if role = admin then go next else err
      if (user.role === "admin") {
        next();
      } else {
        res.status(401).send({ message: "Unauthorized access" });
      }
    }
    //delte-user:id, put updat user, change-status, adminstats
    //new-class post:, get('classes/:email), updated-classes:id,
    //jwt: addtocart, cartitem, cart email, deletecart, payment-info, enroled-classes
    //10.2 middleware for instructor
    async function verifyInstructor(req, res, next) {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      //if role = instructor then go next else err
      if (user.role === "instructor") {
        next();
      } else {
        res.status(401).send({ message: "Unauthorized access" });
      }
    }

    //8 User Routes
    //8.1 Get new users
    app.post("/new-user", async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    //8.2 Get user details
    app.get("/users", async (req, res) => {
      const result = await userCollection.find({}).toArray();
      res.send(result);
    });

    //8.3 Get user details by ID
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne({ query });
      res.send(result);
    });

    //8.4 get user details by mail
    app.get("/users/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne({ query });
      res.send(result);
    });

    //8.5 Delete user by id
    app.delete("/delete-user/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    //8.6 Update user by id
    app.put("/update-user/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true }; //because usert is true, so if no document match query mongodb creates new document
      const updateDoc = {
        $set: {
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          address: updatedUser.address,
          about: updatedUser.about,
          photoUrl: updatedUser.photoUrl,
          skills: updatedUser.skills ? updatedUser.skills : null,
          // phone:updatedUser.phone,
        },
      };

      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    //classes routes
    //1: to add new classes
    app.post("/new-class", verifyJWT, verifyInstructor, async (req, res) => {
      const newClass = req.body; //want data from body
      const result = await classesCollection.insertOne(newClass);
      res.send(result);
    });

    //2: to get data based on approved clasees
    app.get("/classes", verifyJWT, async (req, res) => {
      //we want to show data based on only approved courses
      const query = { status: "approved" };
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    });

    //3: get course by instructor email:
    app.get(
      "/classes/:email",
      verifyJWT,
      verifyInstructor,
      async (req, res) => {
        //get email through req.body.params
        const email = req.params.email;
        const query = {
          instructorEmail: email,
        };
        const result = await classesCollection.find(query).toArray();
        res.send(result);
      }
    );

    //4: Manage classes get all classes
    app.get("/classes-manage", async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    });

    //5: update classes status and reason: using patch as we want to update specific field based on id
    app.patch(
      "/classes-status/:id",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
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
      }
    );

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
    app.put(
      "/update-class/:id",
      verifyJWT,
      verifyInstructor,
      async (req, res) => {
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
      }
    );

    //CART ROUTES ............... IT WILL have id, name, classId, Email

    //2.1 Add to Cart
    app.post("/add-to-cart", verifyJWT, async (req, res) => {
      const newCartItem = req.body;
      const result = await cartCollection.insertOne(newCartItem);
      res.send(result);
    });

    //2.2 Get Cart Item by class id
    app.get("/cart-item/:id", verifyJWT, async (req, res) => {
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
    app.get("/cart/:email", verifyJWT, async (req, res) => {
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
    app.delete("/delete-cart-item/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = {
        classId: id,
      };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    //3 Payment Routes: for this need to create account on stripe first
    //from strip docs, in payments section we get code to connect .
    // https://docs.stripe.com/payments/quickstart
    // install stripe (npm install --save stripe).
    //from home page hit developers ->api keys ->

    //3.2
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body; // as we take price
      const amount = parseInt(price) * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "inr",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    //3.3: post info to DB
    app.post("/payment-info", verifyJWT, async (req, res) => {
      const paymentInfo = req.body;
      const classesId = req.body.classesId;
      const userEmail = paymentInfo.userEmail;
      //if classid is given trhoudh query
      const singleClassId = req.query.classId;
      let query;
      //get query basedon condition: if classId given then give info of that but is not given then get all documets classIds in classId
      if (singleClassId) {
        query = { classId: singleClassId, userMail: userEmail };
      } else {
        query = { classId: { $in: classesId } };
      }

      //get all documents in the classesCollection whose _id is present in the classesId array.
      //this is condition
      const classesQuery = {
        _id: { $in: classesId.map((id) => new ObjectId(id)) },
      };
      //get classes having ids
      const classes = await classesCollection.find(classesQuery).toArray();

      const newEnrolledData = {
        userEmail: userEmail,
        classesId: classesId.map((id) => new ObjectId(id)),
        transactionId: paymentInfo.transactionId,
      };

      const updatedResult = await classesCollection.updateMany(
        classesQuery,
        {
          $set: {
            totalEnrolled:
              classes.reduce(
                (total, current) => total + current.totalEnrolled,
                0
              ) + 1 || 0,

            availableSeats:
              classes.reduce(
                (total, current) => total + current.availableSeats,
                0
              ) - 1 || 0,
          },
        },
        { upsert: true }
      );

      const enrolledResult = await enrolledCollection.insertOne(
        newEnrolledData
      );

      const deletedResult = await cartCollection.deleteMany(query);

      const paymentResult = await paymentCollection.insertOne(paymentInfo);
      res.send({ paymentResult, deletedResult, enrolledResult, updatedResult });
    });

    //3.4 get payment history by email
    app.get("/payment-history/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const result = await paymentCollection
        .find(query)
        .sort({ data: -1 })
        .toArray(); //sort by date
      res.send(result);
    });

    //3.4 get payment history length
    app.get("/payment-history-length/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const total = await paymentCollection.countDocuments(query);
      res.send({ total }); //passed in as object
    });

    //4. Enrollment Routes
    //4.1 get enrolled classed based on total enrollment
    app.get("/popular-classes", async (req, res) => {
      const result = await classesCollection
        .find()
        .sort({ totalEnrolled: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });
    //4.2
    app.get("/popular-instructors", async (req, res) => {
      const pipeline = [
        {
          $group: {
            //group by id
            _id: "$instructorEmail",
            totalEnrolled: { $sum: "$totalEnrolled" },
          },
        },
        {
          //lookup is like join it lets us take values from another collection
          $lookup: {
            from: "users", // from another collection
            localField: "_id",
            foreignField: "email",
            as: "instructor",
          },
        },
        {
          $project: {
            _id: 0,
            instructor: {
              $arrayElemAt: ["$instructor", 0],
            },
            totalEnrolled: 1,
          },
        },
        {
          $sort: {
            totalEnrolled: -1,
          },
        },
        {
          $limit: 8,
        },
      ];
      const result = await classesCollection.aggregate(pipeline).toArray();
      res.send(result);
    });

    //5 Admin stats
    //5.1 get admin stats(approved classes, pending classes, instructor, totalClasses, totalEnrolled)
    app.get("/admin-stats", verifyJWT, verifyAdmin, async (req, res) => {
      const approvedClasses = (
        await classesCollection.find({ status: "approved" }).toArray()
      ).length;
      const pendingClasses = (
        await classesCollection.find({ status: "pending" }).toArray()
      ).length;
      const instructors = (
        await userCollection.find({ role: "instructor" }).toArray()
      ).length;
      const totalClasses = (await classesCollection.find().toArray()).length;
      const totalEnrolled = (await enrolledCollection.find().toArray()).length;

      const result = {
        approvedClasses,
        pendingClasses,
        instructors,
        totalClasses,
        totalEnrolled,
      };
      res.send(result);
    });

    //6 Instructors info
    //6.1 get all instructors info
    app.get("/instructors", async (req, res) => {
      const result = await userCollection
        .find({ role: "instructor" })
        .toArray();
      res.send(result);
    });

    //6.2 check if anyone enrolled in class
    app.get("/enrolled-classes/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const pipeline = [
        {
          $match: query,
        },
        {
          $lookup: {
            from: "classes",
            localField: "classesId",
            foreignField: "_id",
            as: "classes",
          },
        },
        {
          $unwind: "$classes",
        },
        {
          $lookup: {
            from: "users",
            localField: "classes.instructorEmail",
            foreignField: "email",
            as: "instructor",
          },
        },
        {
          $project: {
            _id: 0,
            instructor: {
              $arrayElemAt: ["$instructor", 0],
            },
            classes: 1,
          },
        },
      ];
      const result = await enrolledCollection.aggregate(pipeline).toArray();
      res.send(result);
    });

    //7 Applied for instructor
    //7.1 apply for instructor
    app.post("/assign-instructor", async (req, res) => {
      const data = req.body;
      const result = await appliedCollection.insertOne(data);
      res.send(result);
    });

    //7.2 get applied instructor data by email
    app.get("/applied-instructors/:email", async (req, res) => {
      const email = req.params.email;
      const result = await appliedCollection.findOne({ email });
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
