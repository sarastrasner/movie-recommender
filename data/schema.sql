DROP TABLE IF EXISTS recommendations;

CREATE TABLE recommendations(
  ID SERIAL PRIMARY KEY,
  image_url VARCHAR(100),
  title VARCHAR(100),
  cast VARCHAR(255),
  description TEXT,
  runtime VARCHAR(100),
  keywords VARCHAR(255),
  trailer VARCHAR(255)
  -- this can all be changed...
);
