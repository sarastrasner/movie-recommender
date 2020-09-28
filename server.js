'use strict';


// dependancies and dependancy assignments
require('dotenv').config();
require('ejs');

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');


// Global variables

const app = express();
let PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));

let summerKeywords = [];
let springKeywords = [];
let winterKeywords = [];
let fallKeywords = [];

// keyword object generation

let romance = new Keyword('romance', 9840); summerKeywords.push(romance); winterKeywords.push(romance);
let comedy = new Keyword('comedy', 270290); springKeywords.push(comedy); summerKeywords.push(comedy); winterKeywords.push(comedy); fallKeywords.push(comedy);
let classic = new Keyword('classic', 11020); springKeywords.push(classic); summerKeywords.push(classic); winterKeywords.push(classic); fallKeywords.push(classic);
let valentinesDay = new Keyword('valentine\'s day', 160404); springKeywords.push(valentinesDay);
let wedding = new Keyword('wedding', 13027); springKeywords.push(wedding);
let familyFriendly = new Keyword('family-friendly', 267868); springKeywords.push(familyFriendly); summerKeywords.push(familyFriendly); winterKeywords.push(familyFriendly); fallKeywords.push(familyFriendly);
let kids = new Keyword('kids', 161155); springKeywords.push(kids); summerKeywords.push(kids); winterKeywords.push(kids); fallKeywords.push(kids);
let animated = new Keyword('animated', 268169); springKeywords.push(animated); summerKeywords.push(animated); winterKeywords.push(animated); fallKeywords.push(animated);
let vacation = new Keyword('vacation', 6876); springKeywords.push(vacation); summerKeywords.push(vacation);
let dogs = new Keyword('dogs', 262810); springKeywords.push(dogs); summerKeywords.push(dogs); winterKeywords.push(dogs); fallKeywords.push(dogs);
let cats = new Keyword('cats', 238502); springKeywords.push(cats); summerKeywords.push(cats); winterKeywords.push(cats); fallKeywords.push(cats);
let matchmaker = new Keyword('matchmaker', 248025); springKeywords.push(matchmaker);
let bride = new Keyword('bride', 3582); springKeywords.push(bride);
let horror = new Keyword('horror', 8087); springKeywords.push(horror); summerKeywords.push(horror); winterKeywords.push(horror); fallKeywords.push(horror);
let beach = new Keyword('beach', 966); summerKeywords.push(beach);
let highSchool = new Keyword('high school', 6270); summerKeywords.push(highSchool);
let ocean = new Keyword('ocean', 270); summerKeywords.push(ocean);
let fireworks = new Keyword('fireworks', 2407); summerKeywords.push(fireworks);
let camp = new Keyword('camp', 11663); summerKeywords.push(camp);
let comingOfAge = new Keyword('coming of age', 10683); summerKeywords.push(comingOfAge);
let baseball = new Keyword('baseball', 1480); summerKeywords.push(baseball);
let sports = new Keyword('sports', 6075); summerKeywords.push(sports);
let party = new Keyword('party', 8508); summerKeywords.push(party);
let rudolph = new Keyword('rudolph', 250057); winterKeywords.push(rudolph);
let stopMotion = new Keyword('stop motion', 10121); winterKeywords.push(stopMotion);
let musical = new Keyword('musical', 4344); summerKeywords.push(musical); winterKeywords.push(musical);
let travel = new Keyword('travel', 9935); winterKeywords.push(travel);
let nutcracker = new Keyword('nutcracker', 221288); winterKeywords.push(nutcracker);
let suspense = new Keyword('suspense', 270049); springKeywords.push(suspense); summerKeywords.push(suspense); winterKeywords.push(suspense); fallKeywords.push(suspense);
let witches = new Keyword('witches', 262167); fallKeywords.push(witches);
let ghosts = new Keyword('ghosts', 256394); fallKeywords.push(ghosts);
let scary = new Keyword('scary', 268170); fallKeywords.push(scary);


// routes

