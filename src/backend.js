//routes folder

//1) authRoute.js 

// importing express to use Router function from it
const express = require('express')
const router = express.Router()

// mongo.js, importing to access database
const mongo = require('../shared/mongo')



// importing route services 
const authService = require('../services/authServices')

router.post("/register", authService.register);

router.post("/login", authService.login);

module.exports = router;



//2)exercisesRoute.js 

const express = require("express")
const exercisesRouter = express.Router()


//importing mongodb
const mongo = require("../shared/mongo")

//importing service

const exercisesService = require("../services/exercisesService")

exercisesRouter.get("/",async(req,res) => {
    const posts = await exercisesService.getExercises()
    res.send(posts);
})

exercisesRouter.get("/:id",async(req,res) => {
    const posts = await exercisesService.getExercise(req.params.id)
    res.send(posts);
})

exercisesRouter.post("/",async(req,res) => {
    const post = await exercisesService.addExercises(req.body);
    res.send(post)
})

exercisesRouter.put("/:id",async(req,res) => {
    const post = await exercisesService.updateExercise(req.params.id,req.body) ;
    res.send(post)
})

exercisesRouter.delete("/:id",async(req,res) => {
    await exercisesService.deleteExercise(req.params.id);
    res.send({});
})


module.exports = exercisesRouter;



//3)forgotPasswordRoute.js

// importing express to use Router function from it
const express = require('express')
const router = express.Router()

// mongo.js, importing to access database
const mongo = require('../shared/mongo')



// importing route services 
const forgotPasswordService = require('../services/forgotPasswordService')

router.post("/emailSending", forgotPasswordService.emailCheck);

router.put("/:id",async(req,res) => {
   
    const post = await forgotPasswordService.updatePassword(req.params.id,req.body,res) ;
    
})

// router.post("/login", authService.login);

module.exports = router;



//4)usersRoute.js

const express = require("express")
const userRouter = express.Router()

const {ObjectId} = require("mongodb")

//importing mongodb
const mongo = require("../shared/mongo")

//importing service

const usersService = require("../services/usersService")

userRouter.get("/",async(req,res) => {
    const posts = await usersService.getUsers();
    res.send(posts);
})

userRouter.get("/:id",async(req,res) => {
    const posts = await usersService.getUser(req.params.id)
    res.send(posts);
})

userRouter.post("/",async(req,res) => {
    const post = await usersService.addUsers(req.body);
    res.send(post)
})

userRouter.put("/:id",async(req,res) => {
    const post = await usersService.updateUsers(req.params.id,req.body) ;
    res.send(post)
})

userRouter.delete("/:id",async(req,res) => {
    await usersService.deleteUser(req.params.id);
    res.send({});
})


module.exports = userRouter; 





//services folder

//1)authServices.js 

const express = require("express")

const mongo = require("../shared/mongo")

// importing jwt to genetrate token
const jwt = require("jsonwebtoken")

//importing for password encrption
const bcrypt = require("bcrypt")

// importing for validating the registering data
//schema for register and login
const schema = require('../shared/schema')

  // schema options
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };

const service = {
    async login(req, res){
        const data = req.body;
      console.log(data);
        try {
            //initializig the schema
            const {error} = schema.login.validate(data,options);
            if(error) return res.status(400).send({error : error.details[0].message})
        
            //check for email
            const user = await service.findEmail(data.email);
            if(!user) return res.status(400).send({error : "User or password is incorrect"})
    
            //check for password
            const isValid = await bcrypt.compare(data.password, user.password);
            if(!isValid) return res.status(400).send({error : "User or password is incorrect"})

            //Generating token and sending token as response
            const token = jwt.sign({userid : user._id,email : user.email}, process.env.TOKEN_SECRET, {expiresIn:"8h"});
            res.send({token})
        }catch(err){
            console.log(err);
            res.status(500).send({error : "Internal server error"})
        }
            
    },

    async register(req,res){
        const data = req.body;
        try {
        //initializig the schema
        const {error} = schema.register.validate(data,options);
        if(error) return res.status(400).send({error : error.details[0].message})
        
        // checking for email existance
        const user = await service.findEmail(data.email);
        if(user) return res.status(400).send({error : "User already exists"})

        //Password encrption
        const salt = await bcrypt.genSalt(5);
        data.password = await bcrypt.hash(data.password, salt);

        await mongo.db.collection("users").insert(data);



        res.send("Account created")
        }catch(err){
            console.log(err)
            res.status(500).send({error : "Internal server error"})
        }
    },

    findEmail(mail){
        console.log(mail)
        return mongo.db.collection("users").findOne({email : mail})
    }
}

module.exports = service;


//2)exercisesService.js 

//importing mongodb
const mongo = require("../shared/mongo");

const { ObjectId } = require("mongodb");

const service = {
  getExercises() {
    return mongo.db.collection("exercises").find().toArray();
  },
  getExercise(id) {
    return mongo.db.collection("exercises").findOne({ _id: ObjectId(id) });
  },
  addExercises(data) {
    return mongo.db.collection("exercises").insert(data);
  },
  updateExercise(id, data) {
    return mongo.db
      .collection("exercises")
      .findOneAndUpdate(
        { _id: ObjectId(id) },
        { $set: data },
        { returnDocument: "after" }
      );
  },
  deleteExercise(id){
      return mongo.db.collection("exercises").deleteOne({_id : ObjectId(id)});
  }
};

module.exports = service;


//3)forgotPasswordService.js 

const express = require("express");

const mongo = require("../shared/mongo");

require("dotenv").config();

// importing jwt to genetrate token
const jwt = require("jsonwebtoken");

//importing for password encrption
const bcrypt = require("bcrypt");

const nodemailer = require("nodemailer");

const smtpTransport = require('nodemailer-smtp-transport');

// importing for validating the registering data
//schema for register and login
const schema = require("../shared/schema");

// schema options
const options = {
  abortEarly: false, // include all errors
  allowUnknown: true, // ignore unknown props
  stripUnknown: true, // remove unknown props
};

const service = {
  async emailCheck(req, res) {
    const data = req.body;
    console.log(data);
    try {
      //initializig the schema
      const { error } = schema.emailSending.validate(data, options);
      if (error)
        return res.status(400).send({ error: error.details[0].message });

      //check for email
      const user = await service.findEmail(data.email);
      if (!user)
        return res.status(400).send({ error: "User email is incorrect or not registered" });

    //Generating token and sending token as response
    const token = jwt.sign({userid : user._id,email : user.email}, process.env.TOKEN_SECRET, {expiresIn:"8h"});
        emailSending();
      
      

      // async..await is not allowed in global scope, must use a wrapper
      async function emailSending() {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        // let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport(smtpTransport({
          host: 'smtp.gmail.com',
          port: 587,
          ignoreTLS: false,
          secure: false, // true for 465, false for other ports
          auth: {
            user: 'fitnesstracker123456@gmail.com', // generated user
            pass: 'sandeep222', // generated password
          },
          tls: {
         rejectUnauthorized: false
     }
        }));

        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: '"Fitness tracker 👻" <fitnesstracker123456@gmail.com>', // sender address
          to: data.email, // list of receivers
          subject: "Hello ✔ fitness tracker verification link", // Subject line
          text: "Please click on the button to change the password", // plain text body
          html: `<b><a href=https://6182c19c26af072fdb84d0e1--musing-yalow-a09866.netlify.app/changePassword/${token}>Change password</a></b>`, // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        
        res.send("Mail sent");
      }

      
   
       
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Internal server error" });
    }
  },

  async updatePassword(req, reqbody, res) {
    console.log(req,reqbody);
    const data = reqbody.body;
    try {
      //initializig the schema
//       const { error } = schema.updatePassword.validate(data, options);
//       if (error)
//         return res.status(400).send({ error: error.details[0].message });

      // checking for email existance
      const userid = jwt.verify(req, process.env.TOKEN_SECRET);
      //check for email
      const user = await service.findEmail(userid.email);
      if (!user)
        return res.status(400).send({ error: "User email is incorrect or not registered" });

     //Password encrption
     const salt = await bcrypt.genSalt(5);
     reqbody.password = await bcrypt.hash(reqbody.password, salt);

        await mongo.db
        .collection("users")
        .findOneAndUpdate(
          { email: userid.email },
          { $set: reqbody },
          { returnDocument: "after" }
        );
      res.send("Changed the password");
      
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Internal server error" });
    }
  },

  findEmail(mail) {
    console.log(mail);
    return mongo.db.collection("users").findOne({ email: mail });
  },
};

module.exports = service;

//4)usersService.js 

//importing mongodb
const mongo = require("../shared/mongo");

const { ObjectId } = require("mongodb");

const serviceUser = {
  getUsers() {
    return mongo.db.collection("users").find().toArray();
  },
  getUser(userid) {
      console.log(userid)
    return mongo.db.collection("users").findOne({ _id: ObjectId(userid)});
  },
  addUsers(data) {
    return mongo.db.collection("users").insert(data);
  },
  updateUsers(id, data) {
    return mongo.db
      .collection("users")
      .findOneAndUpdate(
        { _id: ObjectId(id) },
        { $set: data },
        { returnDocument: "after" }
      );
  },
  deleteUser(id){
      return mongo.db.collection("users").deleteOne({_id : ObjectId(id)});
  }
};

module.exports = serviceUser;




// shared folder

//1)mongo.js 

// importing MongoDb and connecting to client
const { MongoClient } = require("mongodb");
 const client = new MongoClient(process.env.MONGODB_URL);
 const dbname = process.env.MONGODB_NAME;


 const mongo = {
     db : null,
     async connect() {
        await client.connect();
        this.db = client.db(dbname);
        console.log("Connnected to db..."+ dbname);
       
     },
 };
module.exports = mongo;


//2)schema.js  (for password change)

const Joi = require('joi')

// schema for register
const register = Joi.object({
    name : Joi.string().min(3).required(),
    email : Joi.string().required().email(),
    password : Joi.string().min(5).required()
})

const login = Joi.object({
    email : Joi.string().required().email(),
    password : Joi.string().min(5).required()
})

const emailSending = Joi.object({
    email : Joi.string().required().email(),
})

const updatePassword = Joi.object({
    password : Joi.string().min(5).required()
})

module.exports = {
    register,
    login,
    emailSending
}




//.env

// MONGODB_URL = mongodb+srv://admin:sandeep222@cluster0.7magp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

MONGODB_NAME = FitnessApp

PORT = 3333

TOKEN_SECRET = FitnessApplication




//index.js 


//importing express
const express = require("express");
const app = express();
bodyParser = require('body-parser'),

//importing environmental configuration
require("dotenv").config();

     //No access error 

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//cors
const cors = require("cors");

const corsOptions ={
   origin:'*', 
   optionSuccessStatus:200,
}

//importing JWT to check token
const jwt = require("jsonwebtoken");

//importing Routes
const postRoute = require("./routes/exercisesRoute");
const userRoute = require("./routes/usersRoute");
const authRoute = require("./routes/authRoute");
const forgotPasswordRoute = require("./routes/forgotPasswordRoute")

//importing mongo
const mongo = require("./shared/mongo");

async function AppServer() {
  try {
    //connecting to mongo
    await mongo.connect();

     
    //cors
   app.options('*', cors());
     
     


    //Middelwares
    app.use(bodyParser.json({ limit: '50mb' }))
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))
    app.use(express.json());

//     app.use((req, res, next) => {
//       console.log("Allowed");
//       next();
//     });

    //Routes
    app.use("/forgotPassword", forgotPasswordRoute);
    app.use("/auth", authRoute);

    //Checking token
       app.use((req, res, next) => {
      const header = req.headers["access-token"];
         console.log(header)
      try {
        if (typeof header !== "undefined") {
          console.log("123");
          const bearer = header.split(" ");
          const token = bearer[1];
          console.log(bearer);
          console.log("yes entered")
          const userid = jwt.verify(token, process.env.TOKEN_SECRET);
          console.log("verifoed")
          console.log(userid);
          return next();
        }
      } catch (error) {
        console.log(error);
        res.status(401).send("invalid token");
      }

      res.send("token is missing");
    });

    app.use("/exercises", postRoute);
    app.use("/users", userRoute);

    //Starting App
    app.listen(process.env.PORT, () => {
      console.log("server app is running...");
    });
  } catch (err) {
    console.log(err);
    process.exit();
  }
}
AppServer();



//package.json

// {
//     "name": "node-tut",
//     "version": "1.0.0",
//     "description": "",
//     "main": "index.js",
//     "scripts": {
//       "start": "node index.js"
//     },
//     "author": "Sandeep kumar",
//     "license": "ISC",
//     "dependencies": {
//       "bcrypt": "^5.0.1",
//       "body-parser": "^1.19.0",
//       "cors": "^2.8.5",
//       "dotenv": "^10.0.0",
//       "express": "^4.17.1",
//       "joi": "^17.4.2",
//       "jsonwebtoken": "^8.5.1",
//       "mongodb": "^4.1.0",
//       "nodemailer": "^6.7.0",
//       "nodemailer-smtp-transport": "^2.7.4"
//     },
//     "devDependencies": {
//       "nodemon": "^2.0.12"
//     }
//   }




//package-lock.json

