const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { jwtSecret } = require('../config/secrets.js');

const restricted = require('./restricted-middleware.js');
const Users = require("./users-model.js");

router.post("/register", (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10); // 2 ^ n
  user.password = hash;

  Users.add(user)
      .then(saved => {
          res.status(201).json( {
            id: saved.id,
            username: saved.username,
            department: saved.department
            // Don't send password back.
          });
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
        const token = signToken(user);
        res.status(200).json({ token });
      }
      else {
        res.status(401).json({ message: "Yoou shall not pass!" });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

function signToken(user) {
  const payload = {
    sub: user.id,
    username: user.username,
    department: user.department
  };
  const options = {
    expiresIn: '1d'
  };
  return jwt.sign(payload, jwtSecret, options);
}

// Logout is handled on the client side when using tokens.


// ------- Getting users --------

router.get('/users', restricted, /* TODO condition, */  (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

// TODO: This is the condition middleware function:
// function onlyDepartment(department) {
//   // Only return users that match the current user's department
// }

module.exports = router;