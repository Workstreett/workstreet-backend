CRAETE DATABASE user_database;
CREATE TABLE users(
    user_id serial PRIMARY KEY,
    username VARCHAR(255),
    password VARCHAR(64),
    fullname VARCHAR(255),
    branch VARCHAR(255),
    year VARCHAR(20),
    officialmailid VARCHAR(255),
    institute VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE
);