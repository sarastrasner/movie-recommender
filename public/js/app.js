'use strict'

let currentSeason = 'christmas';

function getDate () {
  let d = new Date();
  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  let thisMonth = months[d.getMonth()];
  // console.log(thisMonth);
  return (thisMonth === 'September' || thisMonth === 'October')? currentSeason = 'halloween'
    : (thisMonth === 'November' || thisMonth === 'December') ? currentSeason = 'christmas'
      : (thisMonth === 'January' || thisMonth === 'February' || thisMonth === 'March'|| thisMonth === 'April')? currentSeason = 'romcom'
        : (thisMonth === 'May'|| thisMonth === 'June' || thisMonth === 'July' || thisMonth === 'August') ?
          currentSeason ='summer' : currentSeason = 'christmas';
}

getDate();

currentSeason = 'summer';
console.log(currentSeason);
renderSeasonalCSS(currentSeason);

function renderSeasonalCSS (currentSeason){
  $('body').addClass(currentSeason);
}
renderSeasonaltitle(currentSeason);

function renderSeasonaltitle (currentSeason){
  (currentSeason ==='halloween')? $('h1').text('Spooky Halloween Movie Recommender')
    : (currentSeason ==='christmas')? $('h1').text('Holly Jolly Movie Recommender')
      : (currentSeason ==='romcom')? $('h1').text('RomCom Movie Recommender')
        : (currentSeason ==='summer')? $('h1').text('Summer Movie Recommender')
          : $('h1').text('Holly Jolly Movie Recommender')
}

