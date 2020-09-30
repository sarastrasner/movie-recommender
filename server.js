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
let PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));

let seasonalKeyword = 3335;

// routes

app.get('/', renderHomePage);
app.get('/random', generateRandomMovie);
app.get('/test', renderRecommendations); // route for testing functions using console.log
app.get('/new', renderGenreSearch);
app.post('/genreSearch', searchByGenre);
app.get('/about', renderAboutPage);
app.get('/recommendations', renderRecommendations);
app.post('/', addRecommendedToData);



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
    with_keywords: seasonalKeyword // this is the number for halloween, christmas would have a different keyword id
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

// this function calls the api and gets the list of genre to use for our dropdown menu
function renderGenreSearch(request, response) {
  let url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDBAPIKEY}&language=en-US`
  superagent.get(url)
    .then(data => {
      let genreOptions = data.body.genres.map(genreObj => new Genre(genreObj));console.log(genreOptions);
      response.status(200).render('pages/searches/new', {genre: genreOptions})
    })
    .catch(error => console.log(error));
}


// this function makes an api call based on seasonal keyword and an additional genre ID- we will need to set up the ejs page to return a genre based on the selection from the user
function searchByGenre(request, response) {
  let searchGenre = request.body.genre;
  let url = `https://api.themoviedb.org/3/discover/movie`;

  let queryObject = {
    api_key: process.env.TMDBAPIKEY,
    language: 'en-US',
    sort_by: 'popularity.desc',
    include_adult: false,
    include_video: false,
    page: 1,
    with_genres: searchGenre,
    with_keywords: seasonalKeyword
  }
  superagent.get(url).query(queryObject)
    .then(data => {
      let constructedMovie = data.body.results.map(movie => new MovieObj(movie));
      response.status(200).render('pages/searches/genre', {genreResults: constructedMovie})
    })
    .catch(error => console.log(error));

}

function renderAboutPage(request, response) {
  response.status(200).render('pages/about');
}

//function to add info into recommendations table
function addRecommendedToData (request, response) {
  const {image_url, title, description} = request.data.body.results;
  const sql = 'INSERT INTO recommendations (image_url, title, description) VALUES ($1, $2, $3);';
  const safeValues = [image_url, title, description];
  client.query(sql, safeValues)
    .then((results) => {
      console.log(results)
      response.redirect(`/`)
    })
}

// this function pulls database info in and displays it to the recommendations page
function renderRecommendations(request, response) {
  let sql = `SELECT * FROM recommendations`;
  let promise1 = client.query(sql)

  let sql2 = `SELECT * FROM reviews;`;
  let promise2 = client.query(sql2)

  Promise.all([promise1, promise2]).then((values) => {
    let recommendations = []
    values[0].rows.forEach(movie => recommendations.push(new RecommendedMovieObj(movie)));
    let reviews = values[1].rows;
    recommendations.forEach(movie => {
      for (let i = 0; i < reviews.length; i++) {
        if (movie.movie_id === reviews[i].fkmovie_id) {
          movie.reviews.push(reviews[i]);
        }
      }
    });
    response.status(200).render('pages/recommendations', {recommended: recommendations})
  });
}



// constructors

function MovieObj(movie) {
  this.movie_id = movie.id;
  this.title = movie.title;
  this.description = movie.overview;
  this.image_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`; // the beginning part is refering to the hosting site, and the size (w500)
}

function RecommendedMovieObj(movie) {
  this.movie_id = movie.movie_id;
  this.image_url = movie.image_url;
  this.title = movie.title;
  this.description = movie.description;
  this.reviews = [];
}

function Genre(genreObj) {
  this.name = genreObj.name;
  this.id = genreObj.id;
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



