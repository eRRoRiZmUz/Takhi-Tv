const firebase = require("../serviceAccount/firebase").firebase;
const storage = require("../serviceAccount/firebase").storage;
const bucket = storage.bucket();
const users = firebase.collection("Users");
const orders = firebase.collection("Orders");
const comms = firebase.collection("Comments");
const posts = firebase.collection("Posts");
const fs = require("fs");
const nodemailer = require("nodemailer");
const base64ToImage = require("base64-to-image");
const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
const { title } = require("errorhandler");
const maxSize = 1 * 1024 * 1024; // file size ihdee 1MB

const CONFIG = {
  action: "read",
  expires: "03-01-2500",
};

exports.SeeOrders = function (req, res) {
  let i = 0;
  let obj = new Object();
  orders
    .orderBy("time", "desc")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        obj[doc.id] = doc.data().email;
        let arr = getOrdes(obj);
        i++;
        if (i === snapshot.size) {
          res.status(200).json(arr);
        }
      });
    });
};

exports.sendEmail = function (req, res) {
  let email = req.body.email;
  let text = req.body.text;
  if (req.body === undefined) {
    res.status(400).json({
      error: "body undefined",
    });
  }
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
    text: text,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      res.status(200).json({
        success: "code ilgeegdsen",
      });
      console.log("Email sent: " + info.response);
    }
  });
};

exports.Post = function (req, res) {
  let title = req.body.title;
  let txt = req.body.txt;
  let image = req.body.image;
  if (req.body === undefined) {
    res.status(400).json({
      error: "body undefined",
    });
  }
  let path = "./";
  let optionalObj = { fileName: title, type: "png" };
  let imageInfo = base64ToImage(image, path, optionalObj);

  let base64String = image;
  let stringLength = base64String.length - "data:image/png;base64,".length;
  let sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
  let sizeInKb = sizeInBytes / 1000;

  imag(optionalObj, title, imageInfo, sizeInKb, res, function (result) {
    signUrl(result, CONFIG, txt, title, res).then((result) => {
      if (result) {
        fs.unlink(title + ".png", function (err) {
          console.log(err);
        });
        res.status(200).json("zurag hadaglagdlaa");
      }
    });
  });
};

exports.temporaryPass = function (req, res) {
  let password = req.body.password;
  let email = req.body.email;
  if (req.body === undefined) {
    res.status(400).json({
      error: "body undefined",
    });
  }
  users
    .doc(email)
    .get()
    .then((snapshot) => {
      if (snapshot.exists) {
        encryptPassword(password).then((result) => {
          users.doc(email).update({
            temporary_password: result,
          });
        });
        res.status(200).json({
          success: "tur zuriin pass update hiilee",
        });
      } else {
        res.status(401).json({
          error: "hereglegch oldsongui",
        });
      }
    });
};

exports.deletePost = function (req, res) {
  let title = req.body.title;
  if (req.body === undefined) {
    res.status(400).json({
      error: "body undefined",
    });
  }
  posts.doc(title).delete();
  bucket.deleteFiles({ prefix: `posts/${title}/.png/` }, function (err, file) {
    callback(file);
  });
  res.status(200).json({
    success: "post ustgagdsan",
  });
};

exports.deleteComment = function (req, res) {
  let email = req.body.email;
  let com = req.body.com;
  if (req.body === undefined) {
    res.status(400).json({
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
          res.status(401).json({
            error: "iim comment alga",
          });
        }
      } else {
        res.status(402).json({
          error: "iim account alga",
        });
      }
    });
  });
};

async function imag(optionalObj, title, imageInfo, sizeInKb, res, callback) {
  if (sizeInKb < maxSize) {
    async () => {
      const files = await imagemin([title + ".png"], {
        destination: "./",
        plugins: [
          imageminPngquant({
            quality: [0.5, 0.6],
          }),
        ],
      });
      bucket.upload(
        title + ".png",
        {
          destination: `posts/${title}${optionalObj.fileName}.${optionalObj.type}`,
        },
        function (err, file) {
          if (err) {
            res.status(401).json({
              error: err,
            });
          } else {
            callback(file);
          }
        }
      );
    };
  } else {
    console.log("zurgiin hemjee ih bn ");
  }
}

async function signUrl(file, CONFIG, txt, title, res) {
  await file.getSignedUrl(CONFIG, function (err, url) {
    if (err) {
      console.log(err);
      res.status(406).json(err);
    } else {
      console.log(url);
      posts.doc(title).set({
        text: txt,
        profile: url,
      });
    }
  });
  return true;
}

function getOrdes(obj) {
  var arr = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      arr.push({
        key: prop,
        value: obj[prop],
      });
    }
  }
  return arr;
}
