require('dotenv').config()
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const auth = require("./middleware/auth");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs")
// import models
require("./db/conn");
const empCollcetion = require("./models/model");
const port = process.env.PORT || 3000;

const path = require("path");

const template_path = path.join(__dirname, "../template/views");

const publicPath = path.join(__dirname, "../template/views");
app.use(express.static(publicPath)); // isse kya hoga hamari css file bhi add ho jayegi

app.set("view engine", "hbs");
app.set("views", template_path);

app.use(express.urlencoded({ extended: false }));

console.log(process.env.SECRET_KEY);


app.get("/", (req, res) => {
  res.render("signup");
});


app.get("/service",auth, (req, res) => {
  // console.log("this is secret code" ,req.cookies.jwt);
  res.render("service");
});


app.get("/logout", auth, async(req, res)=>{
  try {
    // console.log(req.user);

    // for single logout
    req.user.tokens = req.user.tokens.filter((currElement)=>{
      return currElement.token !== req.token
    })

    // logout from all device
    // req.user.tokens = [];


    res.clearCookie("jwt");
    console.log("logout successfully");
    await req.user.save();
    return res.render("login");
  } catch (error) {
    res.status(500).send(error);
    
  }
})




app.post("/empdata", async (req, res) => {
  const password = req.body.password;
  const cpassword = req.body.cpassword;
  if (password === cpassword) {
    const empData = new empCollcetion({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      cpassword: req.body.cpassword,
    } 
    );

    const token = await empData.generateAuthToken();
    // console.log("token part", token);

    res.cookie("jwt",token, {
      expires:new Date(Date.now() + 80000),
      httpOnly:true
    });
    // console.log(token)

    const postData = await empData.save();
    // res.send(postData);
    res.status(201).render("home");
  }
  else{
    res.send("Password and confirm password are not matching");
}
});

app.get("/login", (req, res) => {
    res.render("login");
  });
app.get("/signup", (req, res) => {
    res.render("signup");
  });

app.post("/loginPage", async (req, res) => {
  try{
    const email = req.body.email;
    const password = req.body.loginpassword;

    const getEmail = await empCollcetion.findOne({ email: email})

    //MATCHING OF THE PASSWORD
    const isMatch = await bcrypt.compare(password, getEmail.password)    //ie mail sahi hai to mail mila aur us mail ka password mail.password se mila , ab user entered password aur presnet data wala passworfd match hua tro open kr dega home page

    //token generate for login part
    const token = await getEmail.generateAuthToken();
    console.log("Token part", token);


    res.cookie("jwt",token, {
      expires:new Date(Date.now() + 50000),
      httpOnly:true,
      // secure:true
    });

    // res.send(getEmail);
    // res.send(getEmail.password);
    if(isMatch){
      res.status(201).render("home");
    }
    else{
      res.send("Invalid login details")
    }


  }catch(e){
    res.send("Invalid login details")
  }
  });


app.listen(port, () => {
  console.log("Listening to the port", port);
});
