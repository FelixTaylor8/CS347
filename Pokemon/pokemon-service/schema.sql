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