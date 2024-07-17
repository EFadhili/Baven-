CREATE DATABASE note_app;
USE note_app;

CREATE TABLE notes (
    id integer PRIMATY KEY AUTO_INCREMENT,
    title VARCHAR(225) NOT NULL,
    contents TEXT NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO notes(title, contents)
VALUES
('My First Note','A note about 1'),
('My Second Note','A note about something 2');
