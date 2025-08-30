const express = require('express');
const morgan = require('morgan');
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

function containsNonAlpha(string) {
  return string.match('[^a-zA-Z]') !== null;
}

function isUniqueName(name, contacts) {
  for (let contact of contacts) {
    if (`${contact.firstName} ${contact.lastName}` === name) {
      return false;
    }
  }
  return true;
}

function invalidNumber(phoneNumber) {
  return phoneNumber.replaceAll(/[0-9]/g, '#') !== '###-###-####';
}

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

app.post('/contacts/new', (req, res, next) => {
  req.body.firstName = req.body.firstName.trim();
  req.body.lastName = req.body.lastName.trim();
  req.body.phoneNumber = req.body.phoneNumber.trim();
  next();
}, (req, res, next) => {
  res.locals.errorMessages = [];
  next();
}, (req, res, next) => {
  if (req.body.firstName.length === 0) {
    res.locals.errorMessages.push('First name is required.');
  }
  next();
}, (req, res, next) => {
  if (containsNonAlpha(req.body.firstName) || containsNonAlpha(req.body.lastName)) {
    res.locals.errorMessages.push('Name should contain only alphabets.');
  }
  next();
}, (req, res, next) => {
  if (req.body.lastName.length === 0) {
    res.locals.errorMessages.push('Last name is required.');
  }
  next();
}, (req, res, next) => {
  if (!isUniqueName(`${req.body.firstName} ${req.body.lastName}`, contactData)) {
    res.locals.errorMessages.push('Contact already exists.');
  }
  next();
}, (req, res, next) => {
  if (req.body.phoneNumber.length === 0) {
    res.locals.errorMessages.push('Phone number is required.');
  }
  next();
}, (req, res, next) => {
  if (invalidNumber(req.body.phoneNumber)) {
    res.locals.errorMessages.push('Invalid phone number format. Use ###-###-####');
  }
  next();
}, (req, res, next) => {
  if (res.locals.errorMessages.length > 0) {
    res.render('new-contact', {
      errorMessages: res.locals.errorMessages,
      ...req.body
    });
  } else {
    next();
  }
}, (req, res) => {
  contactData.push({ ...req.body });
  res.redirect('/contacts');
});


// Error handler:
app.use((err, req, res, next) => {
  res.status(404).send(err.message);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});