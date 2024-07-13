const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const empSchema = new mongoose.Schema({
    name : {
        type:String,
        required:true,

    },
    email :{
        type:String,
        unique: true,
        lowercase: true,
        trim: true,
        required:true
    },
    phone:{
        type:Number,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true
    },
    tokens:[{
        token:{
        type:String,
        required:true
        }
    }]
});

//generating tokens
empSchema.methods.generateAuthToken = async function(){
    try {
        // console.log(this.id);
        const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});


        await this.save();
        return token;
        
    } catch (e) {
        // res.send("error aaa rha",e);
        console.log(e);
        
    }
}


empSchema.pre("save", async function (next){
    if(this.isModified("password")){
    // console.log(`the current password is ${this.password}`)
    this.password = await bcrypt.hash(this.password, 10);
    // console.log(`the current password is ${this.password}`)

    this.cpassword = await bcrypt.hash(this.password, 10);
    
    }
    next();
})

const empCollcetion = new mongoose.model("empCollection",empSchema);

module.exports = empCollcetion;