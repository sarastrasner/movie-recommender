DROP TABLE IF EXISTS recommendations;

CREATE TABLE recommendations(
  ID SERIAL PRIMARY KEY,
  image_url VARCHAR(100),
  title VARCHAR(100),
  -- cast VARCHAR(255), this returns an array
  description TEXT,
  runtime VARCHAR(100)
  -- keywords VARCHAR(255) this returns an array. Do we need to make this a sepperate table?
  -- trailer VARCHAR(255) not sure about getting this one
  -- this can all be changed...
);
