//get all of the needed packages
const Sequelize = require('sequelize');
var express = require('express');
const book = require('./models/book');
var app = express()
const bodyParser = require('body-parser');

app.listen(3000) //sets the port to localhost:3000

app.set("view engine", "pug"); //set view engine to pug
app.use('/static', express.static('public')); //a way to get to the css from the pug file
app.use(bodyParser.urlencoded({ extended: true })); //sets bodyParser so that I can get the data from submit fors easier

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './libary.db'
});

class Book extends Sequelize.Model {} //sets up the book obj
Book.init({
  title: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Please provide a value for "title"',
      }
    }
  },
  author: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Please provide a value for "title"',
      }
    }
  },
  genre: {
    type: Sequelize.STRING
  },
  year: {
    type: Sequelize.INTEGER
  }
}, { sequelize });

let books = []; //empty array that I use to make it easier and faster to keep track of data

function fixTitle(toFix) { //a function used to make title readable in the URL. If a book where to have a space bar the URL gets all messed up so this adds dashes instead of spaces
  splited = toFix.split("")
  for(x = 0; x < splited.length; x++) {
    if(splited[x] == " ") {
      splited[x] = "-"
    }
  }
  return splited.join("")
}

(async () => { //sets up the main datastore and gives value to the books array
  await sequelize.sync({ logging: true, force: false });
  //await Book.create({ title: "Test T", author: "Test A", genre: "Test G", year:00 });

  try {
    let bookValues = await Book.findAll();
    books = [];
    bookValues.map(book => books.push({title: `${book.title}`, author: `${book.author}`, genre: `${book.genre}`, year: `${book.year}`, fixed: fixTitle(book.title)}));
  } catch(error) {
    res.render("error", {error: error})
  }
})();

app.get('/', (req, res) => { //when the user goes to the home route
  res.redirect('/books')
});

app.get('/books', (req, res) => { //when the user goes to the books route
  res.render("index", {books: books})
});

app.get('/books/new', (req, res) => { //when the user wants to make a new book
  res.render("new-book")
});

app.post('/books/new', (req, res) => { //once they filled out all of the information for the book
  (async () => {
    await sequelize.sync({ logging: true, force: false });
    
    try {
      await Book.create({ title: `${req.body.title}`, author: `${req.body.author}`, genre: `${req.body.genre}`, year:`${req.body.year}`});
      let bookValues = await Book.findAll();
      books = [];
      bookValues.map(book => books.push({title: `${book.title}`, author: `${book.author}`, genre: `${book.genre}`, year: `${book.year}`, fixed: fixTitle(book.title)}));
    } catch(error) {
      res.render("error", {error: error})
    }
  })();
  setTimeout(() => { 
    res.redirect("/") 
  }, 100);
  
});

app.get('/books/:id', (req, res) => { //when you want to edit a specific book
  let valid = false;
  let currentBook;

  for(x = 0; x < books.length; x++) {
    if(books[x].fixed == req.params.id) {
      valid = true;
      currentBook = books[x];
    }
  }

  if(valid == true) {
    res.render("update-book", {current: currentBook})
  } else {
    res.render("page-not-found")
  }
});

app.post('/books/:id', (req, res) => { //once you edited the book
  let newValues = req.body;
  let currentTitle;
  let y;
  let bookValues;

  for(x = 0; x < books.length; x++) {
    if(books[x].fixed == req.params.id) {
      currentTitle = books[x].title;
      y = x;
    }
  }
  (async () => {
    await sequelize.sync({ logging: true, force: false });

    try {
      const bookValues = await Book.create({ title: newValues.title, author: newValues.author, genre: newValues.genre, year: newValues.year});

      Book.destroy({
        where: {
          title: currentTitle
        }
      })

      //await bookValues.save()
      
      books[y].title = newValues.title;
      books[y].author = newValues.author;
      books[y].genre = newValues.genre;
      books[y].year = newValues.year;
      books[y].fixed = fixTitle(newValues.title);
 
    } catch(error) {
      res.render("error", {error: error})
    }
  })();
  setTimeout(() => { res.redirect("/") }, 200);
});

app.post('/books/:id/delete', (req, res) => { //when you delete a book
  let valid = false;
  let currentBook;
  let y;

  for(x = 0; x < books.length; x++) {
    if(books[x].fixed == req.params.id) {
      valid = true;
      currentBook = books[x];
      y = x;
    }
  }

  if(valid == true) {
    Book.destroy({
      where: {
        title: books[y].title
      }
    })
    console.log("Before: "+JSON.stringify(books))
    let index = y;
    books.splice(y, 1);
    console.log("After: "+JSON.stringify(books))
    setTimeout(() => { 
      res.redirect("/")
    }, 250);
  } else {
    res.render("page-not-found")
  }
});

app.use(function (req, res, next) { //catches 404 errors
  res.render("page-not-found")
  res.status(404).send("404: Page not found. Please make sure that your route is valid.")
})