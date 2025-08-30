const express = require('express');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');

const PORT = 3000;
const app = express();

let contactData = [
  {
    firstName: "Mike",
    lastName: "Jones",
    phoneNumber: "281-330-8004",
  },
  {
    firstName: "Jenny",
    lastName: "Keys",
    phoneNumber: "768-867-5309",
  },
  {
    firstName: "Max",
    lastName: "Entiger",
    phoneNumber: "214-748-3647",
  },
  {
    firstName: "Alicia",
    lastName: "Keys",
    phoneNumber: "515-489-4608",
  },
  {
    firstName: "Aman",
    lastName: "Ayoub",
    phoneNumber: "0744908903"
  }
];

const sortContacts = contacts => {
  return contacts.slice().sort((contactA, contactB) => {
    if (contactA.lastName < contactB.lastName) {
      return -1;
    } else if (contactA.lastName > contactB.lastName) {
      return 1;
    } else if (contactA.firstName < contactB.firstName) {
      return -1;
    } else if (contactA.firstName > contactB.firstName) {
      return 1;
    } else {
      return 0;
    }
  });
};

app.set('views', './views');
app.set('view engine', 'pug');


app.use(express.static('public'));
app.use(morgan('common'));



app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.redirect('/contacts');
});

app.get('/contacts', (req, res) => {
  res.render('contacts', {
    contacts: sortContacts(contactData),
  });
});

app.get('/contacts/new', (req, res) => {
  res.render('new-contact');
});

const validateName = (name, whichName) => {
  return body(name)
    .trim()
    .isLength({ min: 1 })
    .withMessage(`${whichName} name is required.`)
    .bail()
    .isLength({ max: 25 })
    .withMessage(`${whichName} name is too long. Maximum length is 25 characters.`)
    .isAlpha()
    .withMessage(`${whichName} name contains invalid characters. The name must be alphabetic.`);
};

app.post('/contacts/new',
  [
    validateName("firstName", "First"),
    validateName("lastName", "Last"),
    body("phoneNumber")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Phone number is required.")
      .bail()
      .matches(/^\d\d\d-\d\d\d-\d\d\d\d$/)
      .withMessage('Invalid phone number format. Use ###-###-####.'),
  ], (req, res, next) => {
    let errors = validationResult();
    if (!errors.isEmpty()) {
      res.render('new-contact', {
        errorMessages: errors.array().map(err => err.msg),
        ...req.body
      });
    } else {
      next();
    }
  }, (req, res) => {
    contactData.push({ ...req.body });
    res.redirect('/contacts');
  }
)


// Error handler:
app.use((err, req, res, next) => {
  res.status(404).send(err.message);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});