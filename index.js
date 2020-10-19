const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const fileUpload = require("express-fileupload");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const fs = require("fs-extra");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4xssl.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.static("images"));

const port = 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const ordersCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("orders");
  const servicesCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("services");
  const reviewsCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("reviews");
  const adminPanelCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("adminPanel");

  app.post("/addServicesData", (req, res) => {
    const services = req.body;
    servicesCollection.insertMany(services).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.get("/services", (req, res) => {
    servicesCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addOrder", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const category = req.body.category;
    const description = req.body.description;
    const price = req.body.price;
    
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    const image = {
      contentType:file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    ordersCollection
      .insertOne({ name, email, category, description, price, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.get("/service", (req, res) => {
    const email = req.query.email;
    ordersCollection.find({ email: email }).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/orders", (req, res) => {
    ordersCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addReviewData", (req, res) => {
    const newReview = req.body;
    reviewsCollection.insertMany(newReview).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/reviews", (req, res) => {
    reviewsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/review", (req, res) => {
    const newReview = req.body;
    reviewsCollection.insertOne(newReview).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
     
      const newImg = file.data;
      const encImg = newImg.toString("base64");

      const image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, "base64"),
      };

      servicesCollection
        .insertOne({ title, description, image })
        .then((result) => {
            res.send(result.insertedCount > 0);
        });
     });

  app.post("/admin", (req, res) => {
    const newAdmin = req.body;
    adminPanelCollection.insertOne(newAdmin).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    adminPanelCollection.find({ email: email }).toArray((err, admin) => {
      res.send(admin.length > 0);
    });
  });

 
});

app.listen(process.env.PORT || port);
