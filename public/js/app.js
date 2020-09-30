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

currentSeason = 'halloween';
console.log(currentSeason);

renderSeasonalCSS(currentSeason);

function renderSeasonalCSS (currentSeason){
  $('body').addClass(currentSeason);
}

