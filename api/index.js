const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const path = require("path")
const staticpath = path.join(__dirname, "../client")
const ordersuccesspath = path.join(__dirname, "../client/successOrder.html")
const reviewsuccesspath = path.join(__dirname, "../client/successReview.html")
const contactsuccesspath = path.join(__dirname, "../client/successContact.html")



const aboutgetpath = path.join(__dirname, "../client/about.html")
const featuregetpath = path.join(__dirname, "../client/feature.html")
const homegetpath = path.join(__dirname, "../client/index.html")
const contactgetpath = path.join(__dirname, "../client/contact.html")
const ordergetpath = path.join(__dirname, "../client/order.html")
const productgetpath = path.join(__dirname, "../client/product.html")
const reviewsgetpath = path.join(__dirname, "../client/testimonials.html")
const checkoutgetpath = path.join(__dirname, "../client/checkout.html")
const unstichedgetpath = path.join(__dirname, "../client/unstiched.html")
const stichedgetpath = path.join(__dirname, "../client/stiched.html")


const multer = require("multer")
let Filename = ""
app.use(express.static("./"))

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./Images");
    },
    filename: (req, file, cb) => {
      Filename = Date.now() + path.extname(file.originalname)
      console.log(Filename);
      cb(null, Filename);
    }
  });
// const getpath = path.join(__dirname, "../client/successContact.html")
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
require('dotenv').config();
const upload = multer({storage})
// Connect to MongoDB Atlas
mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.vbcrt.mongodb.net/?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });




  const visitorSchema = new mongoose.Schema({
    route: String,
    views: Number, // Add a views field
    date: {
      type: Date,
      default: Date.now,
    },
  });
  const Visitor = mongoose.model('Visitor', visitorSchema);


  const ProductsSchema = new mongoose.Schema({
    productId:Number,
    title: String,
    img : Array,
    price : Number,
    category : String
   
  });
  const Products = mongoose.model('product', ProductsSchema);


  app.use(async (req, res, next) => {
    console.log("route")
    const route = req.path;
    // Only record visits for the specified routes
    if (['/', '/order', '/contact', '/features', '/about', '/return', '/reviews', '/checkout'].includes(route)) {
      // "/" is the homepage route

      try {
        const existingVisitor = await Visitor.findOne({ route });
        
        if (existingVisitor) {
          existingVisitor.views += 1;
          existingVisitor.date = new Date();
          await existingVisitor.save();
          
        } else {
          const newVisitor = new Visitor({
            route,
            views: 1,
            date: new Date(),
          });
          await newVisitor.save();
        }
      } catch (error) {
        console.error('Error saving visitor data:', error);
      }
    }
  
    next();
  });
// Create schema and model
const entrySchema = new mongoose.Schema({
  PId : String,
  quantity : String,
  size : String,
  name: { type: String},
  phone: { type: String},
  email: { type: String},
  state: String,
  city: { type: String},
  postcode: String,
  streetaddress: { type: String},
  date: { type: Date, default: Date.now },
  message: String,
  order: Array,
});

const Entry = mongoose.model('Entry', entrySchema);


const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String,
    date: { type: Date, default: Date.now },
  });
  
const Contact = mongoose.model('Contact', contactSchema);
  
app.use(express.static(staticpath));

const reviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  review: String,
});

const Review = mongoose.model('Review', reviewSchema);

// Create a POST request to store data
app.post('/order', (req, res) => {
  const {PId,quantity,size, name, phone, email, state, city, postcode, streetaddress, message, order } = req.body;
// console.log(req.body)
  const entry = new Entry({
    PId,quantity,size,
    name,
    phone,
    email,
    state,
    city,
    postcode,
    streetaddress,
    message,
    order
  });

entry.save()
.then(result => {
res.send("ok")

})
.catch(error => {
  res.status(500).json({ error: error.message });
});

});
app.post('/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
  
    const contact = new Contact({
      name,
      email,
      subject,
      message,
    });
  
    contact.save()
      .then(result => {
        res.sendFile(contactsuccesspath)

      })
      .catch(error => {
        res.status(500).json({ error: error.message });
      });
  });
