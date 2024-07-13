const mongoose = require("mongoose");

// setting connection of mongo db



mongoose.connect("mongodb://127.0.0.1:27017/empForm",{

})
.then(()=>{
    console.log("Successfully connected");
    })
.catch((error)=>{
    console.log("Something is wrong");
})


    

