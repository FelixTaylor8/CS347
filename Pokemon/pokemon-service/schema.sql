CREATE TABLE mon(
    id INT PRIMARY KEY,
    name TEXT,
    likes INT
);

CREATE TABLE nickname(
    id INT PRIMARY KEY,
    nick TEXT,
    mon TEXT,
    reviewed INT,
    reported INT,
    likes INT
);

CREATE TABLE funfact(
    id INT PRIMARY KEY,
    fact TEXT,
    mon TEXT,
    reviewed INT,
    reported INT,
    likes INT
);

INSERT INTO mon VALUES (1, 'bulbasaur', 0);
INSERT INTO mon VALUES (2, 'ivysaur', 0);
INSERT INTO mon VALUES (3, 'venusaur', 0);
INSERT INTO mon VALUES (4, 'charmander', 0);
INSERT INTO mon VALUES (5, 'charmeleon', 0);
INSERT INTO mon VALUES (6, 'charizard', 0);
/* etc to Pokedex entry 99 (Kingler) */