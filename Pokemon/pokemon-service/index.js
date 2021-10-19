const fs = require('fs');
const mysql = require('mysql');
const express = require('express');
const json = fs.readFileSync('credentials.json', 'utf8');
const credentials = JSON.parse(json);
const connection = mysql.createConnection(credentials);

const service = express();
service.use(express.json());

connection.connect(error => {
    if (error) {
        console.error(error);
        process.exit(1);
    }
});

const port = 5001;
service.listen(port, () => {
    console.log(`We're live in port ${port}!`);
});

async function getNameSpriteType(name) {
    try {
        var response = await fetch('https://pokeapi.co/api/v2/pokemon/' + name);
        var data = await response.json();
        var result;
        result.name = data.name;
        result.sprite = data.sprites.front_default;
        result.typeOne = data.types[0].type.name;
        result.typeTwo = NULL;
        if (data.types.length > 1) {
            result.typeTwo = data.types[1].type.name;
        }
        return result;
    } catch (err) {
        alert(err);
        return NULL;
    }
}

async function getIdDescGenus(name) {
    try {
        var response = await fetch('https://pokeapi.co/api/v2/pokemon-species/' + name);
        var data = await response.json();
        var info;
        for (let i = 0; i < data.pokedex_numbers.length; i++) {
            let entry = data.pokedex_numbers[i];
            if (entry[i].pokedex.name === "national") {
                info.id = parseInt(entry.entry_number);
                break;
            }
        }
        for (let i = 0; i < data.flavor_text_entries.length; i++) {
            let entry = data.flavor_text_entries[i];
            if (entry.language.name === "en") {
                info.description = entry.flavor_text;
                break;
            }
        }
        for (let i = 0; i < data.genera.length; i++) {
            let entry = data.genera[i];
            if (entry.language.name === "en") {
                info.genus = entry.genus;
                break;
            }
        }
        return info;
    } catch (err) {
        alert(err);
        return NULL;
    }
}

service.get('/pokemon/:name', (request, response) => {
    var name = request.params.name.toLowerCase();
    var nameSpriteType = getNameSpriteType(name);
    var idDescGenus = getIdDescGenus(name);
    if (nameSpriteType == null || idDescGenus == null) {
        response.json({
            ok: false,
            results: `Pokemon could not be found: ${name}`,
        })
    } else {
        var result;
        result.id = idDescGenus.id
        result.name = nameSpriteType.name;
        result.typeOne = nameSpriteType.typeOne;
        result.typeTwo = nameSpriteType.typeTwo;
        result.genus = idDescGenus.genus;
        result.description = idDescGenus.description;
        response.json({
            ok: true,
            results: result,
        });
    }
});

/**
service.post('pokemon/:name', (request, response) => {
  if (service.get(request.params.name).ok) {
    response.json({
      ok:false,
      results: 'Pokemon already exists',
    });
    return;
  }
  var nameSpriteType = getNameSpriteType(request.params.name);
  var idDescGenus = getIdDescGenus(request.params.name);
  if (nameSpritType == NULL || idDescGenus == NULL) {
    response.json({
      ok: false,
      results: 'Pokemon could not be added.',
    });
    return;
  }
  const parameters = [
  idDescGenus.id,
  nameSpriteType.name,
  nameSpriteType.sprite,
  nameSpriteType.typeOne,
  nameSpriteType.typeTwo,
  idDescGenus.description,
  idDescGenus.genus,
    ]
    var sql = "INSERT INTO mon(id, name, sprite, typeOne, typeTwo, description, genus) VALUES ('?, ?, ?, ?, ?, ?, ?')";
    mysql.query(query, parameters, (error, result) => {
      if (error) {
        response.status(500);
        response.json({
          ok: false,
          results: error.message,
        });
      } else {
        response.json({
          ok: true,
          results: "Pokemon successfully added.",
        });
      }
    });
});
*/


/**
service.get('pokemon/:name', (request, response) => {


  /**
  const query = 'SELECT * FROM mon WHERE name = ' + request.params.name;
  connection.query(query, (error, rows) => {
    if (error) {
      response.status(500);
      response.json({
        ok:false,
        results: "Pokemon does not exist yet.",
      })
    } else {
      response.json({
        ok:true,
        results: rows.map(rowToMon)
      });
    }
  });
});*/