/* eslint-disable camelcase, no-unused-vars */
const express = require('express');
const path = require('path');
const multer = require('multer');
const cron = require('node-cron');
const fs = require('fs');
const connection = require('../conf');


//= ====================-_MULTER_-=========================
// Upload de fichiers
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // si le dossier existe pas le créer
    cb(null, './public/uploads');
  },
  filename(req, file, cb) {
    cb(null, `picture${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });


//= ======================-_FS_-==========================
// Vérifie si dossiers Public et Uploads existent,
// sinon création des dossiers /public et /uploads

// Directory -public-
fs.access('./public', (error) => {
  if (error) {
    console.log('Directory /public not yet exists.');
    fs.mkdir('./public', (err) => {
      if (err) {
        console.log('Directory /public already exists');
      } else {
        console.log('Directory /public successfully created.');
      }
    });
  } else {
    console.log('Directory /public exists.');
  }
});
// Directory -uploads-
fs.access('./public/uploads', (error) => {
  if (error) {
    console.log('Directory /uploads not yet exists.');
    fs.mkdir('./public/uploads', (err) => {
      if (err) {
        console.log('Directory /uploads already exists');
      } else {
        console.log('Directory /uploads successfully created.');
      }
    });
  } else {
    console.log('Directory /public/uploads exists.');
  }
});



//= ======================-_FS_-==========================
// Fonction de suppression automatique des images de plus de 31 jours
const deleteImage = (image) => {
  const chemin = `./public/uploads/${image}`;
  fs.unlink(chemin, (err) => {
    if (err) {
      console.log('Erreur dans la suppression automatique des images de + 31 jours');
      console.error(err);
      throw err;
    } else {
      return console.log('Image(s) de + 31 jours supprimée(s)');
    }
  });
};

//= ====================-_CRON_-=========================
// CRON active tous les jours la requete sql
// suprime les annonces de plus d'1 mois

cron.schedule('59 23 * * * ', () => {
  connection.connect(() => {
    console.log(`Nettoyage annonces expirées ${Date.now()}`);
    connection.query('SELECT url_image FROM events WHERE CURDATE() > date', (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        result.map((image) => deleteImage(image.url_image));
      }
    });
    connection.query('DELETE FROM events WHERE CURDATE() > date', (err) => {
      if (err) {
        console.log(err);
        throw err;
      }
    });
  });
});

//= ====================-_ROUTES_-=======================
const router = express.Router();
router.get('/', (req, res) => {
  connection.query('SELECT * FROM events', (err, results) => {
    if (err) {
      console.log(err);
      res.sendStatus(400).send('Erreur lors de la récupération des annonces');
      throw err;
    } else {
      res.send(results);
    }
  });
});
router.get('/:id', (req, res) => {
  connection.query(`SELECT * FROM events
  WHERE id = ${req.params.id}`, (err, results) => {
    if (err) {
      console.log(err);
      res.sendStatus(400).send("Erreur lors de la récupération de l'annonce");
      throw err;
    } else {
      res.send(results);
    }
  });
});

router.delete('/:id', (req, res) => {
  connection.query(`DELETE FROM events
  WHERE id = ${req.params.id}`,
  (err) => {
    if (err) {
      console.log(err);
      res.sendStatus(400).send("Erreur lors de la suppression de l'annonce");
      throw err;
    } else {
      connection.query('SELECT * FROM events', (response) => {
        if (err) {
          res.sendStatus(500);
        } else {
          res.json(response);
        }
      });
    }
  });
});

router.post('/', upload.single('picture'), (req, res) => {
  let file;
  if (req.file !== undefined) {
    file = req.file.filename;
  } else {
    file = '';
  }
  if (req.body) {
    const {
      title, description, price, url_image
      } = req.body;
    if (!title || !description ) {
      res.sendStatus(400);
    } else {
      connection.query(`INSERT INTO events (title, description, price, url_image, date)
        VALUES (?, ?, ?, ?, NOW())`,
      [title, description, price, url_image],
      (err) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res.sendStatus(200);
        }
      });
    }
  } else {
    res.sendStatus(400);
  }
});
module.exports = router;