app.post('/addproduct', upload.array("image", 5), async(req, res) => {
  const allProduct = await Products.find({})
  let productId = allProduct.length + 224363234
    const { title, price, category } = req.body;
    const filenames = req.files.map((file) => file.filename);
    const product = new Products({
      productId,
      title,
      img : filenames.map((filename) => ({ filename })),
      price,
      category
    });
  
    const Save = await product.save()
    if(Save) {
      console.log(Save)
      res.send("successfull")
    }
     
  });
app.get("/products", async (req,res)=>{
  const product = await Products.find({})
res.send(product)
})

app.get("/product-:id", (req,res)=>{
  res.sendFile(productgetpath)
})
app.get("/checkout-:id", (req,res)=>{
  res.sendFile(checkoutgetpath)
})
app.get("/unstiched-collection", (req,res)=>{
  res.sendFile(unstichedgetpath)
})
app.get("/stiched-collection", (req,res)=>{
  res.sendFile(stichedgetpath)
})
  app.post('/review', (req, res) => {
    const { name, rating, review } = req.body;
    const newReview = new Review({
      name,
      rating,
      review,
    });
  
    newReview.save()
      .then(result => {
        res.sendFile(reviewsuccesspath)

      })
      .catch(error => {
        res.status(500).json({ error: error.message });
      });
  });
app.get('/allorder', async (req, res)=> {
  const data = await Entry.find({});
  res.send(data)
  });

  app.get('/allreviews', (req, res) => {
    Review.find()
      .then(reviews => {
        res.json(reviews);
      })
      .catch(error => {
        res.status(500).json({ error: error.message });
      });
  });
  app.get('/allcontacts', (req, res) => {
    Contact.find()
      .then(contacts => {
        res.json(contacts);
      })
      .catch(error => {
        res.status(500).json({ error: error.message });
      });
  });
  // DELETE request to delete data by ID
app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
  
    Entry.findByIdAndRemove(id)
      .then(data => {
        if (!data) {
          return res.status(404).json({ message: 'Data not found' });
        }
        res.json({ message: 'Data deleted successfully' });
      })
      .catch(error => {
        res.status(500).json({ error: error.message });
      });
  });
app.delete('/deletereview/:id', (req, res) => {
    const id = req.params.id;
  
    Review.findByIdAndRemove(id)
      .then(data => {
        if (!data) {
          return res.status(404).json({ message: 'Data not found' });
        }
        res.json({ message: 'Data deleted successfully' });
      })
      .catch(error => {
        res.status(500).json({ error: error.message });
      });
  });
app.delete('/deletecontact/:id', (req, res) => {
    const id = req.params.id;
  
    Contact.findByIdAndRemove(id)
      .then(data => {
        if (!data) {
          return res.status(404).json({ message: 'Data not found' });
        }
        res.json({ message: 'Data deleted successfully' });
      })
      .catch(error => {
        res.status(500).json({ error: error.message });
      });
  });


  app.get("/",(req,res)=>{
   res.sendFile(homegetpath)
  }) 
 app.get("/about",(req,res)=>{
  res.sendFile(aboutgetpath)
 }) 
 app.get("/features",(req,res)=>{
  res.sendFile(featuregetpath)
 }) 
 app.get("/return",(req,res)=>{
  res.sendFile(contactgetpath)
 }) 
 app.get("/contact",(req,res)=>{
  res.sendFile(contactgetpath)
 }) 
 app.get("/order",(req,res)=>{
  res.sendFile(ordergetpath)
 }) 
 app.get("/reviews",(req,res)=>{
  res.sendFile(reviewsgetpath)
 }) 
 app.get("/checkout",(req,res)=>{
  res.sendFile(checkoutgetpath)
 }) 
 app.get("/success-order",(req,res)=>{
 res.sendFile(ordersuccesspath)
 }) 

 app.get('/visitor-stats/:route/:interval', async (req, res) => {
  const { route, interval } = req.params;
  let newroute = `/${route}`
  if(route == "home"){
    newroute = "/"
  }
console.log(newroute)

  const dateQuery = {}; // Set your date query based on the interval (daily, weekly, etc.)

  try {
    const visitors = await Visitor.find({route : newroute}).sort({ timestamp: 'asc' });
    res.json(visitors);
    console.log(visitors)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
