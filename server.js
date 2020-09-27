'use strict';


// dependancies and dependancy assignments
require('dotenv').config();
require('ejs');

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');


const app = express();
let PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));

// routes


// functions


// constructors


client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log('Server is listening on port', PORT);
    });
  })



