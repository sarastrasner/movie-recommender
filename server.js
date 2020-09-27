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

app.get('/', getMovieData);



// functions

function proofOfLife(request, response) {
  response.status(200).render('pages/index');
}

// helper function for random number generation
function rng(max) {
  return Math.floor(Math.random() * Math.floor(max));
}


// This function makes an API call for "halloween" movies and passes them through a constructor to streamline the data. Currently used for random movie selection
function getMovieData(request, response) {
  let url = `https://api.themoviedb.org/3/discover/movie`
  let queryObject = {
    api_key: process.env.TMDBAPIKEY,
    language: 'en-US',
    sort_by: 'popularity.desc',
    include_adult: false,
    include_video: false,
    page: 1,
    // currently pulls in the first page of 12 pages of results... which renders 20 movies... do we want more than one pull? returns with "halloween" up to 228 results
    with_keywords: 3335 // this is the number for halloween, christmas would have a different keyword id
  }

  superagent.get(url).query(queryObject)
    .then(data => {
      // the way we are storing this "results movie array" is currently only scoped to this specific call... we need to think about how frequently we want to call the api and get the data. Is is everytime we chose "get a random recommendation" or do we call one time when the person visits the page, store the data globally, and then just run an rng on the array to render the result? Might be better to set up a single pull when you come to the page and store the results to a database, then pull from the database depending on random ID number or key words. If we did this our initial API call function would probably need to be a bit more intense, making several queries to obtain all of the information we need. Currently only getting the following with this call:
      //{
      //   popularity: 12.716,
      //   id: 323262,
      //   video: false,
      //   vote_count: 319,
      //   vote_average: 5,
      //   title: 'Holidays',
      //   release_date: '2016-04-22',
      //   original_language: 'en',
      //   original_title: 'Holidays',
      //   genre_ids: [ 35, 27 ],
      //   backdrop_path: '/j0WqwIfrrzDgvnEBXbzM41ulpWY.jpg',
      //   adult: false,
      //   overview: 'An anthology feature film that puts a uniquely dark and original spin on some of the most iconic and beloved holidays of all time by challenging our folklore, traditions and assumptions.',
      //   poster_path: '/qndlHSuAaGwBKpWAUt6gX3RRuzb.jpg'
      // }

      // we would also need all of the other properties in our schema
      // I am not sure if it is better to store the api return in an array or in the database... Might be better to store in an array until the user wants to add the movie to recommendations so we don't have to use a logic statement to determine if we need to drop and rebuild the data.

      let resultsMovieArray = data.body.results.map(movie => new MovieObj(movie));
      let randomMovie = resultsMovieArray[rng(20)]; //currently recieving 20 results, would have to change the parameter passed to rng() if we enlarged the size of our api results
      response.status(200).render('pages/searches/showRandom', {randomMovieSelection: randomMovie});
    })
    .catch(error => console.log(error));
}





// constructors

function MovieObj(movie) {
  this.title = movie.title;
  this.description = movie.overview;
  this.image_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`; // the beginning part is refering to the hosting site, and the size (w500)
}




// listener
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log('Server is listening on port', PORT);
    });
  })