// {
//     "name": "node-tut",
//     "version": "1.0.0",
//     "lockfileVersion": 1,
//     "requires": true,
//     "dependencies": {
//       "@hapi/hoek": {
//         "version": "9.2.0",
//         "resolved": "https://registry.npmjs.org/@hapi/hoek/-/hoek-9.2.0.tgz",
//         "integrity": "sha512-sqKVVVOe5ivCaXDWivIJYVSaEgdQK9ul7a4Kity5Iw7u9+wBAPbX1RMSnLLmp7O4Vzj0WOWwMAJsTL00xwaNug=="
//       },
//       "@hapi/topo": {
//         "version": "5.1.0",
//         "resolved": "https://registry.npmjs.org/@hapi/topo/-/topo-5.1.0.tgz",
//         "integrity": "sha512-foQZKJig7Ob0BMAYBfcJk8d77QtOe7Wo4ox7ff1lQYoNNAb6jwcY1ncdoy2e9wQZzvNy7ODZCYJkK8kzmcAnAg==",
//         "requires": {
//           "@hapi/hoek": "^9.0.0"
//         }
//       },
//       "@mapbox/node-pre-gyp": {
//         "version": "1.0.5",
//         "resolved": "https://registry.npmjs.org/@mapbox/node-pre-gyp/-/node-pre-gyp-1.0.5.tgz",
//         "integrity": "sha512-4srsKPXWlIxp5Vbqz5uLfBN+du2fJChBoYn/f2h991WLdk7jUvcSk/McVLSv/X+xQIPI8eGD5GjrnygdyHnhPA==",
//         "requires": {
//           "detect-libc": "^1.0.3",
//           "https-proxy-agent": "^5.0.0",
//           "make-dir": "^3.1.0",
//           "node-fetch": "^2.6.1",
//           "nopt": "^5.0.0",
//           "npmlog": "^4.1.2",
//           "rimraf": "^3.0.2",
//           "semver": "^7.3.4",
//           "tar": "^6.1.0"
//         },
//         "dependencies": {
//           "nopt": {
//             "version": "5.0.0",
//             "resolved": "https://registry.npmjs.org/nopt/-/nopt-5.0.0.tgz",
//             "integrity": "sha512-Tbj67rffqceeLpcRXrT7vKAN8CwfPeIBgM7E6iBkmKLV7bEMwpGgYLGv0jACUsECaa/vuxP0IjEont6umdMgtQ==",
//             "requires": {
//               "abbrev": "1"
//             }
//           },
//           "semver": {
//             "version": "7.3.5",
//             "resolved": "https://registry.npmjs.org/semver/-/semver-7.3.5.tgz",
//             "integrity": "sha512-PoeGJYh8HK4BTO/a9Tf6ZG3veo/A7ZVsYrSA6J8ny9nb3B1VrpkuN+z9OE5wfE5p6H4LchYZsegiQgbJD94ZFQ==",
//             "requires": {
//               "lru-cache": "^6.0.0"
//             }
//           }
//         }
//       },
//       "@sideway/address": {
//         "version": "4.1.2",
//         "resolved": "https://registry.npmjs.org/@sideway/address/-/address-4.1.2.tgz",
//         "integrity": "sha512-idTz8ibqWFrPU8kMirL0CoPH/A29XOzzAzpyN3zQ4kAWnzmNfFmRaoMNN6VI8ske5M73HZyhIaW4OuSFIdM4oA==",
//         "requires": {
//           "@hapi/hoek": "^9.0.0"
//         }
//       },
//       "@sideway/formula": {
//         "version": "3.0.0",
//         "resolved": "https://registry.npmjs.org/@sideway/formula/-/formula-3.0.0.tgz",
//         "integrity": "sha512-vHe7wZ4NOXVfkoRb8T5otiENVlT7a3IAiw7H5M2+GO+9CDgcVUUsX1zalAztCmwyOr2RUTGJdgB+ZvSVqmdHmg=="
//       },
//       "@sideway/pinpoint": {
//         "version": "2.0.0",
//         "resolved": "https://registry.npmjs.org/@sideway/pinpoint/-/pinpoint-2.0.0.tgz",
//         "integrity": "sha512-RNiOoTPkptFtSVzQevY/yWtZwf/RxyVnPy/OcA9HBM3MlGDnBEYL5B41H0MTn0Uec8Hi+2qUtTfG2WWZBmMejQ=="
//       },
//       "@sindresorhus/is": {
//         "version": "0.14.0",
//         "resolved": "https://registry.npmjs.org/@sindresorhus/is/-/is-0.14.0.tgz",
//         "integrity": "sha512-9NET910DNaIPngYnLLPeg+Ogzqsi9uM4mSboU5y6p8S5DzMTVEsJZrawi+BoDNUVBa2DhJqQYUFvMDfgU062LQ==",
//         "dev": true
//       },
//       "@szmarczak/http-timer": {
//         "version": "1.1.2",
//         "resolved": "https://registry.npmjs.org/@szmarczak/http-timer/-/http-timer-1.1.2.tgz",
//         "integrity": "sha512-XIB2XbzHTN6ieIjfIMV9hlVcfPU26s2vafYWQcZHWXHOxiaRZYEDKEwdl129Zyg50+foYV2jCgtrqSA6qNuNSA==",
//         "dev": true,
//         "requires": {
//           "defer-to-connect": "^1.0.1"
//         }
//       },
//       "@types/node": {
//         "version": "16.4.12",
//         "resolved": "https://registry.npmjs.org/@types/node/-/node-16.4.12.tgz",
//         "integrity": "sha512-zxrTNFl9Z8boMJXs6ieqZP0wAhvkdzmHSxTlJabM16cf5G9xBc1uPRH5Bbv2omEDDiM8MzTfqTJXBf0Ba4xFWA=="
//       },
//       "@types/webidl-conversions": {
//         "version": "6.1.1",
//         "resolved": "https://registry.npmjs.org/@types/webidl-conversions/-/webidl-conversions-6.1.1.tgz",
//         "integrity": "sha512-XAahCdThVuCFDQLT7R7Pk/vqeObFNL3YqRyFZg+AqAP/W1/w3xHaIxuW7WszQqTbIBOPRcItYJIou3i/mppu3Q=="
//       },
//       "@types/whatwg-url": {
//         "version": "8.2.1",
//         "resolved": "https://registry.npmjs.org/@types/whatwg-url/-/whatwg-url-8.2.1.tgz",
//         "integrity": "sha512-2YubE1sjj5ifxievI5Ge1sckb9k/Er66HyR2c+3+I6VDUUg1TLPdYYTEbQ+DjRkS4nTxMJhgWfSfMRD2sl2EYQ==",
//         "requires": {
//           "@types/node": "*",
//           "@types/webidl-conversions": "*"
//         }
//       },
//       "abbrev": {
//         "version": "1.1.1",
//         "resolved": "https://registry.npmjs.org/abbrev/-/abbrev-1.1.1.tgz",
//         "integrity": "sha512-nne9/IiQ/hzIhY6pdDnbBtz7DjPTKrY00P/zvPSm5pOFkl6xuGrGnXn/VtTNNfNtAfZ9/1RtehkszU9qcTii0Q=="
//       },
//       "accepts": {
//         "version": "1.3.7",
//         "resolved": "https://registry.npmjs.org/accepts/-/accepts-1.3.7.tgz",
//         "integrity": "sha512-Il80Qs2WjYlJIBNzNkK6KYqlVMTbZLXgHx2oT0pU/fjRHyEp+PEfEPY0R3WCwAGVOtauxh1hOxNgIf5bv7dQpA==",
//         "requires": {
//           "mime-types": "~2.1.24",
//           "negotiator": "0.6.2"
//         }
//       },
//       "agent-base": {
//         "version": "6.0.2",
//         "resolved": "https://registry.npmjs.org/agent-base/-/agent-base-6.0.2.tgz",
//         "integrity": "sha512-RZNwNclF7+MS/8bDg70amg32dyeZGZxiDuQmZxKLAlQjr3jGyLx+4Kkk58UO7D2QdgFIQCovuSuZESne6RG6XQ==",
//         "requires": {
//           "debug": "4"
//         },
//         "dependencies": {
//           "debug": {
//             "version": "4.3.2",
//             "resolved": "https://registry.npmjs.org/debug/-/debug-4.3.2.tgz",
//             "integrity": "sha512-mOp8wKcvj7XxC78zLgw/ZA+6TSgkoE2C/ienthhRD298T7UNwAg9diBpLRxC0mOezLl4B0xV7M0cCO6P/O0Xhw==",
//             "requires": {
//               "ms": "2.1.2"
//             }
//           },
//           "ms": {
//             "version": "2.1.2",
//             "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.2.tgz",
//             "integrity": "sha512-sGkPx+VjMtmA6MX27oA4FBFELFCZZ4S4XqeGOXCv68tT+jb3vk/RyaKWP0PTKyWtmLSM0b+adUTEvbs1PEaH2w=="
//           }
//         }
//       },
//       "ansi-align": {
//         "version": "3.0.0",
//         "resolved": "https://registry.npmjs.org/ansi-align/-/ansi-align-3.0.0.tgz",
//         "integrity": "sha512-ZpClVKqXN3RGBmKibdfWzqCY4lnjEuoNzU5T0oEFpfd/z5qJHVarukridD4juLO2FXMiwUQxr9WqQtaYa8XRYw==",
//         "dev": true,
//         "requires": {
//           "string-width": "^3.0.0"
//         },
//         "dependencies": {
//           "string-width": {
//             "version": "3.1.0",
//             "resolved": "https://registry.npmjs.org/string-width/-/string-width-3.1.0.tgz",
//             "integrity": "sha512-vafcv6KjVZKSgz06oM/H6GDBrAtz8vdhQakGjFIvNrHA6y3HCF1CInLy+QLq8dTJPQ1b+KDUqDFctkdRW44e1w==",
//             "dev": true,
//             "requires": {
//               "emoji-regex": "^7.0.1",
//               "is-fullwidth-code-point": "^2.0.0",
//               "strip-ansi": "^5.1.0"
//             }
//           }
//         }
//       },
//       "ansi-regex": {
//         "version": "4.1.0",
//         "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-4.1.0.tgz",
//         "integrity": "sha512-1apePfXM1UOSqw0o9IiFAovVz9M5S1Dg+4TrDwfMewQ6p/rmMueb7tWZjQ1rx4Loy1ArBggoqGpfqqdI4rondg==",
//         "dev": true
//       },
//       "ansi-styles": {
//         "version": "4.3.0",
//         "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz",
//         "integrity": "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",
//         "dev": true,
//         "requires": {
//           "color-convert": "^2.0.1"
//         }
//       },
//       "anymatch": {
//         "version": "3.1.2",
//         "resolved": "https://registry.npmjs.org/anymatch/-/anymatch-3.1.2.tgz",
//         "integrity": "sha512-P43ePfOAIupkguHUycrc4qJ9kz8ZiuOUijaETwX7THt0Y/GNK7v0aa8rY816xWjZ7rJdA5XdMcpVFTKMq+RvWg==",
//         "dev": true,
//         "requires": {
//           "normalize-path": "^3.0.0",
//           "picomatch": "^2.0.4"
//         }
//       },
//       "aproba": {
//         "version": "1.2.0",
//         "resolved": "https://registry.npmjs.org/aproba/-/aproba-1.2.0.tgz",
//         "integrity": "sha512-Y9J6ZjXtoYh8RnXVCMOU/ttDmk1aBjunq9vO0ta5x85WDQiQfUF9sIPBITdbiiIVcBo03Hi3jMxigBtsddlXRw=="
//       },
//       "are-we-there-yet": {
//         "version": "1.1.5",
//         "resolved": "https://registry.npmjs.org/are-we-there-yet/-/are-we-there-yet-1.1.5.tgz",
//         "integrity": "sha512-5hYdAkZlcG8tOLujVDTgCT+uPX0VnpAH28gWsLfzpXYm7wP6mp5Q/gYyR7YQ0cKVJcXJnl3j2kpBan13PtQf6w==",
//         "requires": {
//           "delegates": "^1.0.0",
//           "readable-stream": "^2.0.6"
//         }
//       },
//       "array-flatten": {
//         "version": "1.1.1",
//         "resolved": "https://registry.npmjs.org/array-flatten/-/array-flatten-1.1.1.tgz",
//         "integrity": "sha1-ml9pkFGx5wczKPKgCJaLZOopVdI="
//       },
//       "balanced-match": {
//         "version": "1.0.2",
//         "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz",
//         "integrity": "sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw=="
//       },
//       "base64-js": {
//         "version": "1.5.1",
//         "resolved": "https://registry.npmjs.org/base64-js/-/base64-js-1.5.1.tgz",
//         "integrity": "sha512-AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA=="
//       },
//       "bcrypt": {
//         "version": "5.0.1",
//         "resolved": "https://registry.npmjs.org/bcrypt/-/bcrypt-5.0.1.tgz",
//         "integrity": "sha512-9BTgmrhZM2t1bNuDtrtIMVSmmxZBrJ71n8Wg+YgdjHuIWYF7SjjmCPZFB+/5i/o/PIeRpwVJR3P+NrpIItUjqw==",
//         "requires": {
//           "@mapbox/node-pre-gyp": "^1.0.0",
//           "node-addon-api": "^3.1.0"
//         }
//       },
//       "binary-extensions": {
//         "version": "2.2.0",
//         "resolved": "https://registry.npmjs.org/binary-extensions/-/binary-extensions-2.2.0.tgz",
//         "integrity": "sha512-jDctJ/IVQbZoJykoeHbhXpOlNBqGNcwXJKJog42E5HDPUwQTSdjCHdihjj0DlnheQ7blbT6dHOafNAiS8ooQKA==",
//         "dev": true
//       },
//       "body-parser": {
//         "version": "1.19.0",
//         "resolved": "https://registry.npmjs.org/body-parser/-/body-parser-1.19.0.tgz",
//         "integrity": "sha512-dhEPs72UPbDnAQJ9ZKMNTP6ptJaionhP5cBb541nXPlW60Jepo9RV/a4fX4XWW9CuFNK22krhrj1+rgzifNCsw==",
//         "requires": {
//           "bytes": "3.1.0",
//           "content-type": "~1.0.4",
//           "debug": "2.6.9",
//           "depd": "~1.1.2",
//           "http-errors": "1.7.2",
//           "iconv-lite": "0.4.24",
//           "on-finished": "~2.3.0",
//           "qs": "6.7.0",
//           "raw-body": "2.4.0",
//           "type-is": "~1.6.17"
//         }
//       },
//       "boxen": {
//         "version": "4.2.0",
//         "resolved": "https://registry.npmjs.org/boxen/-/boxen-4.2.0.tgz",
//         "integrity": "sha512-eB4uT9RGzg2odpER62bBwSLvUeGC+WbRjjyyFhGsKnc8wp/m0+hQsMUvUe3H2V0D5vw0nBdO1hCJoZo5mKeuIQ==",
//         "dev": true,
//         "requires": {
//           "ansi-align": "^3.0.0",
//           "camelcase": "^5.3.1",
//           "chalk": "^3.0.0",
//           "cli-boxes": "^2.2.0",
//           "string-width": "^4.1.0",
//           "term-size": "^2.1.0",
//           "type-fest": "^0.8.1",
//           "widest-line": "^3.1.0"
//         }
//       },
//       "brace-expansion": {
//         "version": "1.1.11",
//         "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-1.1.11.tgz",
//         "integrity": "sha512-iCuPHDFgrHX7H2vEI/5xpz07zSHB00TpugqhmYtVmMO6518mCuRMoOYFldEBl0g187ufozdaHgWKcYFb61qGiA==",
//         "requires": {
//           "balanced-match": "^1.0.0",
//           "concat-map": "0.0.1"
//         }
//       },
//       "braces": {
//         "version": "3.0.2",
//         "resolved": "https://registry.npmjs.org/braces/-/braces-3.0.2.tgz",
//         "integrity": "sha512-b8um+L1RzM3WDSzvhm6gIz1yfTbBt6YTlcEKAvsmqCZZFw46z626lVj9j1yEPW33H5H+lBQpZMP1k8l+78Ha0A==",
//         "dev": true,
//         "requires": {
//           "fill-range": "^7.0.1"
//         }
//       },
//       "bson": {
//         "version": "4.4.1",
//         "resolved": "https://registry.npmjs.org/bson/-/bson-4.4.1.tgz",
//         "integrity": "sha512-Uu4OCZa0jouQJCKOk1EmmyqtdWAP5HVLru4lQxTwzJzxT+sJ13lVpEZU/MATDxtHiekWMAL84oQY3Xn1LpJVSg==",
//         "requires": {
//           "buffer": "^5.6.0"
//         }
//       },
//       "buffer": {
//         "version": "5.7.1",
//         "resolved": "https://registry.npmjs.org/buffer/-/buffer-5.7.1.tgz",
//         "integrity": "sha512-EHcyIPBQ4BSGlvjB16k5KgAJ27CIsHY/2JBmCRReo48y9rQ3MaUzWX3KVlBa4U7MyX02HdVj0K7C3WaB3ju7FQ==",
//         "requires": {
//           "base64-js": "^1.3.1",
//           "ieee754": "^1.1.13"
//         }
//       },
//       "buffer-equal-constant-time": {
//         "version": "1.0.1",
//         "resolved": "https://registry.npmjs.org/buffer-equal-constant-time/-/buffer-equal-constant-time-1.0.1.tgz",
//         "integrity": "sha1-+OcRMvf/5uAaXJaXpMbz5I1cyBk="
//       },
//       "bytes": {
//         "version": "3.1.0",
//         "resolved": "https://registry.npmjs.org/bytes/-/bytes-3.1.0.tgz",
//         "integrity": "sha512-zauLjrfCG+xvoyaqLoV8bLVXXNGC4JqlxFCutSDWA6fJrTo2ZuvLYTqZ7aHBLZSMOopbzwv8f+wZcVzfVTI2Dg=="
//       },
//       "cacheable-request": {
//         "version": "6.1.0",
//         "resolved": "https://registry.npmjs.org/cacheable-request/-/cacheable-request-6.1.0.tgz",
//         "integrity": "sha512-Oj3cAGPCqOZX7Rz64Uny2GYAZNliQSqfbePrgAQ1wKAihYmCUnraBtJtKcGR4xz7wF+LoJC+ssFZvv5BgF9Igg==",
//         "dev": true,
//         "requires": {
//           "clone-response": "^1.0.2",
//           "get-stream": "^5.1.0",
//           "http-cache-semantics": "^4.0.0",
//           "keyv": "^3.0.0",
//           "lowercase-keys": "^2.0.0",
//           "normalize-url": "^4.1.0",
//           "responselike": "^1.0.2"
//         },
//         "dependencies": {
//           "get-stream": {
//             "version": "5.2.0",
//             "resolved": "https://registry.npmjs.org/get-stream/-/get-stream-5.2.0.tgz",
//             "integrity": "sha512-nBF+F1rAZVCu/p7rjzgA+Yb4lfYXrpl7a6VmJrU8wF9I1CKvP/QwPNZHnOlwbTkY6dvtFIzFMSyQXbLoTQPRpA==",
//             "dev": true,
//             "requires": {
//               "pump": "^3.0.0"
//             }
//           },
//           "lowercase-keys": {
//             "version": "2.0.0",
//             "resolved": "https://registry.npmjs.org/lowercase-keys/-/lowercase-keys-2.0.0.tgz",
//             "integrity": "sha512-tqNXrS78oMOE73NMxK4EMLQsQowWf8jKooH9g7xPavRT706R6bkQJ6DY2Te7QukaZsulxa30wQ7bk0pm4XiHmA==",
//             "dev": true
//           }
//         }
//       },
//       "camelcase": {
//         "version": "5.3.1",
//         "resolved": "https://registry.npmjs.org/camelcase/-/camelcase-5.3.1.tgz",
//         "integrity": "sha512-L28STB170nwWS63UjtlEOE3dldQApaJXZkOI1uMFfzf3rRuPegHaHesyee+YxQ+W6SvRDQV6UrdOdRiR153wJg==",
//         "dev": true
//       },
//       "chalk": {
//         "version": "3.0.0",
//         "resolved": "https://registry.npmjs.org/chalk/-/chalk-3.0.0.tgz",
//         "integrity": "sha512-4D3B6Wf41KOYRFdszmDqMCGq5VV/uMAB273JILmO+3jAlh8X4qDtdtgCR3fxtbLEMzSx22QdhnDcJvu2u1fVwg==",
//         "dev": true,
//         "requires": {
//           "ansi-styles": "^4.1.0",
//           "supports-color": "^7.1.0"
//         },
//         "dependencies": {
//           "has-flag": {
//             "version": "4.0.0",
//             "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-4.0.0.tgz",
//             "integrity": "sha512-EykJT/Q1KjTWctppgIAgfSO0tKVuZUjhgMr17kqTumMl6Afv3EISleU7qZUzoXDFTAHTDC4NOoG/ZxU3EvlMPQ==",
//             "dev": true
//           },
//           "supports-color": {
//             "version": "7.2.0",
//             "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-7.2.0.tgz",
//             "integrity": "sha512-qpCAvRl9stuOHveKsn7HncJRvv501qIacKzQlO/+Lwxc9+0q2wLyv4Dfvt80/DPn2pqOBsJdDiogXGR9+OvwRw==",
//             "dev": true,
//             "requires": {
//               "has-flag": "^4.0.0"
//             }
//           }
//         }
//       },
//       "chokidar": {
//         "version": "3.5.2",
//         "resolved": "https://registry.npmjs.org/chokidar/-/chokidar-3.5.2.tgz",
//         "integrity": "sha512-ekGhOnNVPgT77r4K/U3GDhu+FQ2S8TnK/s2KbIGXi0SZWuwkZ2QNyfWdZW+TVfn84DpEP7rLeCt2UI6bJ8GwbQ==",
//         "dev": true,
//         "requires": {
//           "anymatch": "~3.1.2",
//           "braces": "~3.0.2",
//           "fsevents": "~2.3.2",
//           "glob-parent": "~5.1.2",
//           "is-binary-path": "~2.1.0",
//           "is-glob": "~4.0.1",
//           "normalize-path": "~3.0.0",
//           "readdirp": "~3.6.0"
//         }
//       },
//       "chownr": {
//         "version": "2.0.0",
//         "resolved": "https://registry.npmjs.org/chownr/-/chownr-2.0.0.tgz",
//         "integrity": "sha512-bIomtDF5KGpdogkLd9VspvFzk9KfpyyGlS8YFVZl7TGPBHL5snIOnxeshwVgPteQ9b4Eydl+pVbIyE1DcvCWgQ=="
//       },
//       "ci-info": {
//         "version": "2.0.0",
//         "resolved": "https://registry.npmjs.org/ci-info/-/ci-info-2.0.0.tgz",
//         "integrity": "sha512-5tK7EtrZ0N+OLFMthtqOj4fI2Jeb88C4CAZPu25LDVUgXJ0A3Js4PMGqrn0JU1W0Mh1/Z8wZzYPxqUrXeBboCQ==",
//         "dev": true
//       },
//       "cli-boxes": {
//         "version": "2.2.1",
//         "resolved": "https://registry.npmjs.org/cli-boxes/-/cli-boxes-2.2.1.tgz",
//         "integrity": "sha512-y4coMcylgSCdVinjiDBuR8PCC2bLjyGTwEmPb9NHR/QaNU6EUOXcTY/s6VjGMD6ENSEaeQYHCY0GNGS5jfMwPw==",
//         "dev": true
//       },
//       "clone-response": {
//         "version": "1.0.2",
//         "resolved": "https://registry.npmjs.org/clone-response/-/clone-response-1.0.2.tgz",
//         "integrity": "sha1-0dyXOSAxTfZ/vrlCI7TuNQI56Ws=",
//         "dev": true,
//         "requires": {
//           "mimic-response": "^1.0.0"
//         }
//       },
//       "code-point-at": {
//         "version": "1.1.0",
//         "resolved": "https://registry.npmjs.org/code-point-at/-/code-point-at-1.1.0.tgz",
//         "integrity": "sha1-DQcLTQQ6W+ozovGkDi7bPZpMz3c="
//       },
//       "color-convert": {
//         "version": "2.0.1",
//         "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",
//         "integrity": "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
//         "dev": true,
//         "requires": {
//           "color-name": "~1.1.4"
//         }
//       },
//       "color-name": {
//         "version": "1.1.4",
//         "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",
//         "integrity": "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==",
//         "dev": true
//       },
//       "concat-map": {
//         "version": "0.0.1",
//         "resolved": "https://registry.npmjs.org/concat-map/-/concat-map-0.0.1.tgz",
//         "integrity": "sha1-2Klr13/Wjfd5OnMDajug1UBdR3s="
//       },
//       "configstore": {
//         "version": "5.0.1",
//         "resolved": "https://registry.npmjs.org/configstore/-/configstore-5.0.1.tgz",
//         "integrity": "sha512-aMKprgk5YhBNyH25hj8wGt2+D52Sw1DRRIzqBwLp2Ya9mFmY8KPvvtvmna8SxVR9JMZ4kzMD68N22vlaRpkeFA==",
//         "dev": true,
//         "requires": {
//           "dot-prop": "^5.2.0",
//           "graceful-fs": "^4.1.2",
//           "make-dir": "^3.0.0",
//           "unique-string": "^2.0.0",
//           "write-file-atomic": "^3.0.0",
//           "xdg-basedir": "^4.0.0"
//         }
//       },
//       "console-control-strings": {
//         "version": "1.1.0",
//         "resolved": "https://registry.npmjs.org/console-control-strings/-/console-control-strings-1.1.0.tgz",
//         "integrity": "sha1-PXz0Rk22RG6mRL9LOVB/mFEAjo4="
//       },
//       "content-disposition": {
//         "version": "0.5.3",
//         "resolved": "https://registry.npmjs.org/content-disposition/-/content-disposition-0.5.3.tgz",
//         "integrity": "sha512-ExO0774ikEObIAEV9kDo50o+79VCUdEB6n6lzKgGwupcVeRlhrj3qGAfwq8G6uBJjkqLrhT0qEYFcWng8z1z0g==",
//         "requires": {
//           "safe-buffer": "5.1.2"
//         }
//       },
//       "content-type": {
//         "version": "1.0.4",
//         "resolved": "https://registry.npmjs.org/content-type/-/content-type-1.0.4.tgz",
//         "integrity": "sha512-hIP3EEPs8tB9AT1L+NUqtwOAps4mk2Zob89MWXMHjHWg9milF/j4osnnQLXBCBFBk/tvIG/tUc9mOUJiPBhPXA=="
//       },
//       "cookie": {
//         "version": "0.4.0",
//         "resolved": "https://registry.npmjs.org/cookie/-/cookie-0.4.0.tgz",
//         "integrity": "sha512-+Hp8fLp57wnUSt0tY0tHEXh4voZRDnoIrZPqlo3DPiI4y9lwg/jqx+1Om94/W6ZaPDOUbnjOt/99w66zk+l1Xg=="
//       },
//       "cookie-signature": {
//         "version": "1.0.6",
//         "resolved": "https://registry.npmjs.org/cookie-signature/-/cookie-signature-1.0.6.tgz",
//         "integrity": "sha1-4wOogrNCzD7oylE6eZmXNNqzriw="
//       },
//       "core-util-is": {
//         "version": "1.0.2",
//         "resolved": "https://registry.npmjs.org/core-util-is/-/core-util-is-1.0.2.tgz",
//         "integrity": "sha1-tf1UIgqivFq1eqtxQMlAdUUDwac="
//       },
//       "cors": {
//         "version": "2.8.5",
//         "resolved": "https://registry.npmjs.org/cors/-/cors-2.8.5.tgz",
//         "integrity": "sha512-KIHbLJqu73RGr/hnbrO9uBeixNGuvSQjul/jdFvS/KFSIH1hWVd1ng7zOHx+YrEfInLG7q4n6GHQ9cDtxv/P6g==",
//         "requires": {
//           "object-assign": "^4",
//           "vary": "^1"
//         }
//       },
//       "crypto-random-string": {
//         "version": "2.0.0",
//         "resolved": "https://registry.npmjs.org/crypto-random-string/-/crypto-random-string-2.0.0.tgz",
//         "integrity": "sha512-v1plID3y9r/lPhviJ1wrXpLeyUIGAZ2SHNYTEapm7/8A9nLPoyvVp3RK/EPFqn5kEznyWgYZNsRtYYIWbuG8KA==",
//         "dev": true
//       },
//       "debug": {
//         "version": "2.6.9",
//         "resolved": "https://registry.npmjs.org/debug/-/debug-2.6.9.tgz",
//         "integrity": "sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==",
//         "requires": {
//           "ms": "2.0.0"
//         }
//       },
//       "decompress-response": {
//         "version": "3.3.0",
//         "resolved": "https://registry.npmjs.org/decompress-response/-/decompress-response-3.3.0.tgz",
//         "integrity": "sha1-gKTdMjdIOEv6JICDYirt7Jgq3/M=",
//         "dev": true,
//         "requires": {
//           "mimic-response": "^1.0.0"
//         }
//       },
//       "deep-extend": {
//         "version": "0.6.0",
//         "resolved": "https://registry.npmjs.org/deep-extend/-/deep-extend-0.6.0.tgz",
//         "integrity": "sha512-LOHxIOaPYdHlJRtCQfDIVZtfw/ufM8+rVj649RIHzcm/vGwQRXFt6OPqIFWsm2XEMrNIEtWR64sY1LEKD2vAOA==",
//         "dev": true
//       },
//       "defer-to-connect": {
//         "version": "1.1.3",
//         "resolved": "https://registry.npmjs.org/defer-to-connect/-/defer-to-connect-1.1.3.tgz",
//         "integrity": "sha512-0ISdNousHvZT2EiFlZeZAHBUvSxmKswVCEf8hW7KWgG4a8MVEu/3Vb6uWYozkjylyCxe0JBIiRB1jV45S70WVQ==",
//         "dev": true
//       },
//       "delegates": {
//         "version": "1.0.0",
//         "resolved": "https://registry.npmjs.org/delegates/-/delegates-1.0.0.tgz",
//         "integrity": "sha1-hMbhWbgZBP3KWaDvRM2HDTElD5o="
//       },
//       "denque": {
//         "version": "1.5.0",
//         "resolved": "https://registry.npmjs.org/denque/-/denque-1.5.0.tgz",
//         "integrity": "sha512-CYiCSgIF1p6EUByQPlGkKnP1M9g0ZV3qMIrqMqZqdwazygIA/YP2vrbcyl1h/WppKJTdl1F85cXIle+394iDAQ=="
//       },
//       "depd": {
//         "version": "1.1.2",
//         "resolved": "https://registry.npmjs.org/depd/-/depd-1.1.2.tgz",
//         "integrity": "sha1-m81S4UwJd2PnSbJ0xDRu0uVgtak="
//       },
//       "destroy": {
//         "version": "1.0.4",
//         "resolved": "https://registry.npmjs.org/destroy/-/destroy-1.0.4.tgz",
//         "integrity": "sha1-l4hXRCxEdJ5CBmE+N5RiBYJqvYA="
//       },
//       "detect-libc": {
//         "version": "1.0.3",
//         "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-1.0.3.tgz",
//         "integrity": "sha1-+hN8S9aY7fVc1c0CrFWfkaTEups="
//       },
//       "dot-prop": {
//         "version": "5.3.0",
//         "resolved": "https://registry.npmjs.org/dot-prop/-/dot-prop-5.3.0.tgz",
//         "integrity": "sha512-QM8q3zDe58hqUqjraQOmzZ1LIH9SWQJTlEKCH4kJ2oQvLZk7RbQXvtDM2XEq3fwkV9CCvvH4LA0AV+ogFsBM2Q==",
//         "dev": true,
//         "requires": {
//           "is-obj": "^2.0.0"
//         }
//       },
//       "dotenv": {
//         "version": "10.0.0",
//         "resolved": "https://registry.npmjs.org/dotenv/-/dotenv-10.0.0.tgz",
//         "integrity": "sha512-rlBi9d8jpv9Sf1klPjNfFAuWDjKLwTIJJ/VxtoTwIR6hnZxcEOQCZg2oIL3MWBYw5GpUDKOEnND7LXTbIpQ03Q=="
//       },
//       "duplexer3": {
//         "version": "0.1.4",
//         "resolved": "https://registry.npmjs.org/duplexer3/-/duplexer3-0.1.4.tgz",
//         "integrity": "sha1-7gHdHKwO08vH/b6jfcCo8c4ALOI=",
//         "dev": true
//       },
//       "ecdsa-sig-formatter": {
//         "version": "1.0.11",
//         "resolved": "https://registry.npmjs.org/ecdsa-sig-formatter/-/ecdsa-sig-formatter-1.0.11.tgz",
//         "integrity": "sha512-nagl3RYrbNv6kQkeJIpt6NJZy8twLB/2vtz6yN9Z4vRKHN4/QZJIEbqohALSgwKdnksuY3k5Addp5lg8sVoVcQ==",
//         "requires": {
//           "safe-buffer": "^5.0.1"
//         }
//       },
//       "ee-first": {
//         "version": "1.1.1",
//         "resolved": "https://registry.npmjs.org/ee-first/-/ee-first-1.1.1.tgz",
//         "integrity": "sha1-WQxhFWsK4vTwJVcyoViyZrxWsh0="
//       },
//       "emoji-regex": {
//         "version": "7.0.3",
//         "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-7.0.3.tgz",
//         "integrity": "sha512-CwBLREIQ7LvYFB0WyRvwhq5N5qPhc6PMjD6bYggFlI5YyDgl+0vxq5VHbMOFqLg7hfWzmu8T5Z1QofhmTIhItA==",
//         "dev": true
//       },
//       "encodeurl": {
//         "version": "1.0.2",
//         "resolved": "https://registry.npmjs.org/encodeurl/-/encodeurl-1.0.2.tgz",
//         "integrity": "sha1-rT/0yG7C0CkyL1oCw6mmBslbP1k="
//       },
//       "end-of-stream": {
//         "version": "1.4.4",
//         "resolved": "https://registry.npmjs.org/end-of-stream/-/end-of-stream-1.4.4.tgz",
//         "integrity": "sha512-+uw1inIHVPQoaVuHzRyXd21icM+cnt4CzD5rW+NC1wjOUSTOs+Te7FOv7AhN7vS9x/oIyhLP5PR1H+phQAHu5Q==",
//         "dev": true,
//         "requires": {
//           "once": "^1.4.0"
//         }
//       },
//       "escape-goat": {
//         "version": "2.1.1",
//         "resolved": "https://registry.npmjs.org/escape-goat/-/escape-goat-2.1.1.tgz",
//         "integrity": "sha512-8/uIhbG12Csjy2JEW7D9pHbreaVaS/OpN3ycnyvElTdwM5n6GY6W6e2IPemfvGZeUMqZ9A/3GqIZMgKnBhAw/Q==",
//         "dev": true
//       },
//       "escape-html": {
//         "version": "1.0.3",
//         "resolved": "https://registry.npmjs.org/escape-html/-/escape-html-1.0.3.tgz",
//         "integrity": "sha1-Aljq5NPQwJdN4cFpGI7wBR0dGYg="
//       },
//       "etag": {
//         "version": "1.8.1",
//         "resolved": "https://registry.npmjs.org/etag/-/etag-1.8.1.tgz",
//         "integrity": "sha1-Qa4u62XvpiJorr/qg6x9eSmbCIc="
//       },
//       "express": {
//         "version": "4.17.1",
//         "resolved": "https://registry.npmjs.org/express/-/express-4.17.1.tgz",
//         "integrity": "sha512-mHJ9O79RqluphRrcw2X/GTh3k9tVv8YcoyY4Kkh4WDMUYKRZUq0h1o0w2rrrxBqM7VoeUVqgb27xlEMXTnYt4g==",
//         "requires": {
//           "accepts": "~1.3.7",
//           "array-flatten": "1.1.1",
//           "body-parser": "1.19.0",
//           "content-disposition": "0.5.3",
//           "content-type": "~1.0.4",
//           "cookie": "0.4.0",
//           "cookie-signature": "1.0.6",
//           "debug": "2.6.9",
//           "depd": "~1.1.2",
//           "encodeurl": "~1.0.2",
//           "escape-html": "~1.0.3",
//           "etag": "~1.8.1",
//           "finalhandler": "~1.1.2",
//           "fresh": "0.5.2",
//           "merge-descriptors": "1.0.1",
//           "methods": "~1.1.2",
//           "on-finished": "~2.3.0",
//           "parseurl": "~1.3.3",
//           "path-to-regexp": "0.1.7",
//           "proxy-addr": "~2.0.5",
//           "qs": "6.7.0",
//           "range-parser": "~1.2.1",
//           "safe-buffer": "5.1.2",
//           "send": "0.17.1",
//           "serve-static": "1.14.1",
//           "setprototypeof": "1.1.1",
//           "statuses": "~1.5.0",
//           "type-is": "~1.6.18",
//           "utils-merge": "1.0.1",
//           "vary": "~1.1.2"
//         }
//       },
//       "fill-range": {
//         "version": "7.0.1",
//         "resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.0.1.tgz",
//         "integrity": "sha512-qOo9F+dMUmC2Lcb4BbVvnKJxTPjCm+RRpe4gDuGrzkL7mEVl/djYSu2OdQ2Pa302N4oqkSg9ir6jaLWJ2USVpQ==",
//         "dev": true,
//         "requires": {
//           "to-regex-range": "^5.0.1"
//         }
//       },
//       "finalhandler": {
//         "version": "1.1.2",
//         "resolved": "https://registry.npmjs.org/finalhandler/-/finalhandler-1.1.2.tgz",
//         "integrity": "sha512-aAWcW57uxVNrQZqFXjITpW3sIUQmHGG3qSb9mUah9MgMC4NeWhNOlNjXEYq3HjRAvL6arUviZGGJsBg6z0zsWA==",
//         "requires": {
//           "debug": "2.6.9",
//           "encodeurl": "~1.0.2",
//           "escape-html": "~1.0.3",
//           "on-finished": "~2.3.0",
//           "parseurl": "~1.3.3",
//           "statuses": "~1.5.0",
//           "unpipe": "~1.0.0"
//         }
//       },
//       "forwarded": {
//         "version": "0.2.0",
//         "resolved": "https://registry.npmjs.org/forwarded/-/forwarded-0.2.0.tgz",
//         "integrity": "sha512-buRG0fpBtRHSTCOASe6hD258tEubFoRLb4ZNA6NxMVHNw2gOcwHo9wyablzMzOA5z9xA9L1KNjk/Nt6MT9aYow=="
//       },
//       "fresh": {
//         "version": "0.5.2",
//         "resolved": "https://registry.npmjs.org/fresh/-/fresh-0.5.2.tgz",
//         "integrity": "sha1-PYyt2Q2XZWn6g1qx+OSyOhBWBac="
//       },
//       "fs-minipass": {
//         "version": "2.1.0",
//         "resolved": "https://registry.npmjs.org/fs-minipass/-/fs-minipass-2.1.0.tgz",
//         "integrity": "sha512-V/JgOLFCS+R6Vcq0slCuaeWEdNC3ouDlJMNIsacH2VtALiu9mV4LPrHc5cDl8k5aw6J8jwgWWpiTo5RYhmIzvg==",
//         "requires": {
//           "minipass": "^3.0.0"
//         }
//       },
//       "fs.realpath": {
//         "version": "1.0.0",
//         "resolved": "https://registry.npmjs.org/fs.realpath/-/fs.realpath-1.0.0.tgz",
//         "integrity": "sha1-FQStJSMVjKpA20onh8sBQRmU6k8="
//       },
//       "fsevents": {
//         "version": "2.3.2",
//         "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.2.tgz",
//         "integrity": "sha512-xiqMQR4xAeHTuB9uWm+fFRcIOgKBMiOBP+eXiyT7jsgVCq1bkVygt00oASowB7EdtpOHaaPgKt812P9ab+DDKA==",
//         "dev": true,
//         "optional": true
//       },
//       "gauge": {
//         "version": "2.7.4",
//         "resolved": "https://registry.npmjs.org/gauge/-/gauge-2.7.4.tgz",
//         "integrity": "sha1-LANAXHU4w51+s3sxcCLjJfsBi/c=",
//         "requires": {
//           "aproba": "^1.0.3",
//           "console-control-strings": "^1.0.0",
//           "has-unicode": "^2.0.0",
//           "object-assign": "^4.1.0",
//           "signal-exit": "^3.0.0",
//           "string-width": "^1.0.1",
//           "strip-ansi": "^3.0.1",
//           "wide-align": "^1.1.0"
//         },
//         "dependencies": {
//           "ansi-regex": {
//             "version": "2.1.1",
//             "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-2.1.1.tgz",
//             "integrity": "sha1-w7M6te42DYbg5ijwRorn7yfWVN8="
//           },
//           "is-fullwidth-code-point": {
//             "version": "1.0.0",
//             "resolved": "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-1.0.0.tgz",
//             "integrity": "sha1-754xOG8DGn8NZDr4L95QxFfvAMs=",
//             "requires": {
//               "number-is-nan": "^1.0.0"
//             }
//           },
//           "string-width": {
//             "version": "1.0.2",
//             "resolved": "https://registry.npmjs.org/string-width/-/string-width-1.0.2.tgz",
//             "integrity": "sha1-EYvfW4zcUaKn5w0hHgfisLmxB9M=",
//             "requires": {
//               "code-point-at": "^1.0.0",
//               "is-fullwidth-code-point": "^1.0.0",
//               "strip-ansi": "^3.0.0"
//             }
//           },
//           "strip-ansi": {
//             "version": "3.0.1",
//             "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-3.0.1.tgz",
//             "integrity": "sha1-ajhfuIU9lS1f8F0Oiq+UJ43GPc8=",
//             "requires": {
//               "ansi-regex": "^2.0.0"
//             }
//           }
//         }
//       },
//       "get-stream": {
//         "version": "4.1.0",
//         "resolved": "https://registry.npmjs.org/get-stream/-/get-stream-4.1.0.tgz",
//         "integrity": "sha512-GMat4EJ5161kIy2HevLlr4luNjBgvmj413KaQA7jt4V8B4RDsfpHk7WQ9GVqfYyyx8OS/L66Kox+rJRNklLK7w==",
//         "dev": true,
//         "requires": {
//           "pump": "^3.0.0"
//         }
//       },
//       "glob": {
//         "version": "7.1.7",
//         "resolved": "https://registry.npmjs.org/glob/-/glob-7.1.7.tgz",
//         "integrity": "sha512-OvD9ENzPLbegENnYP5UUfJIirTg4+XwMWGaQfQTY0JenxNvvIKP3U3/tAQSPIu/lHxXYSZmpXlUHeqAIdKzBLQ==",
//         "requires": {
//           "fs.realpath": "^1.0.0",
//           "inflight": "^1.0.4",
//           "inherits": "2",
//           "minimatch": "^3.0.4",
//           "once": "^1.3.0",
//           "path-is-absolute": "^1.0.0"
//         }
//       },
//       "glob-parent": {
//         "version": "5.1.2",
//         "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
//         "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
//         "dev": true,
//         "requires": {
//           "is-glob": "^4.0.1"
//         }
//       },
//       "global-dirs": {
//         "version": "2.1.0",
//         "resolved": "https://registry.npmjs.org/global-dirs/-/global-dirs-2.1.0.tgz",
//         "integrity": "sha512-MG6kdOUh/xBnyo9cJFeIKkLEc1AyFq42QTU4XiX51i2NEdxLxLWXIjEjmqKeSuKR7pAZjTqUVoT2b2huxVLgYQ==",
//         "dev": true,
//         "requires": {
//           "ini": "1.3.7"
//         }
//       },
//       "got": {
//         "version": "9.6.0",
//         "resolved": "https://registry.npmjs.org/got/-/got-9.6.0.tgz",
//         "integrity": "sha512-R7eWptXuGYxwijs0eV+v3o6+XH1IqVK8dJOEecQfTmkncw9AV4dcw/Dhxi8MdlqPthxxpZyizMzyg8RTmEsG+Q==",
//         "dev": true,
//         "requires": {
//           "@sindresorhus/is": "^0.14.0",
//           "@szmarczak/http-timer": "^1.1.2",
//           "cacheable-request": "^6.0.0",
//           "decompress-response": "^3.3.0",
//           "duplexer3": "^0.1.4",
//           "get-stream": "^4.1.0",
//           "lowercase-keys": "^1.0.1",
//           "mimic-response": "^1.0.1",
//           "p-cancelable": "^1.0.0",
//           "to-readable-stream": "^1.0.0",
//           "url-parse-lax": "^3.0.0"
//         }
//       },
//       "graceful-fs": {
//         "version": "4.2.6",
//         "resolved": "https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.6.tgz",
//         "integrity": "sha512-nTnJ528pbqxYanhpDYsi4Rd8MAeaBA67+RZ10CM1m3bTAVFEDcd5AuA4a6W5YkGZ1iNXHzZz8T6TBKLeBuNriQ==",
//         "dev": true
//       },
//       "has-flag": {
//         "version": "3.0.0",
//         "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-3.0.0.tgz",
//         "integrity": "sha1-tdRU3CGZriJWmfNGfloH87lVuv0=",
//         "dev": true
//       },
//       "has-unicode": {
//         "version": "2.0.1",
//         "resolved": "https://registry.npmjs.org/has-unicode/-/has-unicode-2.0.1.tgz",
//         "integrity": "sha1-4Ob+aijPUROIVeCG0Wkedx3iqLk="
//       },
//       "has-yarn": {
//         "version": "2.1.0",
//         "resolved": "https://registry.npmjs.org/has-yarn/-/has-yarn-2.1.0.tgz",
//         "integrity": "sha512-UqBRqi4ju7T+TqGNdqAO0PaSVGsDGJUBQvk9eUWNGRY1CFGDzYhLWoM7JQEemnlvVcv/YEmc2wNW8BC24EnUsw==",
//         "dev": true
//       },
//       "http-cache-semantics": {
//         "version": "4.1.0",
//         "resolved": "https://registry.npmjs.org/http-cache-semantics/-/http-cache-semantics-4.1.0.tgz",
//         "integrity": "sha512-carPklcUh7ROWRK7Cv27RPtdhYhUsela/ue5/jKzjegVvXDqM2ILE9Q2BGn9JZJh1g87cp56su/FgQSzcWS8cQ==",
//         "dev": true
//       },
//       "http-errors": {
//         "version": "1.7.2",
//         "resolved": "https://registry.npmjs.org/http-errors/-/http-errors-1.7.2.tgz",
//         "integrity": "sha512-uUQBt3H/cSIVfch6i1EuPNy/YsRSOUBXTVfZ+yR7Zjez3qjBz6i9+i4zjNaoqcoFVI4lQJ5plg63TvGfRSDCRg==",
//         "requires": {
//           "depd": "~1.1.2",
//           "inherits": "2.0.3",
//           "setprototypeof": "1.1.1",
//           "statuses": ">= 1.5.0 < 2",
//           "toidentifier": "1.0.0"
//         }
//       },
//       "httpntlm": {
//         "version": "1.6.1",
//         "resolved": "https://registry.npmjs.org/httpntlm/-/httpntlm-1.6.1.tgz",
//         "integrity": "sha1-rQFScUOi6Hc8+uapb1hla7UqNLI=",
//         "requires": {
//           "httpreq": ">=0.4.22",
//           "underscore": "~1.7.0"
//         }
//       },
//       "httpreq": {
//         "version": "0.5.2",
//         "resolved": "https://registry.npmjs.org/httpreq/-/httpreq-0.5.2.tgz",
//         "integrity": "sha512-2Jm+x9WkExDOeFRrdBCBSpLPT5SokTcRHkunV3pjKmX/cx6av8zQ0WtHUMDrYb6O4hBFzNU6sxJEypvRUVYKnw=="
//       },
//       "https-proxy-agent": {
//         "version": "5.0.0",
//         "resolved": "https://registry.npmjs.org/https-proxy-agent/-/https-proxy-agent-5.0.0.tgz",
//         "integrity": "sha512-EkYm5BcKUGiduxzSt3Eppko+PiNWNEpa4ySk9vTC6wDsQJW9rHSa+UhGNJoRYp7bz6Ht1eaRIa6QaJqO5rCFbA==",
//         "requires": {
//           "agent-base": "6",
//           "debug": "4"
//         },
//         "dependencies": {
//           "debug": {
//             "version": "4.3.2",
//             "resolved": "https://registry.npmjs.org/debug/-/debug-4.3.2.tgz",
//             "integrity": "sha512-mOp8wKcvj7XxC78zLgw/ZA+6TSgkoE2C/ienthhRD298T7UNwAg9diBpLRxC0mOezLl4B0xV7M0cCO6P/O0Xhw==",
//             "requires": {
//               "ms": "2.1.2"
//             }
//           },
//           "ms": {
//             "version": "2.1.2",
//             "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.2.tgz",
//             "integrity": "sha512-sGkPx+VjMtmA6MX27oA4FBFELFCZZ4S4XqeGOXCv68tT+jb3vk/RyaKWP0PTKyWtmLSM0b+adUTEvbs1PEaH2w=="
//           }
//         }
//       },
//       "iconv-lite": {
//         "version": "0.4.24",
//         "resolved": "https://registry.npmjs.org/iconv-lite/-/iconv-lite-0.4.24.tgz",
//         "integrity": "sha512-v3MXnZAcvnywkTUEZomIActle7RXXeedOR31wwl7VlyoXO4Qi9arvSenNQWne1TcRwhCL1HwLI21bEqdpj8/rA==",
//         "requires": {
//           "safer-buffer": ">= 2.1.2 < 3"
//         }
//       },
//       "ieee754": {
//         "version": "1.2.1",
//         "resolved": "https://registry.npmjs.org/ieee754/-/ieee754-1.2.1.tgz",
//         "integrity": "sha512-dcyqhDvX1C46lXZcVqCpK+FtMRQVdIMN6/Df5js2zouUsqG7I6sFxitIC+7KYK29KdXOLHdu9zL4sFnoVQnqaA=="
//       },
//       "ignore-by-default": {
//         "version": "1.0.1",
//         "resolved": "https://registry.npmjs.org/ignore-by-default/-/ignore-by-default-1.0.1.tgz",
//         "integrity": "sha1-SMptcvbGo68Aqa1K5odr44ieKwk=",
//         "dev": true
//       },
//       "import-lazy": {
//         "version": "2.1.0",
//         "resolved": "https://registry.npmjs.org/import-lazy/-/import-lazy-2.1.0.tgz",
//         "integrity": "sha1-BWmOPUXIjo1+nZLLBYTnfwlvPkM=",
//         "dev": true
//       },
//       "imurmurhash": {
//         "version": "0.1.4",
//         "resolved": "https://registry.npmjs.org/imurmurhash/-/imurmurhash-0.1.4.tgz",
//         "integrity": "sha1-khi5srkoojixPcT7a21XbyMUU+o=",
//         "dev": true
//       },
//       "inflight": {
//         "version": "1.0.6",
//         "resolved": "https://registry.npmjs.org/inflight/-/inflight-1.0.6.tgz",
//         "integrity": "sha1-Sb1jMdfQLQwJvJEKEHW6gWW1bfk=",
//         "requires": {
//           "once": "^1.3.0",
//           "wrappy": "1"
//         }
//       },
//       "inherits": {
//         "version": "2.0.3",
//         "resolved": "https://registry.npmjs.org/inherits/-/inherits-2.0.3.tgz",
//         "integrity": "sha1-Yzwsg+PaQqUC9SRmAiSA9CCCYd4="
//       },
//       "ini": {
//         "version": "1.3.7",
//         "resolved": "https://registry.npmjs.org/ini/-/ini-1.3.7.tgz",
//         "integrity": "sha512-iKpRpXP+CrP2jyrxvg1kMUpXDyRUFDWurxbnVT1vQPx+Wz9uCYsMIqYuSBLV+PAaZG/d7kRLKRFc9oDMsH+mFQ==",
//         "dev": true
//       },
//       "ipaddr.js": {
//         "version": "1.9.1",
//         "resolved": "https://registry.npmjs.org/ipaddr.js/-/ipaddr.js-1.9.1.tgz",
//         "integrity": "sha512-0KI/607xoxSToH7GjN1FfSbLoU0+btTicjsQSWQlh/hZykN8KpmMf7uYwPW3R+akZ6R/w18ZlXSHBYXiYUPO3g=="
//       },
//       "is-binary-path": {
//         "version": "2.1.0",
//         "resolved": "https://registry.npmjs.org/is-binary-path/-/is-binary-path-2.1.0.tgz",
//         "integrity": "sha512-ZMERYes6pDydyuGidse7OsHxtbI7WVeUEozgR/g7rd0xUimYNlvZRE/K2MgZTjWy725IfelLeVcEM97mmtRGXw==",
//         "dev": true,
//         "requires": {
//           "binary-extensions": "^2.0.0"
//         }
//       },
//       "is-ci": {
//         "version": "2.0.0",
//         "resolved": "https://registry.npmjs.org/is-ci/-/is-ci-2.0.0.tgz",
//         "integrity": "sha512-YfJT7rkpQB0updsdHLGWrvhBJfcfzNNawYDNIyQXJz0IViGf75O8EBPKSdvw2rF+LGCsX4FZ8tcr3b19LcZq4w==",
//         "dev": true,
//         "requires": {
//           "ci-info": "^2.0.0"
//         }
//       },
//       "is-extglob": {
//         "version": "2.1.1",
//         "resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
//         "integrity": "sha1-qIwCU1eR8C7TfHahueqXc8gz+MI=",
//         "dev": true
//       },
//       "is-fullwidth-code-point": {
//         "version": "2.0.0",
//         "resolved": "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-2.0.0.tgz",
//         "integrity": "sha1-o7MKXE8ZkYMWeqq5O+764937ZU8="
//       },
//       "is-glob": {
//         "version": "4.0.1",
//         "resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.1.tgz",
//         "integrity": "sha512-5G0tKtBTFImOqDnLB2hG6Bp2qcKEFduo4tZu9MT/H6NQv/ghhy30o55ufafxJ/LdH79LLs2Kfrn85TLKyA7BUg==",
//         "dev": true,
//         "requires": {
//           "is-extglob": "^2.1.1"
//         }
//       },
//       "is-installed-globally": {
//         "version": "0.3.2",
//         "resolved": "https://registry.npmjs.org/is-installed-globally/-/is-installed-globally-0.3.2.tgz",
//         "integrity": "sha512-wZ8x1js7Ia0kecP/CHM/3ABkAmujX7WPvQk6uu3Fly/Mk44pySulQpnHG46OMjHGXApINnV4QhY3SWnECO2z5g==",
//         "dev": true,
//         "requires": {
//           "global-dirs": "^2.0.1",
//           "is-path-inside": "^3.0.1"
//         }
//       },
//       "is-npm": {
//         "version": "4.0.0",
//         "resolved": "https://registry.npmjs.org/is-npm/-/is-npm-4.0.0.tgz",
//         "integrity": "sha512-96ECIfh9xtDDlPylNPXhzjsykHsMJZ18ASpaWzQyBr4YRTcVjUvzaHayDAES2oU/3KpljhHUjtSRNiDwi0F0ig==",
//         "dev": true
//       },
//       "is-number": {
//         "version": "7.0.0",
//         "resolved": "https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz",
//         "integrity": "sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==",
//         "dev": true
//       },
//       "is-obj": {
//         "version": "2.0.0",
//         "resolved": "https://registry.npmjs.org/is-obj/-/is-obj-2.0.0.tgz",
//         "integrity": "sha512-drqDG3cbczxxEJRoOXcOjtdp1J/lyp1mNn0xaznRs8+muBhgQcrnbspox5X5fOw0HnMnbfDzvnEMEtqDEJEo8w==",
//         "dev": true
//       },
//       "is-path-inside": {
//         "version": "3.0.3",
//         "resolved": "https://registry.npmjs.org/is-path-inside/-/is-path-inside-3.0.3.tgz",
//         "integrity": "sha512-Fd4gABb+ycGAmKou8eMftCupSir5lRxqf4aD/vd0cD2qc4HL07OjCeuHMr8Ro4CoMaeCKDB0/ECBOVWjTwUvPQ==",
//         "dev": true
//       },
//       "is-typedarray": {
//         "version": "1.0.0",
//         "resolved": "https://registry.npmjs.org/is-typedarray/-/is-typedarray-1.0.0.tgz",
//         "integrity": "sha1-5HnICFjfDBsR3dppQPlgEfzaSpo=",
//         "dev": true
//       },
//       "is-yarn-global": {
//         "version": "0.3.0",
//         "resolved": "https://registry.npmjs.org/is-yarn-global/-/is-yarn-global-0.3.0.tgz",
//         "integrity": "sha512-VjSeb/lHmkoyd8ryPVIKvOCn4D1koMqY+vqyjjUfc3xyKtP4dYOxM44sZrnqQSzSds3xyOrUTLTC9LVCVgLngw==",
//         "dev": true
//       },
//       "isarray": {
//         "version": "1.0.0",
//         "resolved": "https://registry.npmjs.org/isarray/-/isarray-1.0.0.tgz",
//         "integrity": "sha1-u5NdSFgsuhaMBoNJV6VKPgcSTxE="
//       },
//       "joi": {
//         "version": "17.4.2",
//         "resolved": "https://registry.npmjs.org/joi/-/joi-17.4.2.tgz",
//         "integrity": "sha512-Lm56PP+n0+Z2A2rfRvsfWVDXGEWjXxatPopkQ8qQ5mxCEhwHG+Ettgg5o98FFaxilOxozoa14cFhrE/hOzh/Nw==",
//         "requires": {
//           "@hapi/hoek": "^9.0.0",
//           "@hapi/topo": "^5.0.0",
//           "@sideway/address": "^4.1.0",
//           "@sideway/formula": "^3.0.0",
//           "@sideway/pinpoint": "^2.0.0"
//         }
//       },
//       "json-buffer": {
//         "version": "3.0.0",
//         "resolved": "https://registry.npmjs.org/json-buffer/-/json-buffer-3.0.0.tgz",
//         "integrity": "sha1-Wx85evx11ne96Lz8Dkfh+aPZqJg=",
//         "dev": true
//       },
//       "jsonwebtoken": {
//         "version": "8.5.1",
//         "resolved": "https://registry.npmjs.org/jsonwebtoken/-/jsonwebtoken-8.5.1.tgz",
//         "integrity": "sha512-XjwVfRS6jTMsqYs0EsuJ4LGxXV14zQybNd4L2r0UvbVnSF9Af8x7p5MzbJ90Ioz/9TI41/hTCvznF/loiSzn8w==",
//         "requires": {
//           "jws": "^3.2.2",
//           "lodash.includes": "^4.3.0",
//           "lodash.isboolean": "^3.0.3",
//           "lodash.isinteger": "^4.0.4",
//           "lodash.isnumber": "^3.0.3",
//           "lodash.isplainobject": "^4.0.6",
//           "lodash.isstring": "^4.0.1",
//           "lodash.once": "^4.0.0",
//           "ms": "^2.1.1",
//           "semver": "^5.6.0"
//         },
//         "dependencies": {
//           "ms": {
//             "version": "2.1.3",
//             "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
//             "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA=="
//           }
//         }
//       },
//       "jwa": {
//         "version": "1.4.1",
//         "resolved": "https://registry.npmjs.org/jwa/-/jwa-1.4.1.tgz",
//         "integrity": "sha512-qiLX/xhEEFKUAJ6FiBMbes3w9ATzyk5W7Hvzpa/SLYdxNtng+gcurvrI7TbACjIXlsJyr05/S1oUhZrc63evQA==",
//         "requires": {
//           "buffer-equal-constant-time": "1.0.1",
//           "ecdsa-sig-formatter": "1.0.11",
//           "safe-buffer": "^5.0.1"
//         }
//       },
//       "jws": {
//         "version": "3.2.2",
//         "resolved": "https://registry.npmjs.org/jws/-/jws-3.2.2.tgz",
//         "integrity": "sha512-YHlZCB6lMTllWDtSPHz/ZXTsi8S00usEV6v1tjq8tOUZzw7DpSDWVXjXDre6ed1w/pd495ODpHZYSdkRTsa0HA==",
//         "requires": {
//           "jwa": "^1.4.1",
//           "safe-buffer": "^5.0.1"
//         }
//       },
//       "keyv": {
//         "version": "3.1.0",
//         "resolved": "https://registry.npmjs.org/keyv/-/keyv-3.1.0.tgz",
//         "integrity": "sha512-9ykJ/46SN/9KPM/sichzQ7OvXyGDYKGTaDlKMGCAlg2UK8KRy4jb0d8sFc+0Tt0YYnThq8X2RZgCg74RPxgcVA==",
//         "dev": true,
//         "requires": {
//           "json-buffer": "3.0.0"
//         }
//       },
//       "latest-version": {
//         "version": "5.1.0",
//         "resolved": "https://registry.npmjs.org/latest-version/-/latest-version-5.1.0.tgz",
//         "integrity": "sha512-weT+r0kTkRQdCdYCNtkMwWXQTMEswKrFBkm4ckQOMVhhqhIMI1UT2hMj+1iigIhgSZm5gTmrRXBNoGUgaTY1xA==",
//         "dev": true,
//         "requires": {
//           "package-json": "^6.3.0"
//         }
//       },
//       "lodash": {
//         "version": "4.17.21",
//         "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
//         "integrity": "sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg=="
//       },
//       "lodash.includes": {
//         "version": "4.3.0",
//         "resolved": "https://registry.npmjs.org/lodash.includes/-/lodash.includes-4.3.0.tgz",
//         "integrity": "sha1-YLuYqHy5I8aMoeUTJUgzFISfVT8="
//       },
//       "lodash.isboolean": {
//         "version": "3.0.3",
//         "resolved": "https://registry.npmjs.org/lodash.isboolean/-/lodash.isboolean-3.0.3.tgz",
//         "integrity": "sha1-bC4XHbKiV82WgC/UOwGyDV9YcPY="
//       },
//       "lodash.isinteger": {
//         "version": "4.0.4",
//         "resolved": "https://registry.npmjs.org/lodash.isinteger/-/lodash.isinteger-4.0.4.tgz",
//         "integrity": "sha1-YZwK89A/iwTDH1iChAt3sRzWg0M="
//       },
//       "lodash.isnumber": {
//         "version": "3.0.3",
//         "resolved": "https://registry.npmjs.org/lodash.isnumber/-/lodash.isnumber-3.0.3.tgz",
//         "integrity": "sha1-POdoEMWSjQM1IwGsKHMX8RwLH/w="
//       },
//       "lodash.isplainobject": {
//         "version": "4.0.6",
//         "resolved": "https://registry.npmjs.org/lodash.isplainobject/-/lodash.isplainobject-4.0.6.tgz",
//         "integrity": "sha1-fFJqUtibRcRcxpC4gWO+BJf1UMs="
//       },
//       "lodash.isstring": {
//         "version": "4.0.1",
//         "resolved": "https://registry.npmjs.org/lodash.isstring/-/lodash.isstring-4.0.1.tgz",
//         "integrity": "sha1-1SfftUVuynzJu5XV2ur4i6VKVFE="
//       },
//       "lodash.once": {
//         "version": "4.1.1",
//         "resolved": "https://registry.npmjs.org/lodash.once/-/lodash.once-4.1.1.tgz",
//         "integrity": "sha1-DdOXEhPHxW34gJd9UEyI+0cal6w="
//       },
//       "lowercase-keys": {
//         "version": "1.0.1",
//         "resolved": "https://registry.npmjs.org/lowercase-keys/-/lowercase-keys-1.0.1.tgz",
//         "integrity": "sha512-G2Lj61tXDnVFFOi8VZds+SoQjtQC3dgokKdDG2mTm1tx4m50NUHBOZSBwQQHyy0V12A0JTG4icfZQH+xPyh8VA==",
//         "dev": true
//       },
//       "lru-cache": {
//         "version": "6.0.0",
//         "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-6.0.0.tgz",
//         "integrity": "sha512-Jo6dJ04CmSjuznwJSS3pUeWmd/H0ffTlkXXgwZi+eq1UCmqQwCh+eLsYOYCwY991i2Fah4h1BEMCx4qThGbsiA==",
//         "requires": {
//           "yallist": "^4.0.0"
//         }
//       },
//       "make-dir": {
//         "version": "3.1.0",
//         "resolved": "https://registry.npmjs.org/make-dir/-/make-dir-3.1.0.tgz",
//         "integrity": "sha512-g3FeP20LNwhALb/6Cz6Dd4F2ngze0jz7tbzrD2wAV+o9FeNHe4rL+yK2md0J/fiSf1sa1ADhXqi5+oVwOM/eGw==",
//         "requires": {
//           "semver": "^6.0.0"
//         },
//         "dependencies": {
//           "semver": {
//             "version": "6.3.0",
//             "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.0.tgz",
//             "integrity": "sha512-b39TBaTSfV6yBrapU89p5fKekE2m/NwnDocOVruQFS1/veMgdzuPcnOM34M6CwxW8jH/lxEa5rBoDeUwu5HHTw=="
//           }
//         }
//       },
//       "media-typer": {
//         "version": "0.3.0",
//         "resolved": "https://registry.npmjs.org/media-typer/-/media-typer-0.3.0.tgz",
//         "integrity": "sha1-hxDXrwqmJvj/+hzgAWhUUmMlV0g="
//       },
//       "memory-pager": {
//         "version": "1.5.0",
//         "resolved": "https://registry.npmjs.org/memory-pager/-/memory-pager-1.5.0.tgz",
//         "integrity": "sha512-ZS4Bp4r/Zoeq6+NLJpP+0Zzm0pR8whtGPf1XExKLJBAczGMnSi3It14OiNCStjQjM6NU1okjQGSxgEZN8eBYKg==",
//         "optional": true
//       },
//       "merge-descriptors": {
//         "version": "1.0.1",
//         "resolved": "https://registry.npmjs.org/merge-descriptors/-/merge-descriptors-1.0.1.tgz",
//         "integrity": "sha1-sAqqVW3YtEVoFQ7J0blT8/kMu2E="
//       },
//       "methods": {
//         "version": "1.1.2",
//         "resolved": "https://registry.npmjs.org/methods/-/methods-1.1.2.tgz",
//         "integrity": "sha1-VSmk1nZUE07cxSZmVoNbD4Ua/O4="
//       },
//       "mime": {
//         "version": "1.6.0",
//         "resolved": "https://registry.npmjs.org/mime/-/mime-1.6.0.tgz",
//         "integrity": "sha512-x0Vn8spI+wuJ1O6S7gnbaQg8Pxh4NNHb7KSINmEWKiPE4RKOplvijn+NkmYmmRgP68mc70j2EbeTFRsrswaQeg=="
//       },
//       "mime-db": {
//         "version": "1.49.0",
//         "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.49.0.tgz",
//         "integrity": "sha512-CIc8j9URtOVApSFCQIF+VBkX1RwXp/oMMOrqdyXSBXq5RWNEsRfyj1kiRnQgmNXmHxPoFIxOroKA3zcU9P+nAA=="
//       },
//       "mime-types": {
//         "version": "2.1.32",
//         "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-2.1.32.tgz",
//         "integrity": "sha512-hJGaVS4G4c9TSMYh2n6SQAGrC4RnfU+daP8G7cSCmaqNjiOoUY0VHCMS42pxnQmVF1GWwFhbHWn3RIxCqTmZ9A==",
//         "requires": {
//           "mime-db": "1.49.0"
//         }
//       },
//       "mimic-response": {
//         "version": "1.0.1",
//         "resolved": "https://registry.npmjs.org/mimic-response/-/mimic-response-1.0.1.tgz",
//         "integrity": "sha512-j5EctnkH7amfV/q5Hgmoal1g2QHFJRraOtmx0JpIqkxhBhI/lJSl1nMpQ45hVarwNETOoWEimndZ4QK0RHxuxQ==",
//         "dev": true
//       },
//       "minimatch": {
//         "version": "3.0.4",
//         "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-3.0.4.tgz",
//         "integrity": "sha512-yJHVQEhyqPLUTgt9B83PXu6W3rx4MvvHvSUvToogpwoGDOUQ+yDrR0HRot+yOCdCO7u4hX3pWft6kWBBcqh0UA==",
//         "requires": {
//           "brace-expansion": "^1.1.7"
//         }
//       },
//       "minimist": {
//         "version": "1.2.5",
//         "resolved": "https://registry.npmjs.org/minimist/-/minimist-1.2.5.tgz",
//         "integrity": "sha512-FM9nNUYrRBAELZQT3xeZQ7fmMOBg6nWNmJKTcgsJeaLstP/UODVpGsr5OhXhhXg6f+qtJ8uiZ+PUxkDWcgIXLw==",
//         "dev": true
//       },
//       "minipass": {
//         "version": "3.1.3",
//         "resolved": "https://registry.npmjs.org/minipass/-/minipass-3.1.3.tgz",
//         "integrity": "sha512-Mgd2GdMVzY+x3IJ+oHnVM+KG3lA5c8tnabyJKmHSaG2kAGpudxuOf8ToDkhumF7UzME7DecbQE9uOZhNm7PuJg==",
//         "requires": {
//           "yallist": "^4.0.0"
//         }
//       },
//       "minizlib": {
//         "version": "2.1.2",
//         "resolved": "https://registry.npmjs.org/minizlib/-/minizlib-2.1.2.tgz",
//         "integrity": "sha512-bAxsR8BVfj60DWXHE3u30oHzfl4G7khkSuPW+qvpd7jFRHm7dLxOjUk1EHACJ/hxLY8phGJ0YhYHZo7jil7Qdg==",
//         "requires": {
//           "minipass": "^3.0.0",
//           "yallist": "^4.0.0"
//         }
//       },
//       "mkdirp": {
//         "version": "1.0.4",
//         "resolved": "https://registry.npmjs.org/mkdirp/-/mkdirp-1.0.4.tgz",
//         "integrity": "sha512-vVqVZQyf3WLx2Shd0qJ9xuvqgAyKPLAiqITEtqW0oIUjzo3PePDd6fW9iFz30ef7Ysp/oiWqbhszeGWW2T6Gzw=="
//       },
//       "mongodb": {
//         "version": "4.1.0",
//         "resolved": "https://registry.npmjs.org/mongodb/-/mongodb-4.1.0.tgz",
//         "integrity": "sha512-Gx9U9MsFWgJ3E0v4oHAdWvYTGBznNYPCkhmD/3i/kPTY/URnPfHD5/6VoKUFrdgQTK3icFiM9976hVbqCRBO9Q==",
//         "requires": {
//           "bson": "^4.4.0",
//           "denque": "^1.5.0",
//           "mongodb-connection-string-url": "^1.0.1",
//           "saslprep": "^1.0.0"
//         }
//       },
//       "mongodb-connection-string-url": {
//         "version": "1.1.0",
//         "resolved": "https://registry.npmjs.org/mongodb-connection-string-url/-/mongodb-connection-string-url-1.1.0.tgz",
//         "integrity": "sha512-g0Qaj4AzIaktWKBkfjMjwzvBzZQN1mtb2DVOTbjdvlaqTa5lGLcnTeh0/9R9mPiIt2lvRGOrDgUdazeP5rD9oA==",
//         "requires": {
//           "@types/whatwg-url": "^8.0.0",
//           "whatwg-url": "^8.4.0"
//         }
//       },
//       "ms": {
//         "version": "2.0.0",
//         "resolved": "https://registry.npmjs.org/ms/-/ms-2.0.0.tgz",
//         "integrity": "sha1-VgiurfwAvmwpAd9fmGF4jeDVl8g="
//       },
//       "negotiator": {
//         "version": "0.6.2",
//         "resolved": "https://registry.npmjs.org/negotiator/-/negotiator-0.6.2.tgz",
//         "integrity": "sha512-hZXc7K2e+PgeI1eDBe/10Ard4ekbfrrqG8Ep+8Jmf4JID2bNg7NvCPOZN+kfF574pFQI7mum2AUqDidoKqcTOw=="
//       },
//       "node-addon-api": {
//         "version": "3.2.1",
//         "resolved": "https://registry.npmjs.org/node-addon-api/-/node-addon-api-3.2.1.tgz",
//         "integrity": "sha512-mmcei9JghVNDYydghQmeDX8KoAm0FAiYyIcUt/N4nhyAipB17pllZQDOJD2fotxABnt4Mdz+dKTO7eftLg4d0A=="
//       },
//       "node-fetch": {
//         "version": "2.6.1",
//         "resolved": "https://registry.npmjs.org/node-fetch/-/node-fetch-2.6.1.tgz",
//         "integrity": "sha512-V4aYg89jEoVRxRb2fJdAg8FHvI7cEyYdVAh94HH0UIK8oJxUfkjlDQN9RbMx+bEjP7+ggMiFRprSti032Oipxw=="
//       },
//       "nodemailer": {
//         "version": "6.7.0",
//         "resolved": "https://registry.npmjs.org/nodemailer/-/nodemailer-6.7.0.tgz",
//         "integrity": "sha512-AtiTVUFHLiiDnMQ43zi0YgkzHOEWUkhDgPlBXrsDzJiJvB29Alo4OKxHQ0ugF3gRqRQIneCLtZU3yiUo7pItZw=="
//       },
//       "nodemailer-fetch": {
//         "version": "1.6.0",
//         "resolved": "https://registry.npmjs.org/nodemailer-fetch/-/nodemailer-fetch-1.6.0.tgz",
//         "integrity": "sha1-ecSQihwPXzdbc/6IjamCj23JY6Q="
//       },
//       "nodemailer-shared": {
//         "version": "1.1.0",
//         "resolved": "https://registry.npmjs.org/nodemailer-shared/-/nodemailer-shared-1.1.0.tgz",
//         "integrity": "sha1-z1mU4v0mjQD1zw+nZ6CBae2wfsA=",
//         "requires": {
//           "nodemailer-fetch": "1.6.0"
//         }
//       },
//       "nodemailer-smtp-transport": {
//         "version": "2.7.4",
//         "resolved": "https://registry.npmjs.org/nodemailer-smtp-transport/-/nodemailer-smtp-transport-2.7.4.tgz",
//         "integrity": "sha1-DYmvAZoUSkgP2OzJmZfZ+DjxNoU=",
//         "requires": {
//           "nodemailer-shared": "1.1.0",
//           "nodemailer-wellknown": "0.1.10",
//           "smtp-connection": "2.12.0"
//         }
//       },
//       "nodemailer-wellknown": {
//         "version": "0.1.10",
//         "resolved": "https://registry.npmjs.org/nodemailer-wellknown/-/nodemailer-wellknown-0.1.10.tgz",
//         "integrity": "sha1-WG24EB2zDLRDjrVGc3pBqtDPE9U="
//       },
//       "nodemon": {
//         "version": "2.0.12",
//         "resolved": "https://registry.npmjs.org/nodemon/-/nodemon-2.0.12.tgz",
//         "integrity": "sha512-egCTmNZdObdBxUBw6ZNwvZ/xzk24CKRs5K6d+5zbmrMr7rOpPmfPeF6OxM3DDpaRx331CQRFEktn+wrFFfBSOA==",
//         "dev": true,
//         "requires": {
//           "chokidar": "^3.2.2",
//           "debug": "^3.2.6",
//           "ignore-by-default": "^1.0.1",
//           "minimatch": "^3.0.4",
//           "pstree.remy": "^1.1.7",
//           "semver": "^5.7.1",
//           "supports-color": "^5.5.0",
//           "touch": "^3.1.0",
//           "undefsafe": "^2.0.3",
//           "update-notifier": "^4.1.0"
//         },
//         "dependencies": {
//           "debug": {
//             "version": "3.2.7",
//             "resolved": "https://registry.npmjs.org/debug/-/debug-3.2.7.tgz",
//             "integrity": "sha512-CFjzYYAi4ThfiQvizrFQevTTXHtnCqWfe7x1AhgEscTz6ZbLbfoLRLPugTQyBth6f8ZERVUSyWHFD/7Wu4t1XQ==",
//             "dev": true,
//             "requires": {
//               "ms": "^2.1.1"
//             }
//           },
//           "ms": {
//             "version": "2.1.3",
//             "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
//             "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
//             "dev": true
//           }
//         }
//       },
//       "nopt": {
//         "version": "1.0.10",
//         "resolved": "https://registry.npmjs.org/nopt/-/nopt-1.0.10.tgz",
//         "integrity": "sha1-bd0hvSoxQXuScn3Vhfim83YI6+4=",
//         "dev": true,
//         "requires": {
//           "abbrev": "1"
//         }
//       },
//       "normalize-path": {
//         "version": "3.0.0",
//         "resolved": "https://registry.npmjs.org/normalize-path/-/normalize-path-3.0.0.tgz",
//         "integrity": "sha512-6eZs5Ls3WtCisHWp9S2GUy8dqkpGi4BVSz3GaqiE6ezub0512ESztXUwUB6C6IKbQkY2Pnb/mD4WYojCRwcwLA==",
//         "dev": true
//       },
//       "normalize-url": {
//         "version": "4.5.1",
//         "resolved": "https://registry.npmjs.org/normalize-url/-/normalize-url-4.5.1.tgz",
//         "integrity": "sha512-9UZCFRHQdNrfTpGg8+1INIg93B6zE0aXMVFkw1WFwvO4SlZywU6aLg5Of0Ap/PgcbSw4LNxvMWXMeugwMCX0AA==",
//         "dev": true
//       },
//       "npmlog": {
//         "version": "4.1.2",
//         "resolved": "https://registry.npmjs.org/npmlog/-/npmlog-4.1.2.tgz",
//         "integrity": "sha512-2uUqazuKlTaSI/dC8AzicUck7+IrEaOnN/e0jd3Xtt1KcGpwx30v50mL7oPyr/h9bL3E4aZccVwpwP+5W9Vjkg==",
//         "requires": {
//           "are-we-there-yet": "~1.1.2",
//           "console-control-strings": "~1.1.0",
//           "gauge": "~2.7.3",
//           "set-blocking": "~2.0.0"
//         }
//       },
//       "number-is-nan": {
//         "version": "1.0.1",
//         "resolved": "https://registry.npmjs.org/number-is-nan/-/number-is-nan-1.0.1.tgz",
//         "integrity": "sha1-CXtgK1NCKlIsGvuHkDGDNpQaAR0="
//       },
//       "object-assign": {
//         "version": "4.1.1",
//         "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
//         "integrity": "sha1-IQmtx5ZYh8/AXLvUQsrIv7s2CGM="
//       },
//       "on-finished": {
//         "version": "2.3.0",
//         "resolved": "https://registry.npmjs.org/on-finished/-/on-finished-2.3.0.tgz",
//         "integrity": "sha1-IPEzZIGwg811M3mSoWlxqi2QaUc=",
//         "requires": {
//           "ee-first": "1.1.1"
//         }
//       },
//       "once": {
//         "version": "1.4.0",
//         "resolved": "https://registry.npmjs.org/once/-/once-1.4.0.tgz",
//         "integrity": "sha1-WDsap3WWHUsROsF9nFC6753Xa9E=",
//         "requires": {
//           "wrappy": "1"
//         }
//       },
//       "p-cancelable": {
//         "version": "1.1.0",
//         "resolved": "https://registry.npmjs.org/p-cancelable/-/p-cancelable-1.1.0.tgz",
//         "integrity": "sha512-s73XxOZ4zpt1edZYZzvhqFa6uvQc1vwUa0K0BdtIZgQMAJj9IbebH+JkgKZc9h+B05PKHLOTl4ajG1BmNrVZlw==",
//         "dev": true
//       },
//       "package-json": {
//         "version": "6.5.0",
//         "resolved": "https://registry.npmjs.org/package-json/-/package-json-6.5.0.tgz",
//         "integrity": "sha512-k3bdm2n25tkyxcjSKzB5x8kfVxlMdgsbPr0GkZcwHsLpba6cBjqCt1KlcChKEvxHIcTB1FVMuwoijZ26xex5MQ==",
//         "dev": true,
//         "requires": {
//           "got": "^9.6.0",
//           "registry-auth-token": "^4.0.0",
//           "registry-url": "^5.0.0",
//           "semver": "^6.2.0"
//         },
//         "dependencies": {
//           "semver": {
//             "version": "6.3.0",
//             "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.0.tgz",
//             "integrity": "sha512-b39TBaTSfV6yBrapU89p5fKekE2m/NwnDocOVruQFS1/veMgdzuPcnOM34M6CwxW8jH/lxEa5rBoDeUwu5HHTw==",
//             "dev": true
//           }
//         }
//       },
//       "parseurl": {
//         "version": "1.3.3",
//         "resolved": "https://registry.npmjs.org/parseurl/-/parseurl-1.3.3.tgz",
//         "integrity": "sha512-CiyeOxFT/JZyN5m0z9PfXw4SCBJ6Sygz1Dpl0wqjlhDEGGBP1GnsUVEL0p63hoG1fcj3fHynXi9NYO4nWOL+qQ=="
//       },
//       "path-is-absolute": {
//         "version": "1.0.1",
//         "resolved": "https://registry.npmjs.org/path-is-absolute/-/path-is-absolute-1.0.1.tgz",
//         "integrity": "sha1-F0uSaHNVNP+8es5r9TpanhtcX18="
//       },
//       "path-to-regexp": {
//         "version": "0.1.7",
//         "resolved": "https://registry.npmjs.org/path-to-regexp/-/path-to-regexp-0.1.7.tgz",
//         "integrity": "sha1-32BBeABfUi8V60SQ5yR6G/qmf4w="
//       },
//       "picomatch": {
//         "version": "2.3.0",
//         "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-2.3.0.tgz",
//         "integrity": "sha512-lY1Q/PiJGC2zOv/z391WOTD+Z02bCgsFfvxoXXf6h7kv9o+WmsmzYqrAwY63sNgOxE4xEdq0WyUnXfKeBrSvYw==",
//         "dev": true
//       },
//       "prepend-http": {
//         "version": "2.0.0",
//         "resolved": "https://registry.npmjs.org/prepend-http/-/prepend-http-2.0.0.tgz",
//         "integrity": "sha1-6SQ0v6XqjBn0HN/UAddBo8gZ2Jc=",
//         "dev": true
//       },
//       "process-nextick-args": {
//         "version": "2.0.1",
//         "resolved": "https://registry.npmjs.org/process-nextick-args/-/process-nextick-args-2.0.1.tgz",
//         "integrity": "sha512-3ouUOpQhtgrbOa17J7+uxOTpITYWaGP7/AhoR3+A+/1e9skrzelGi/dXzEYyvbxubEF6Wn2ypscTKiKJFFn1ag=="
//       },
//       "proxy-addr": {
//         "version": "2.0.7",
//         "resolved": "https://registry.npmjs.org/proxy-addr/-/proxy-addr-2.0.7.tgz",
//         "integrity": "sha512-llQsMLSUDUPT44jdrU/O37qlnifitDP+ZwrmmZcoSKyLKvtZxpyV0n2/bD/N4tBAAZ/gJEdZU7KMraoK1+XYAg==",
//         "requires": {
//           "forwarded": "0.2.0",
//           "ipaddr.js": "1.9.1"
//         }
//       },
//       "pstree.remy": {
//         "version": "1.1.8",
//         "resolved": "https://registry.npmjs.org/pstree.remy/-/pstree.remy-1.1.8.tgz",
//         "integrity": "sha512-77DZwxQmxKnu3aR542U+X8FypNzbfJ+C5XQDk3uWjWxn6151aIMGthWYRXTqT1E5oJvg+ljaa2OJi+VfvCOQ8w==",
//         "dev": true
//       },
//       "pump": {
//         "version": "3.0.0",
//         "resolved": "https://registry.npmjs.org/pump/-/pump-3.0.0.tgz",
//         "integrity": "sha512-LwZy+p3SFs1Pytd/jYct4wpv49HiYCqd9Rlc5ZVdk0V+8Yzv6jR5Blk3TRmPL1ft69TxP0IMZGJ+WPFU2BFhww==",
//         "dev": true,
//         "requires": {
//           "end-of-stream": "^1.1.0",
//           "once": "^1.3.1"
//         }
//       },
//       "punycode": {
//         "version": "2.1.1",
//         "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.1.1.tgz",
//         "integrity": "sha512-XRsRjdf+j5ml+y/6GKHPZbrF/8p2Yga0JPtdqTIY2Xe5ohJPD9saDJJLPvp9+NSBprVvevdXZybnj2cv8OEd0A=="
//       },
//       "pupa": {
//         "version": "2.1.1",
//         "resolved": "https://registry.npmjs.org/pupa/-/pupa-2.1.1.tgz",
//         "integrity": "sha512-l1jNAspIBSFqbT+y+5FosojNpVpF94nlI+wDUpqP9enwOTfHx9f0gh5nB96vl+6yTpsJsypeNrwfzPrKuHB41A==",
//         "dev": true,
//         "requires": {
//           "escape-goat": "^2.0.0"
//         }
//       },
//       "qs": {
//         "version": "6.7.0",
//         "resolved": "https://registry.npmjs.org/qs/-/qs-6.7.0.tgz",
//         "integrity": "sha512-VCdBRNFTX1fyE7Nb6FYoURo/SPe62QCaAyzJvUjwRaIsc+NePBEniHlvxFmmX56+HZphIGtV0XeCirBtpDrTyQ=="
//       },
//       "range-parser": {
//         "version": "1.2.1",
//         "resolved": "https://registry.npmjs.org/range-parser/-/range-parser-1.2.1.tgz",
//         "integrity": "sha512-Hrgsx+orqoygnmhFbKaHE6c296J+HTAQXoxEF6gNupROmmGJRoyzfG3ccAveqCBrwr/2yxQ5BVd/GTl5agOwSg=="
//       },
//       "raw-body": {
//         "version": "2.4.0",
//         "resolved": "https://registry.npmjs.org/raw-body/-/raw-body-2.4.0.tgz",
//         "integrity": "sha512-4Oz8DUIwdvoa5qMJelxipzi/iJIi40O5cGV1wNYp5hvZP8ZN0T+jiNkL0QepXs+EsQ9XJ8ipEDoiH70ySUJP3Q==",
//         "requires": {
//           "bytes": "3.1.0",
//           "http-errors": "1.7.2",
//           "iconv-lite": "0.4.24",
//           "unpipe": "1.0.0"
//         }
//       },
//       "rc": {
//         "version": "1.2.8",
//         "resolved": "https://registry.npmjs.org/rc/-/rc-1.2.8.tgz",
//         "integrity": "sha512-y3bGgqKj3QBdxLbLkomlohkvsA8gdAiUQlSBJnBhfn+BPxg4bc62d8TcBW15wavDfgexCgccckhcZvywyQYPOw==",
//         "dev": true,
//         "requires": {
//           "deep-extend": "^0.6.0",
//           "ini": "~1.3.0",
//           "minimist": "^1.2.0",
//           "strip-json-comments": "~2.0.1"
//         }
//       },
//       "readable-stream": {
//         "version": "2.3.7",
//         "resolved": "https://registry.npmjs.org/readable-stream/-/readable-stream-2.3.7.tgz",
//         "integrity": "sha512-Ebho8K4jIbHAxnuxi7o42OrZgF/ZTNcsZj6nRKyUmkhLFq8CHItp/fy6hQZuZmP/n3yZ9VBUbp4zz/mX8hmYPw==",
//         "requires": {
//           "core-util-is": "~1.0.0",
//           "inherits": "~2.0.3",
//           "isarray": "~1.0.0",
//           "process-nextick-args": "~2.0.0",
//           "safe-buffer": "~5.1.1",
//           "string_decoder": "~1.1.1",
//           "util-deprecate": "~1.0.1"
//         }
//       },
//       "readdirp": {
//         "version": "3.6.0",
//         "resolved": "https://registry.npmjs.org/readdirp/-/readdirp-3.6.0.tgz",
//         "integrity": "sha512-hOS089on8RduqdbhvQ5Z37A0ESjsqz6qnRcffsMU3495FuTdqSm+7bhJ29JvIOsBDEEnan5DPu9t3To9VRlMzA==",
//         "dev": true,
//         "requires": {
//           "picomatch": "^2.2.1"
//         }
//       },
//       "registry-auth-token": {
//         "version": "4.2.1",
//         "resolved": "https://registry.npmjs.org/registry-auth-token/-/registry-auth-token-4.2.1.tgz",
//         "integrity": "sha512-6gkSb4U6aWJB4SF2ZvLb76yCBjcvufXBqvvEx1HbmKPkutswjW1xNVRY0+daljIYRbogN7O0etYSlbiaEQyMyw==",
//         "dev": true,
//         "requires": {
//           "rc": "^1.2.8"
//         }
//       },
//       "registry-url": {
//         "version": "5.1.0",
//         "resolved": "https://registry.npmjs.org/registry-url/-/registry-url-5.1.0.tgz",
//         "integrity": "sha512-8acYXXTI0AkQv6RAOjE3vOaIXZkT9wo4LOFbBKYQEEnnMNBpKqdUrI6S4NT0KPIo/WVvJ5tE/X5LF/TQUf0ekw==",
//         "dev": true,
//         "requires": {
//           "rc": "^1.2.8"
//         }
//       },
//       "responselike": {
//         "version": "1.0.2",
//         "resolved": "https://registry.npmjs.org/responselike/-/responselike-1.0.2.tgz",
//         "integrity": "sha1-kYcg7ztjHFZCvgaPFa3lpG9Loec=",
//         "dev": true,
//         "requires": {
//           "lowercase-keys": "^1.0.0"
//         }
//       },
//       "rimraf": {
//         "version": "3.0.2",
//         "resolved": "https://registry.npmjs.org/rimraf/-/rimraf-3.0.2.tgz",
//         "integrity": "sha512-JZkJMZkAGFFPP2YqXZXPbMlMBgsxzE8ILs4lMIX/2o0L9UBw9O/Y3o6wFw/i9YLapcUJWwqbi3kdxIPdC62TIA==",
//         "requires": {
//           "glob": "^7.1.3"
//         }
//       },
//       "safe-buffer": {
//         "version": "5.1.2",
//         "resolved": "https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.1.2.tgz",
//         "integrity": "sha512-Gd2UZBJDkXlY7GbJxfsE8/nvKkUEU1G38c1siN6QP6a9PT9MmHB8GnpscSmMJSoF8LOIrt8ud/wPtojys4G6+g=="
//       },
//       "safer-buffer": {
//         "version": "2.1.2",
//         "resolved": "https://registry.npmjs.org/safer-buffer/-/safer-buffer-2.1.2.tgz",
//         "integrity": "sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg=="
//       },
//       "saslprep": {
//         "version": "1.0.3",
//         "resolved": "https://registry.npmjs.org/saslprep/-/saslprep-1.0.3.tgz",
//         "integrity": "sha512-/MY/PEMbk2SuY5sScONwhUDsV2p77Znkb/q3nSVstq/yQzYJOH/Azh29p9oJLsl3LnQwSvZDKagDGBsBwSooag==",
//         "optional": true,
//         "requires": {
//           "sparse-bitfield": "^3.0.3"
//         }
//       },
//       "semver": {
//         "version": "5.7.1",
//         "resolved": "https://registry.npmjs.org/semver/-/semver-5.7.1.tgz",
//         "integrity": "sha512-sauaDf/PZdVgrLTNYHRtpXa1iRiKcaebiKQ1BJdpQlWH2lCvexQdX55snPFyK7QzpudqbCI0qXFfOasHdyNDGQ=="
//       },
//       "semver-diff": {
//         "version": "3.1.1",
//         "resolved": "https://registry.npmjs.org/semver-diff/-/semver-diff-3.1.1.tgz",
//         "integrity": "sha512-GX0Ix/CJcHyB8c4ykpHGIAvLyOwOobtM/8d+TQkAd81/bEjgPHrfba41Vpesr7jX/t8Uh+R3EX9eAS5be+jQYg==",
//         "dev": true,
//         "requires": {
//           "semver": "^6.3.0"
//         },
//         "dependencies": {
//           "semver": {
//             "version": "6.3.0",
//             "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.0.tgz",
//             "integrity": "sha512-b39TBaTSfV6yBrapU89p5fKekE2m/NwnDocOVruQFS1/veMgdzuPcnOM34M6CwxW8jH/lxEa5rBoDeUwu5HHTw==",
//             "dev": true
//           }
//         }
//       },
//       "send": {
//         "version": "0.17.1",
//         "resolved": "https://registry.npmjs.org/send/-/send-0.17.1.tgz",
//         "integrity": "sha512-BsVKsiGcQMFwT8UxypobUKyv7irCNRHk1T0G680vk88yf6LBByGcZJOTJCrTP2xVN6yI+XjPJcNuE3V4fT9sAg==",
//         "requires": {
//           "debug": "2.6.9",
//           "depd": "~1.1.2",
//           "destroy": "~1.0.4",
//           "encodeurl": "~1.0.2",
//           "escape-html": "~1.0.3",
//           "etag": "~1.8.1",
//           "fresh": "0.5.2",
//           "http-errors": "~1.7.2",
//           "mime": "1.6.0",
//           "ms": "2.1.1",
//           "on-finished": "~2.3.0",
//           "range-parser": "~1.2.1",
//           "statuses": "~1.5.0"
//         },
//         "dependencies": {
//           "ms": {
//             "version": "2.1.1",
//             "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.1.tgz",
//             "integrity": "sha512-tgp+dl5cGk28utYktBsrFqA7HKgrhgPsg6Z/EfhWI4gl1Hwq8B/GmY/0oXZ6nF8hDVesS/FpnYaD/kOWhYQvyg=="
//           }
//         }
//       },
//       "serve-static": {
//         "version": "1.14.1",
//         "resolved": "https://registry.npmjs.org/serve-static/-/serve-static-1.14.1.tgz",
//         "integrity": "sha512-JMrvUwE54emCYWlTI+hGrGv5I8dEwmco/00EvkzIIsR7MqrHonbD9pO2MOfFnpFntl7ecpZs+3mW+XbQZu9QCg==",
//         "requires": {
//           "encodeurl": "~1.0.2",
//           "escape-html": "~1.0.3",
//           "parseurl": "~1.3.3",
//           "send": "0.17.1"
//         }
//       },
//       "set-blocking": {
//         "version": "2.0.0",
//         "resolved": "https://registry.npmjs.org/set-blocking/-/set-blocking-2.0.0.tgz",
//         "integrity": "sha1-BF+XgtARrppoA93TgrJDkrPYkPc="
//       },
//       "setprototypeof": {
//         "version": "1.1.1",
//         "resolved": "https://registry.npmjs.org/setprototypeof/-/setprototypeof-1.1.1.tgz",
//         "integrity": "sha512-JvdAWfbXeIGaZ9cILp38HntZSFSo3mWg6xGcJJsd+d4aRMOqauag1C63dJfDw7OaMYwEbHMOxEZ1lqVRYP2OAw=="
//       },
//       "signal-exit": {
//         "version": "3.0.3",
//         "resolved": "https://registry.npmjs.org/signal-exit/-/signal-exit-3.0.3.tgz",
//         "integrity": "sha512-VUJ49FC8U1OxwZLxIbTTrDvLnf/6TDgxZcK8wxR8zs13xpx7xbG60ndBlhNrFi2EMuFRoeDoJO7wthSLq42EjA=="
//       },
//       "smtp-connection": {
//         "version": "2.12.0",
//         "resolved": "https://registry.npmjs.org/smtp-connection/-/smtp-connection-2.12.0.tgz",
//         "integrity": "sha1-1275EnyyPCJZ7bHoNJwujV4tdME=",
//         "requires": {
//           "httpntlm": "1.6.1",
//           "nodemailer-shared": "1.1.0"
//         }
//       },
//       "sparse-bitfield": {
//         "version": "3.0.3",
//         "resolved": "https://registry.npmjs.org/sparse-bitfield/-/sparse-bitfield-3.0.3.tgz",
//         "integrity": "sha1-/0rm5oZWBWuks+eSqzM004JzyhE=",
//         "optional": true,
//         "requires": {
//           "memory-pager": "^1.0.2"
//         }
//       },
//       "statuses": {
//         "version": "1.5.0",
//         "resolved": "https://registry.npmjs.org/statuses/-/statuses-1.5.0.tgz",
//         "integrity": "sha1-Fhx9rBd2Wf2YEfQ3cfqZOBR4Yow="
//       },
//       "string-width": {
//         "version": "4.2.2",
//         "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.2.tgz",
//         "integrity": "sha512-XBJbT3N4JhVumXE0eoLU9DCjcaF92KLNqTmFCnG1pf8duUxFGwtP6AD6nkjw9a3IdiRtL3E2w3JDiE/xi3vOeA==",
//         "dev": true,
//         "requires": {
//           "emoji-regex": "^8.0.0",
//           "is-fullwidth-code-point": "^3.0.0",
//           "strip-ansi": "^6.0.0"
//         },
//         "dependencies": {
//           "ansi-regex": {
//             "version": "5.0.0",
//             "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.0.tgz",
//             "integrity": "sha512-bY6fj56OUQ0hU1KjFNDQuJFezqKdrAyFdIevADiqrWHwSlbmBNMHp5ak2f40Pm8JTFyM2mqxkG6ngkHO11f/lg==",
//             "dev": true
//           },
//           "emoji-regex": {
//             "version": "8.0.0",
//             "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
//             "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",
//             "dev": true
//           },
//           "is-fullwidth-code-point": {
//             "version": "3.0.0",
//             "resolved": "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-3.0.0.tgz",
//             "integrity": "sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==",
//             "dev": true
//           },
//           "strip-ansi": {
//             "version": "6.0.0",
//             "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.0.tgz",
//             "integrity": "sha512-AuvKTrTfQNYNIctbR1K/YGTR1756GycPsg7b9bdV9Duqur4gv6aKqHXah67Z8ImS7WEz5QVcOtlfW2rZEugt6w==",
//             "dev": true,
//             "requires": {
//               "ansi-regex": "^5.0.0"
//             }
//           }
//         }
//       },
//       "string_decoder": {
//         "version": "1.1.1",
//         "resolved": "https://registry.npmjs.org/string_decoder/-/string_decoder-1.1.1.tgz",
//         "integrity": "sha512-n/ShnvDi6FHbbVfviro+WojiFzv+s8MPMHBczVePfUpDJLwoLT0ht1l4YwBCbi8pJAveEEdnkHyPyTP/mzRfwg==",
//         "requires": {
//           "safe-buffer": "~5.1.0"
//         }
//       },
//       "strip-ansi": {
//         "version": "5.2.0",
//         "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-5.2.0.tgz",
//         "integrity": "sha512-DuRs1gKbBqsMKIZlrffwlug8MHkcnpjs5VPmL1PAh+mA30U0DTotfDZ0d2UUsXpPmPmMMJ6W773MaA3J+lbiWA==",
//         "dev": true,
//         "requires": {
//           "ansi-regex": "^4.1.0"
//         }
//       },
//       "strip-json-comments": {
//         "version": "2.0.1",
//         "resolved": "https://registry.npmjs.org/strip-json-comments/-/strip-json-comments-2.0.1.tgz",
//         "integrity": "sha1-PFMZQukIwml8DsNEhYwobHygpgo=",
//         "dev": true
//       },
//       "supports-color": {
//         "version": "5.5.0",
//         "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-5.5.0.tgz",
//         "integrity": "sha512-QjVjwdXIt408MIiAqCX4oUKsgU2EqAGzs2Ppkm4aQYbjm+ZEWEcW4SfFNTr4uMNZma0ey4f5lgLrkB0aX0QMow==",
//         "dev": true,
//         "requires": {
//           "has-flag": "^3.0.0"
//         }
//       },
//       "tar": {
//         "version": "6.1.7",
//         "resolved": "https://registry.npmjs.org/tar/-/tar-6.1.7.tgz",
//         "integrity": "sha512-PBoRkOJU0X3lejJ8GaRCsobjXTgFofRDSPdSUhRSdlwJfifRlQBwGXitDItdGFu0/h0XDMCkig0RN1iT7DBxhA==",
//         "requires": {
//           "chownr": "^2.0.0",
//           "fs-minipass": "^2.0.0",
//           "minipass": "^3.0.0",
//           "minizlib": "^2.1.1",
//           "mkdirp": "^1.0.3",
//           "yallist": "^4.0.0"
//         }
//       },
//       "term-size": {
//         "version": "2.2.1",
//         "resolved": "https://registry.npmjs.org/term-size/-/term-size-2.2.1.tgz",
//         "integrity": "sha512-wK0Ri4fOGjv/XPy8SBHZChl8CM7uMc5VML7SqiQ0zG7+J5Vr+RMQDoHa2CNT6KHUnTGIXH34UDMkPzAUyapBZg==",
//         "dev": true
//       },
//       "to-readable-stream": {
//         "version": "1.0.0",
//         "resolved": "https://registry.npmjs.org/to-readable-stream/-/to-readable-stream-1.0.0.tgz",
//         "integrity": "sha512-Iq25XBt6zD5npPhlLVXGFN3/gyR2/qODcKNNyTMd4vbm39HUaOiAM4PMq0eMVC/Tkxz+Zjdsc55g9yyz+Yq00Q==",
//         "dev": true
//       },
//       "to-regex-range": {
//         "version": "5.0.1",
//         "resolved": "https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz",
//         "integrity": "sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==",
//         "dev": true,
//         "requires": {
//           "is-number": "^7.0.0"
//         }
//       },
//       "toidentifier": {
//         "version": "1.0.0",
//         "resolved": "https://registry.npmjs.org/toidentifier/-/toidentifier-1.0.0.tgz",
//         "integrity": "sha512-yaOH/Pk/VEhBWWTlhI+qXxDFXlejDGcQipMlyxda9nthulaxLZUNcUqFxokp0vcYnvteJln5FNQDRrxj3YcbVw=="
//       },
//       "touch": {
//         "version": "3.1.0",
//         "resolved": "https://registry.npmjs.org/touch/-/touch-3.1.0.tgz",
//         "integrity": "sha512-WBx8Uy5TLtOSRtIq+M03/sKDrXCLHxwDcquSP2c43Le03/9serjQBIztjRz6FkJez9D/hleyAXTBGLwwZUw9lA==",
//         "dev": true,
//         "requires": {
//           "nopt": "~1.0.10"
//         }
//       },
//       "tr46": {
//         "version": "2.1.0",
//         "resolved": "https://registry.npmjs.org/tr46/-/tr46-2.1.0.tgz",
//         "integrity": "sha512-15Ih7phfcdP5YxqiB+iDtLoaTz4Nd35+IiAv0kQ5FNKHzXgdWqPoTIqEDDJmXceQt4JZk6lVPT8lnDlPpGDppw==",
//         "requires": {
//           "punycode": "^2.1.1"
//         }
//       },
//       "type-fest": {
//         "version": "0.8.1",
//         "resolved": "https://registry.npmjs.org/type-fest/-/type-fest-0.8.1.tgz",
//         "integrity": "sha512-4dbzIzqvjtgiM5rw1k5rEHtBANKmdudhGyBEajN01fEyhaAIhsoKNy6y7+IN93IfpFtwY9iqi7kD+xwKhQsNJA==",
//         "dev": true
//       },
//       "type-is": {
//         "version": "1.6.18",
//         "resolved": "https://registry.npmjs.org/type-is/-/type-is-1.6.18.tgz",
//         "integrity": "sha512-TkRKr9sUTxEH8MdfuCSP7VizJyzRNMjj2J2do2Jr3Kym598JVdEksuzPQCnlFPW4ky9Q+iA+ma9BGm06XQBy8g==",
//         "requires": {
//           "media-typer": "0.3.0",
//           "mime-types": "~2.1.24"
//         }
//       },
//       "typedarray-to-buffer": {
//         "version": "3.1.5",
//         "resolved": "https://registry.npmjs.org/typedarray-to-buffer/-/typedarray-to-buffer-3.1.5.tgz",
//         "integrity": "sha512-zdu8XMNEDepKKR+XYOXAVPtWui0ly0NtohUscw+UmaHiAWT8hrV1rr//H6V+0DvJ3OQ19S979M0laLfX8rm82Q==",
//         "dev": true,
//         "requires": {
//           "is-typedarray": "^1.0.0"
//         }
//       },
//       "undefsafe": {
//         "version": "2.0.3",
//         "resolved": "https://registry.npmjs.org/undefsafe/-/undefsafe-2.0.3.tgz",
//         "integrity": "sha512-nrXZwwXrD/T/JXeygJqdCO6NZZ1L66HrxM/Z7mIq2oPanoN0F1nLx3lwJMu6AwJY69hdixaFQOuoYsMjE5/C2A==",
//         "dev": true,
//         "requires": {
//           "debug": "^2.2.0"
//         }
//       },
//       "underscore": {
//         "version": "1.7.0",
//         "resolved": "https://registry.npmjs.org/underscore/-/underscore-1.7.0.tgz",
//         "integrity": "sha1-a7rwh3UA02vjTsqlhODbn+8DUgk="
//       },
//       "unique-string": {
//         "version": "2.0.0",
//         "resolved": "https://registry.npmjs.org/unique-string/-/unique-string-2.0.0.tgz",
//         "integrity": "sha512-uNaeirEPvpZWSgzwsPGtU2zVSTrn/8L5q/IexZmH0eH6SA73CmAA5U4GwORTxQAZs95TAXLNqeLoPPNO5gZfWg==",
//         "dev": true,
//         "requires": {
//           "crypto-random-string": "^2.0.0"
//         }
//       },
//       "unpipe": {
//         "version": "1.0.0",
//         "resolved": "https://registry.npmjs.org/unpipe/-/unpipe-1.0.0.tgz",
//         "integrity": "sha1-sr9O6FFKrmFltIF4KdIbLvSZBOw="
//       },
//       "update-notifier": {
//         "version": "4.1.3",
//         "resolved": "https://registry.npmjs.org/update-notifier/-/update-notifier-4.1.3.tgz",
//         "integrity": "sha512-Yld6Z0RyCYGB6ckIjffGOSOmHXj1gMeE7aROz4MG+XMkmixBX4jUngrGXNYz7wPKBmtoD4MnBa2Anu7RSKht/A==",
//         "dev": true,
//         "requires": {
//           "boxen": "^4.2.0",
//           "chalk": "^3.0.0",
//           "configstore": "^5.0.1",
//           "has-yarn": "^2.1.0",
//           "import-lazy": "^2.1.0",
//           "is-ci": "^2.0.0",
//           "is-installed-globally": "^0.3.1",
//           "is-npm": "^4.0.0",
//           "is-yarn-global": "^0.3.0",
//           "latest-version": "^5.0.0",
//           "pupa": "^2.0.1",
//           "semver-diff": "^3.1.1",
//           "xdg-basedir": "^4.0.0"
//         }
//       },
//       "url-parse-lax": {
//         "version": "3.0.0",
//         "resolved": "https://registry.npmjs.org/url-parse-lax/-/url-parse-lax-3.0.0.tgz",
//         "integrity": "sha1-FrXK/Afb42dsGxmZF3gj1lA6yww=",
//         "dev": true,
//         "requires": {
//           "prepend-http": "^2.0.0"
//         }
//       },
//       "util-deprecate": {
//         "version": "1.0.2",
//         "resolved": "https://registry.npmjs.org/util-deprecate/-/util-deprecate-1.0.2.tgz",
//         "integrity": "sha1-RQ1Nyfpw3nMnYvvS1KKJgUGaDM8="
//       },
//       "utils-merge": {
//         "version": "1.0.1",
//         "resolved": "https://registry.npmjs.org/utils-merge/-/utils-merge-1.0.1.tgz",
//         "integrity": "sha1-n5VxD1CiZ5R7LMwSR0HBAoQn5xM="
//       },
//       "vary": {
//         "version": "1.1.2",
//         "resolved": "https://registry.npmjs.org/vary/-/vary-1.1.2.tgz",
//         "integrity": "sha1-IpnwLG3tMNSllhsLn3RSShj2NPw="
//       },
//       "webidl-conversions": {
//         "version": "6.1.0",
//         "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-6.1.0.tgz",
//         "integrity": "sha512-qBIvFLGiBpLjfwmYAaHPXsn+ho5xZnGvyGvsarywGNc8VyQJUMHJ8OBKGGrPER0okBeMDaan4mNBlgBROxuI8w=="
//       },
//       "whatwg-url": {
//         "version": "8.7.0",
//         "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-8.7.0.tgz",
//         "integrity": "sha512-gAojqb/m9Q8a5IV96E3fHJM70AzCkgt4uXYX2O7EmuyOnLrViCQlsEBmF9UQIu3/aeAIp2U17rtbpZWNntQqdg==",
//         "requires": {
//           "lodash": "^4.7.0",
//           "tr46": "^2.1.0",
//           "webidl-conversions": "^6.1.0"
//         }
//       },
//       "wide-align": {
//         "version": "1.1.3",
//         "resolved": "https://registry.npmjs.org/wide-align/-/wide-align-1.1.3.tgz",
//         "integrity": "sha512-QGkOQc8XL6Bt5PwnsExKBPuMKBxnGxWWW3fU55Xt4feHozMUhdUMaBCk290qpm/wG5u/RSKzwdAC4i51YigihA==",
//         "requires": {
//           "string-width": "^1.0.2 || 2"
//         },
//         "dependencies": {
//           "ansi-regex": {
//             "version": "3.0.0",
//             "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-3.0.0.tgz",
//             "integrity": "sha1-7QMXwyIGT3lGbAKWa922Bas32Zg="
//           },
//           "string-width": {
//             "version": "2.1.1",
//             "resolved": "https://registry.npmjs.org/string-width/-/string-width-2.1.1.tgz",
//             "integrity": "sha512-nOqH59deCq9SRHlxq1Aw85Jnt4w6KvLKqWVik6oA9ZklXLNIOlqg4F2yrT1MVaTjAqvVwdfeZ7w7aCvJD7ugkw==",
//             "requires": {
//               "is-fullwidth-code-point": "^2.0.0",
//               "strip-ansi": "^4.0.0"
//             }
//           },
//           "strip-ansi": {
//             "version": "4.0.0",
//             "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-4.0.0.tgz",
//             "integrity": "sha1-qEeQIusaw2iocTibY1JixQXuNo8=",
//             "requires": {
//               "ansi-regex": "^3.0.0"
//             }
//           }
//         }
//       },
//       "widest-line": {
//         "version": "3.1.0",
//         "resolved": "https://registry.npmjs.org/widest-line/-/widest-line-3.1.0.tgz",
//         "integrity": "sha512-NsmoXalsWVDMGupxZ5R08ka9flZjjiLvHVAWYOKtiKM8ujtZWr9cRffak+uSE48+Ob8ObalXpwyeUiyDD6QFgg==",
//         "dev": true,
//         "requires": {
//           "string-width": "^4.0.0"
//         }
//       },
//       "wrappy": {
//         "version": "1.0.2",
//         "resolved": "https://registry.npmjs.org/wrappy/-/wrappy-1.0.2.tgz",
//         "integrity": "sha1-tSQ9jz7BqjXxNkYFvA0QNuMKtp8="
//       },
//       "write-file-atomic": {
//         "version": "3.0.3",
//         "resolved": "https://registry.npmjs.org/write-file-atomic/-/write-file-atomic-3.0.3.tgz",
//         "integrity": "sha512-AvHcyZ5JnSfq3ioSyjrBkH9yW4m7Ayk8/9My/DD9onKeu/94fwrMocemO2QAJFAlnnDN+ZDS+ZjAR5ua1/PV/Q==",
//         "dev": true,
//         "requires": {
//           "imurmurhash": "^0.1.4",
//           "is-typedarray": "^1.0.0",
//           "signal-exit": "^3.0.2",
//           "typedarray-to-buffer": "^3.1.5"
//         }
//       },
//       "xdg-basedir": {
//         "version": "4.0.0",
//         "resolved": "https://registry.npmjs.org/xdg-basedir/-/xdg-basedir-4.0.0.tgz",
//         "integrity": "sha512-PSNhEJDejZYV7h50BohL09Er9VaIefr2LMAf3OEmpCkjOi34eYyQYAXUTjEQtZJTKcF0E2UKTh+osDLsgNim9Q==",
//         "dev": true
//       },
//       "yallist": {
//         "version": "4.0.0",
//         "resolved": "https://registry.npmjs.org/yallist/-/yallist-4.0.0.tgz",
//         "integrity": "sha512-3wdGidZyq5PB084XLES5TpOSRA3wjXAlIWMhum2kRcv/41Sn2emQ0dycQW4uZXLejwKvg6EsvbdlVL+FYEct7A=="
//       }
//     }
//   }
