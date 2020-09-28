# Software Requirements

## Vision
**What is the vision of this product?**
This product will help users find holiday movies to watch. Users can create, read, update, and delete recommendations in a database. Users can search by keyword or view a randomly generated movie. 

**What pain point does this project solve?**
Helps users decide on which movies to watch, while providing a variety of options. 

**Why should we care about your product?**
People are stuck at home and looking for in-home entertainment. This app will simplify that process for users. 

## Scope (In/Out)
**IN - What will your product do** 
- Randomly generate a holiday-specific movie
- Let users create, read, update, and delete recommendations in a database
- Allow users to search for a holiday movie by keyword.
- Display the app in holiday-specific styling.

**OUT - What will your product not do.**
- Play the movie for the user.
- Tell the user where they can watch the movie.
- The app is movie-specific; it will not generate tv shows, activities, etc. 

## Minimum Viable Product vs Stretch Goals
**What will your MVP functionality be?**
- Randomly generate a holiday-specific movie
- Let users create, read, update, and delete recommendations in a database
- Allow users to search for a holiday movie by keyword.
- Display the app in holiday-specific styling.

**What are your stretch goals?**
- detail page for movies (including runtime, cast, trailer, etc.)
- view similar movies to a selected movie
- search by title
- eliminate inappropriate language from reviews
- provide keyword dropdown list instead of text entry
- load content/CSS based on current season

## Functional Requirements
- Randomly generate a holiday-specific movie
- Let users create, read, update, and delete recommendations in a database
- Allow users to search for a holiday movie by keyword.
- Display the app in holiday-specific styling.

## Data Flow
1. Index page: User is given three options: generate random movie, search for movie by keyword, and view recommended movies
  1. To Generate Random Movie: API call to TMDB to get 100 seasonal movies, pushing them through constructor, and storing them in an array. The first random movie is rendered as a result of the API call. A random index in the array is called to generate any subsequent random movies. There is a button that allows the user to add the selected movie to the recommendation list. 
  1. To search for movie by keyword: API call to TMDB with seasonal keyword, plus a user-selected keyword from available keyword options. Up to 20 results will be returned. There is a button that allows the user to add the selected movie to the recommendation list.
  1. To view recommended movies: a database query to select and render everything in the database. There will be a second database storing user reviews, linked with a primary key. 

## Non-Functional Requirements
Seasonality - User interface and results will reflect the current season based on the current date to put them in the holiday spirit. 
Usability - Interface is intuitive and easy for a user to navigate to give the user an enjoyable experience. 