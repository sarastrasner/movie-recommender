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
let movieResultsArray = [];



app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));



// routes

app.get('/', renderHomePage);
app.get('/random', generateRandomMovie);
app.get('/test', searchForKeywordID); // route for testing functions using console.log



// functions

function proofOfLife(request, response) {
  response.status(200).render('pages/index');
}

// helper function for random number generation
function rng(max) {
  return Math.floor(Math.random() * Math.floor(max));
}


// This function makes an API call for "halloween" movies and passes them through a constructor to streamline the data. The constructed objects are stored globally in an array. This is our first main pull required for generating a random movie selection. We may want to add to this if we need more data on these movies like keywords.
function getMovieData() {
  let url = `https://api.themoviedb.org/3/discover/movie`;

  for (let i = 1; i <= 5; i++) {
    let queryObject = {
      api_key: process.env.TMDBAPIKEY,
      language: 'en-US',
      sort_by: 'popularity.desc',
      include_adult: false,
      include_video: false,
      page: i,
      // the for loop generates pages 1-5, 100 entries
      with_keywords: 3335 // this is the number for halloween, christmas would have a different keyword id
    }
    superagent.get(url).query(queryObject)
      .then(data => {
        let constructedMovies = data.body.results.map(movie => new MovieObj(movie));
        constructedMovies.forEach(movie => movieResultsArray.push(movie));
      })
      .catch(error => console.log(error));
  }
}

//renders home page
function renderHomePage(request, response) {
  getMovieData();// is this the best way to do this... there is a very slight delay? Shopuld it happen globally? Then it doesn't double the array when someone returns to the homepage
  response.status(200).render('pages/index');
}

// generates a random movie from the array constructed in getMovieData
function generateRandomMovie(request, response) {
  let randomMovie = movieResultsArray[rng(100)];
  response.status(200).render('pages/searches/showRandom', {randomMovieSelection: randomMovie})
}

// this function makes a call by movie_id number, it also can return additional things like "keyword" or "cast"... we might want to use this url route to get a more complete return of movie details for our constructor or database
function gatherAdditionalData() {
  let url = `https://api.themoviedb.org/3/movie/157336`;
  let queryObject = {
    api_key: process.env.TMDBAPIKEY,
    append_to_response: 'keywords, cast'
  }
  superagent.get(url).query(queryObject)
    .then(data => console.log('these are the keywords for movie ' + data.body.keywords)
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
function recommendedMovieObj(movie) {
  this.movie_id = movie.id;
  this.image_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  this.title = movie.title;
  this.description = movie.overview;
  this.runtime = movie.runtime;
}



// listener
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log('Server is listening on port', PORT);
    });
  })



