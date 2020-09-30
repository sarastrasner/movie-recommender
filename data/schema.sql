DROP TABLE IF EXISTS recommendations;

CREATE TABLE recommendations(
  movie_id INT PRIMARY KEY,
  image_url VARCHAR(100),
  title VARCHAR(100),
  description TEXT
);


DROP TABLE IF EXISTS reviews;

CREATE TABLE reviews(
  ID SERIAL PRIMARY KEY,
  FKmovie_id INT,
  author VARCHAR(30),
  review TEXT,
  CONSTRAINT fk_movie_id
      FOREIGN KEY(FKmovie_id) 
	  REFERENCES recommendations(movie_id)
);