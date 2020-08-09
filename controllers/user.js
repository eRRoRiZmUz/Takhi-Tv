const firebase = require("../serviceAccount/firebase").firebase;
const storage = require("../serviceAccount/firebase").storage;
const bucket = storage.bucket();
const users = firebase.collection("Users");
const orders = firebase.collection("Orders");
const comms = firebase.collection("Comments");
const crypto = require("crypto");
const validator = require("email-validator");
const jwt = require("jsonwebtoken");
const passwordValidator = require("password-validator");
const { stat } = require("fs");
exports.login = function (req, res) {
  let email = req.body.email;
  let password = req.body.password;
  if (req.body === undefined) {
    res.status(402).json({
      error: "body undefined",
    });
  }
  users
    .doc(email)
    .get()
    .then((snapshot) => {
      if (snapshot.exists) {
        users
          .doc(email)
          .get()
          .then((snapshot) => {
            let hash = snapshot.data().pass.hash;
            let salt = snapshot.data().pass.salt;
            validatePassword(password, hash, salt).then((result) => {
              if (result) {
                toAuthJSON(email).then((result) => {
                  res.status(200).json({
                    success: result,
                  });
                });
              } else {
                res.status(400).json({
                  error: "pass buruu bn",
                });
              }
            });
          });
      } else {
        res.status(401).json({
          error: "email oldsongui",
        });
      }
    });
};

exports.registration = function (req, res) {
  let email = req.body.email;
  let password = req.body.password;
  if (req.body === undefined) {
    res.status(400).json({
      error: "body undefined",
    });
  }
  let schema = new passwordValidator();
  schema
    .is()
    .min(8) // Minimum length 8
    .is()
    .max(100) // Maximum length 100
    //.has().uppercase()                              // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .not()
    .spaces() // Should not have spaces
    .is()
    .not()
    .oneOf(["Passw0rd", "Password123"]); // Blacklist these values

  validator.validate("test@email.com"); // true
  if (schema.validate(password) === false) {
    res.status(402).json(schema.validate(password, { list: true }));
  } else if (validator.validate(email) === false) {
    res.status(404).json({
      error: "email ee shalgana uu ",
    });
  } else {
    encryptPassword(password).then((result) => {
      toAuthJSON(email).then((rest) => {
        firestore(result, rest, email).then((f) => {
          if (f) {
            res.status(200).json({ success: rest });
          }
        });
      });
    });
  }
};

exports.Order = function (req, res) {
  let email = req.payload.email;
  let hour = req.body.hour;
  let order = req.body.order;
  if (req.body === undefined) {
    res.status(400).json({
      error: "body undefined",
    });
  }
  orders.doc(order).set({
    customer: {
      email: email,
      hour: hour,
    },
  });
  users.doc(email).collection("Order").doc(order).set({
    hour: hour,
  });
  res.status(200).json({
    success: "huselt ilgeegdsen",
  });
};

exports.comments = function (req, res) {
  let email = req.payload.email;
  let txt = req.body.txt;
  if (req.body === undefined) {
    res.status(400).json({
      error: "body undefined",
    });
  } else {
    Comments(email, txt).then((result) => {
      if (result) {
        res.status(200).json({
          success: "comment bichigdsen",
        });
      }
    });
  }
};
exports.getComments = function (req, res) {
  let arr = [];
  let i = 0;
  comms
    .orderBy("time", "desc")
    .limit(20)
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        let a = doc.data().comments;
        arr.push(a);
        i++;
        if (i === snapshot.size) {
          res.status(200).json({
            success: arr,
          });
        }
      });
    });
};
exports.deleteComment = function (req, res) {
  let email = req.payload.email;
  let com = req.body.com;
  if (req.body === undefined) {
    res.status(402).json({
      error: "body undefined",
    });
  }
  comms.get().then((snapshot) => {
    snapshot.forEach((doc) => {
      if (doc.data().name === email) {
        if (doc.data().comments === com) {
          comms.doc(doc.id).delete();
          users.doc(email).collection("Comments").doc(txt).delete();
          res.status(200).json({
            success: "comment ustgagdlaa",
          });
        } else {
          res.status(400).json({
            error: "iim comment alga",
          });
        }
      } else {
        res.status(401).json({
          error: "iim account alga",
        });
      }
    });
  });
};
exports.editComment = function (req, res) {
  let email = req.payload.email;
  let com = req.body.com;
  let newcom = req.body.newcom;
  if (req.body === undefined) {
    res.status(402).json({
      error: "body undefined",
    });
  }
  comms.get().then((snapshot) => {
    snapshot.forEach((doc) => {
      if (doc.data().name === email) {
        if (doc.data().comments === com) {
          comms.doc(doc.id).update({
            comments: newcom,
          });
          users.doc(email).collection("Comments").doc(txt).update({
            comments: newcom,
          });
          res.status(200).json({
            success: "comment shinechlegdlee",
          });
        } else {
          res.status(400).json({
            error: "iim comment alga",
          });
        }
      } else {
        res.status(401).json({
          error: "iim account alga",
        });
      }
    });
  });
};
exports.changePassword = function (req, res) {
  let email = req.payload.email;
  let password = req.body.password;
  if (req.body === undefined) {
    res.status(400).json({
      error: "body undefined",
    });
  } else {
    encryptPassword(password).then((result) => {
      ForgotPassword(result, email).then((f) => {
        if (f) {
          res.status(200).json({
            success: "password shinechlegdlee",
          });
        }
      });
    });
  }
};
exports.forgotPassword = function (req, res) {
  let email = req.body.email;
  let a = Math.floor(1000 + Math.random() * 9000);
  if (req.body === undefined) {
    res.status(400).json({
      error: "body undefined",
    });
  }
  encryptPassword(a).then((result) => {
    ForgotPassword(result, email).then((f) => {
      if (f) {
        res.status(200).json({
          email: email,
          success: "password shinechlegdlee",
        });
      }
    });
  });
  sendPassword(a, email, function (result) {
    res.status(201).json({
      success: result,
    });
  });
};

async function sendPassword(a, email) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "takhitv@gmail.com",
      pass: "takhitv123",
    },
  });

  let mailOptions = {
    from: "takhitv@gmail.com",
    to: email,
    subject: "Тахь тв",
    text: a + "  " + "Нууц үг ",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      callback(info.response);
      console.log("Email sent: " + info.response);
    }
  });
}
async function ForgotPassword(result, email) {
  await users.doc(email).update({
    pass: result,
  });
  return true;
}
async function Comments(email, txt) {
  await comms.add({
    name: email,
    comments: txt,
    time: new Date(),
  });
  await users.doc(email).collection("Comments").doc(txt).set({
    time: new Date(),
  });
  return true;
}
async function validatePassword(password, user_hash, user_salt) {
  const hash = await crypto
    .pbkdf2Sync(password, user_salt, 10000, 512, "sha512")
    .toString("hex");
  if (hash === user_hash) {
    return true;
  } else {
    return false;
  }
}
async function encryptPassword(password) {
  let salt = await crypto.randomBytes(16).toString("hex");
  let hash = await crypto
    .pbkdf2Sync(password, salt, 10000, 512, "sha512")
    .toString("hex");
  return { salt: salt, hash: hash };
}
async function firestore(result, rest, email) {
  await users.doc(email).set({
    pass: result,
    email: rest,
  });
  return true;
}
async function toAuthJSON(email) {
  return {
    email: email.toLowerCase(),
    token: jwt.sign({ email: email.toLowerCase() }, "error"),
  };
}
