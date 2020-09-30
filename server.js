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

let seasonalKeyword = 9799;
getDate();


// routes

app.get('/', renderHomePage);
app.get('/random', generateRandomMovie);
//app.get('/test', ); // route for testing functions using console.log
app.get('/new', renderGenreSearch);
app.post('/genreSearch', searchByGenre);
app.get('/about', renderAboutPage);
app.get('/recommendations', renderRecommendations);
app.post('/', addRecommendedToData);
app.get('/reviews/:id', renderReview);
app.put('/reviews/:id', addReview);



// functions

function getDate () {
  let d = new Date();
  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  switch(months[d.getMonth()]) {
  case 'September' || 'October':
    seasonalKeyword = 3335
    break;
  case 'November' || 'December':
    seasonalKeyword = 207317
    break;
  case 'January' || 'February' || 'March' || 'April':
    seasonalKeyword = 9799
    break;
  case 'May' || 'June' || 'July' || 'August':
    seasonalKeyword = 13088
    break;
  default:
    seasonalKeyword = 13088
    break;
  }
}


function proofOfLife(request, response) {
  response.status(200).render('pages/index');
}

// helper function for random number generation
function rng(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
function pageRng(max) {
  let num = Math.floor(Math.random() * Math.floor(max));
  if (num === 0) {
    num = Math.floor(Math.random() * Math.floor(max));
  } else {
    return num;
  }
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
    page: pageRng(5),
    with_keywords: seasonalKeyword
  }
  superagent.get(url).query(queryObject)
    .then(data => {
      let constructedMovie = data.body.results.map(movie => new MovieObj(movie, seasonalKeyword));
      let randomMovie = constructedMovie[rng(20)];
      response.status(200).render('pages/searches/showRandom', {randomMovieSelection: randomMovie})
    })
    .catch(error => console.log(error));

}

//renders home page
function renderHomePage(request, response) {
  response.status(200).render('pages/index');
}

//renders review page
function renderReview(request, response) {
  const id = request.params.id;
  console.log(id);
  response.status(200).render(`pages/reviews`, {movie_id: id});
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
      let constructedMovie = data.body.results.map(movie => new MovieObj(movie, seasonalKeyword));
      response.status(200).render('pages/searches/genre', {genreResults: constructedMovie})
    })
    .catch(error => console.log(error));

}

function renderAboutPage(request, response) {
  response.status(200).render('pages/about');
}

//function to add info into recommendations table
function addRecommendedToData (request, response) {
  const {movie_id, image_url, title, description, seasonal_keyword} = request.body;
  const sql = 'INSERT INTO recommendations (movie_id, image_url, title, description, seasonal_keyword) VALUES ($1, $2, $3, $4, $5);';
  const safeValues = [movie_id, image_url, title, description, seasonal_keyword];
  client.query(sql, safeValues)
    .then((results) => {
      console.log(results)
      response.status(200).redirect('/recommendations');
    }).catch(error =>{
      let str = 'This movie has already been recommended';
      response.render('pages/error', {message: str})
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
    values[0].rows.forEach(movie => recommendations.push(new RecommendedMovieObj(movie, seasonalKeyword)));
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

// adds a review to a recommended movie
function addReview(request, response) {
  console.log(request.body);
  let {movie_id, author, review} = request.body;
  const sql ='INSERT INTO reviews (fkmovie_id, author, review) VALUES ($1, $2, $3);';
  const safeValues = [movie_id, author, review];
  client.query(sql, safeValues)
    .then((results) => {
      response.status(200).redirect('/recommendations');
    })
}





// constructors

function MovieObj(movie, seasonalKeyword) {
  this.movie_id = movie.id;
  this.title = movie.title;
  this.description = movie.overview;
  this.image_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`; // the beginning part is refering to the hosting site, and the size (w500)
  this.seasonal_keyword = seasonalKeyword;
}

function RecommendedMovieObj(movie) {
  this.movie_id = movie.movie_id;
  this.image_url = movie.image_url;
  this.title = movie.title;
  this.description = movie.description;
  this.seasonal_keyword = seasonalKeyword;
  this.reviews = [];
}

function Genre(genreObj) {
  this.name = genreObj.name;
  this.id = genreObj.id;
}


// listener
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log('Server is listening on port', PORT);
    });
  })



