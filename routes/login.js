const express = require('express');
const sha256 = require('sha256');
const jwt = require('jsonwebtoken');
const connection = require('../conf');
const key = require('../key.js');

const router = express.Router();

const generateToken = (email) => jwt.sign({
  exp: Date.now() + (24 * 60 * 60),
  data: {
    email,
  },
}, key);

router.post('/', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send('saisie incomplète');
  } else {
    connection.query(`SELECT name, email FROM admin
    WHERE email = ? AND password = ?`, [email, sha256(password)], (err, result) => {
      if (err) {
        res.sendStatus(400);
        throw err;
      } else if (result.length <= 0) {
        res.status(403).send('erreur dans la saisie des informations');
      } else {
        res.status(200).send(
          {
            token: generateToken(result[0].email),
            admin: result[0],
          },
        );
      }
    });
  }
});


module.exports = router;