app.get('/', renderHomePage);
app.get('/random', generateRandomMovie);
app.get('/test', gatherAdditionalData); // route for testing functions using console.log



// functions

function proofOfLife(request, response) {
  response.status(200).render('pages/index');
}

// helper function for random number generation
function rng(max) {
  return Math.floor(Math.random() * Math.floor(max));
}


// This function makes an API call for "halloween" movies and passes them through a constructor to streamline the data. The constructed objects are stored globally in an array. This is our first main pull required for generating a random movie selection. We may want to add to this if we need more data on these movies like keywords. Returns a randomly generated movie based on the array to 'searches/showRandom'
function generateRandomMovie(request, response) {
  let url = `https://api.themoviedb.org/3/discover/movie`;

  let queryObject = {
    api_key: process.env.TMDBAPIKEY,
    language: 'en-US',
    sort_by: 'popularity.desc',
    include_adult: false,
    include_video: false,
    page: rng(5),
    with_keywords: 3335 // this is the number for halloween, christmas would have a different keyword id
  }
  superagent.get(url).query(queryObject)
    .then(data => {
      let constructedMovie = data.body.results.map(movie => new MovieObj(movie));
      let randomMovie = constructedMovie[rng(20)];
      response.status(200).render('pages/searches/showRandom', {randomMovieSelection: randomMovie})
    })
    .catch(error => console.log(error));

}

//renders home page
function renderHomePage(request, response) {
  response.status(200).render('pages/index');
}


// this function makes a call by movie_id number, it also can return additional things like "keyword" or "cast"... we might want to use this url route to get a more complete return of movie details for our constructor or database
function gatherAdditionalData() {
  let url = `https://api.themoviedb.org/3/movie/4232`;
  let queryObject = {
    api_key: process.env.TMDBAPIKEY,
    append_to_response: 'keywords'
  }
  superagent.get(url).query(queryObject)
    .then(data => console.log('these are the keywords for movie ' + data.body.results )
    )
    .catch(error => console.log(error));

}

// this will search for keyword id's by name and return ID numbers, we have to use the id numbers to search the api by keyword... need to determine how we are going to do this. Will we add key words to our original movie array or will we do new queries by keyword for each movie?
function searchForKeywordID() {
  console.log('in the function');
  let url = `https://api.themoviedb.org/3/search/keyword`;
  let queryObject = {
    api_key: process.env.TMDBAPIKEY,
    query: 'family'
  };
  superagent.get(url).query(queryObject)
    .then(data => console.log('these are the id numbers that match the keyword search' + data.body.results[0].id + data.body.results[0].name)
    )
    .catch(error => console.log(error));
}


// constructors

function MovieObj(movie) {
  this.movie_id = movie.id;
  this.title = movie.title;
  this.description = movie.overview;
  this.image_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`; // the beginning part is refering to the hosting site, and the size (w500)
}

// don't know if we ultimately want two constructors. We will want to talk about the purpose of each of these
// function recommendedMovieObj(movie) {
//   this.movie_id = movie.id;
//   this.image_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
//   this.title = movie.title;
//   this.description = movie.overview;
//   this.runtime = movie.runtime;
// }

function Keyword(name, id) {
  this.name = name;
  this.id = id;
}

// We might not ultimately need this, but I think it's a step in the right direction in terms of "switching" our app based on the current month. Right now it's just triggering a console.log.
function getDate () {
  let d = new Date();
  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  let thisMonth = months[d.getMonth()];
  // console.log(thisMonth);
  return (thisMonth === 'September' || thisMonth === 'October')? console.log('Halloween')
    : (thisMonth === 'November' || thisMonth === 'December') ? console.log('Christmas')
      : (thisMonth === 'January' || thisMonth === 'February' || thisMonth === 'March'|| thisMonth === 'April')? console.log('RomCom')
        : (thisMonth === 'May'|| thisMonth === 'June' || thisMonth === 'July' || thisMonth === 'August') ?
          console.log('Summer') : console.log('undefined');
}


// listener
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log('Server is listening on port', PORT);
    });
  })



