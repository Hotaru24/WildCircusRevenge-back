const express = require('express');
const sha256 = require('sha256');
const jwt = require('jsonwebtoken');
const connection = require('../conf');
const key = require('../key.js');

const router = express.Router();

// Middleware qui vérifie si l'on est authentifié à
// partir du header du useEffect de App dans le front.
const isAuthenticated = (req, res, next) => {
  if (typeof req.headers.authorization !== 'undefined') {
    const token = req.headers.authorization.split(' ')[1];// récupère le token sans le header sans le Bearer
    jwt.verify(token, key, (err, admin) => { // Verifie si le token est juste.
      if (err) {
        res.status(403).send('Not Authorized');
        console.log('pas bon !');
      }
      req.adminEmail = admin.data.email;
      return next();
    });
  } else {
    console.log('not good!');
    res.status(403).send('Not Authorized'); // pas de next() pour que le
  } // middleware bloque la requete
}; // en cas d'erreur


router.get('/', isAuthenticated, (req, res) => {
  connection.query('SELECT name, email FROM admin WHERE email = ?',
    [req.adminEmail], (err, rows) => {
      if (err) {
        res.sendStatus(500);
      }
      if (rows.length > 0) {
        res.status(200).json(rows[0]);
      } else {
        res.status(404).send('Not Found');
      }
    });
});

router.put('/:id', (req, res) => {
  const { name, email, password } = req.body;
  connection.query(`UPDATE admin 
    SET 
      name = '?', 
      email = '?', 
      password = '?'`,
  [name, email, sha256(password)],
  (err) => {
    if (err) {
      console.log(err);
      res.sendStatus(400).send('Erreur lors de la modification de la page Admin');
      throw err;
    } else {
      res.sendStatus(200);
    }
  });
});

router.delete('/:id', (req, res) => {
  connection.query(`DELETE FROM admin
  WHERE id = ?`, [req.params.id],
  (err) => {
    if (err) {
      console.log(err);
      res.sendStatus(400).send("Erreur lors de la suppression de l'Admin");
      throw err;
    } else {
      res.sendStatus(200);
    }
  });
});

router.post('/', (req, res) => {
  console.log(req.body);
  const { name, email, password } = req.body;
  connection.query(`INSERT INTO admin (name, email, password) 
  VALUES (?, ?, ?)`, [name, email, sha256(password)],
  (err) => {
    if (err) {
      console.log(err);
      res.sendStatus(400).send("Erreur lors de l'enregistrement de la page Admin");
      throw err;
    } else {
      res.sendStatus(200);
    }
  });
});

module.exports = router;
