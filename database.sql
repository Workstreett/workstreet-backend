CREATE DATABASE signup_database;

CREATE TABLE signup_table(
    signUp_id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    password VARCHAR(255),
    confirmPassword VARCHAR(255),
    fullName VARCHAR(255),
    branch VARCHAR(255),
    year VARCHAR(255),
    mailId VARCHAR(255),
    institute VARCHAR(255)
);