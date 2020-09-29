'use strict'

let currentSeason = 'Christmas';

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

getDate();
renderSeasonalCSS(currentSeason);

function renderSeasonalCSS (currentSeason){
  return (currentSeason === 'Halloween') ? $('body').addClass('halloween')
    : (currentSeason === 'RomCom') ? $('body').addClass('romcom')
      : (currentSeason === 'Summer') ? $('body').addClass('summer')
        : $('body').addClass('christmas');
}

