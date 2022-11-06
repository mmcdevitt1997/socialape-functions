const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();
admin.initializeApp();

const config = {
  apiKey: "AIzaSyD4qoJLAJOKcGsZBnD1cmul90sIwNLPl3Q",
  authDomain: "socialape-573e6.firebaseapp.com",
  databaseURL: "https://socialape-573e6-default-rtdb.firebaseio.com",
  projectId: "socialape-573e6",
  storageBucket: "socialape-573e6.appspot.com",
  messagingSenderId: "113032258647",
  appId: "1:113032258647:web:397d225189fe64c50baf12",
  measurementId: "G-BMVPX38K6B",
};


const firebase = require("firebase");
firebase.initializeApp(config);

const db = admin.firestore();

app.get("/screams", (req, res) =>{
  db
      .collection("screams")
      .orderBy("createdAt", "desc")
      .get()
      .then((data) => {
        const screams = [];
        data.forEach((doc) => {
          screams.push({
            screamsId: doc.id,
            body: doc.data().body,
            userHandle: doc.data().userHandle,
            createdAt: doc.data().createdAt,
          });
        });
        return res.json(screams);
      })
      .catch((err) => console.log(err));
});


app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userhandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };
  db
      .collection("screams")
      .add(newScream)
      .then((doc) => {
        res.json({message: `document ${doc.id} created successufully`});
      })
      .catch((err) => {
        res.status(500).json({error: "somthing went wrong"});
        console.error(err);
      });
});

exports.api = functions.https.onRequest(app);

// Signup Route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };
  //  TODO: validate data
  db.doc(`/users/${newUser.handle}`).get()
      .then((doc) => {
        if (doc.exists) {
          return res.status(400).json({handle: "this handle is already taken"});
        } else {
          return firebase
              .auth()
              .createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
      })
      .then((data) => {
        return data.user.getIdToken();
      })
      .then((token) => {
        return res.status(201).json({token});
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err});
      });

  firebase.auth()
      .createUserWithEmailAndPassword(newUser.email, newUser.password)
      .then( (data) => {
        return res.status(201).json({
          message: `user ${ data.user.uid } signed up succussfully`,
        });
      })
      .catch((err) => {
        res.status(500).json({error: err});
        console.error(err);
      });
});

