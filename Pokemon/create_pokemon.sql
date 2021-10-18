DROP DATABASE IF EXISTS pokemon;
DROP USER IF EXISTS pokemon_user@localhost;

CREATE DATABASE pokemon CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER pokemon_user@localhost IDENTIFIED WITH mysql_native_password BY 'IndigoBlue102!';
GRANT ALL PRIVILEGES ON pokemon.* TO pokemon_user@localhost;
