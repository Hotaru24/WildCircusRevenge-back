DROP DATABASE IF EXISTS WildCircus;
CREATE DATABASE IF NOT EXISTS WildCircus;
USE WildCircus;

DROP TABLE IF EXISTS admin, events;

CREATE TABLE admin (
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password TEXT
);

CREATE TABLE events (
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  description TEXT(1200) NOT NULL,
  price VARCHAR(10),
  url_image VARCHAR(100),
  date DATETIME NOT NULL
);


