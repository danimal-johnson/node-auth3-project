const router = require("express").Router();
const bcrypt = require("bcryptjs");

const restricted = require('./restricted-middleware.js');
const Users = require("./users-model.js");

router.post("/register", (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10); // 2 ^ n
  user.password = hash;

  Users.add(user)
      .then(saved => {
          res.status(201).json(saved);
      })
      .catch(error => {
          res.status(500).json(error);
      });
});

router.post("/login", (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
      .first()
      .then(user => {
          if (user && bcrypt.compareSync(password, user.password)) {
              req.session.loggedIn = true; // used in restricted middleware
              req.session.userId = user.id; // in case we need the user id later

              res.status(200).json({
                  message: `Welcome ${user.username}!`,
              });
          } else {
              res.status(401).json({ message: "Invalid Credentials" });
          }
      })
      .catch(error => {
          res.status(500).json(error);
      });
});

router.get("/logout", (req, res) => {
  if (req.session) {
      req.session.destroy(err => {
          if (err) {
              res.status(500).json({
                  you:
                      "can checkout any time you like, but you can never leave!",
              });
          } else {
              res.status(200).json({ bye: "thanks for playing" });
          }
      });
  } else {
      res.status(204);
  }
});

// ------- Getting users --------

router.get('/users', restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

module.exports = router;