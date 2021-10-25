const fs = require('fs');
const mysql = require('mysql');
const express = require('express');
const json = fs.readFileSync('credentials.json', 'utf8');
const credentials = JSON.parse(json);
const connection = mysql.createConnection(credentials);

const service = express();
service.use(express.json());

var pokemon = [];

connection.connect(error => {
    if (error) {
        console.error(error);
        process.exit(1);
    }
});

/**
 * This is so post requests are easier to make
 * without checking if the Pokemon exists first
 */
connection.query("SELECT * FROM mon", (error, rows) => {
  pokemon = rows.map(rowToMon);
});

const port = 5009;
service.listen(port, () => {
    console.log(`We're live in port ${port}!`);
});

// Helper to check if a pokemon is valid
function findMon(name) {
  for (let k = 0; k < pokemon.length; k++) {
    if (pokemon[k].name === name.toLowerCase()) return true;
  }
  return false;
}


/** Mon section */

function rowToMon(row) {
  return {
    id: row.id,
    name: row.name,
    likes: row.likes
  };
}

// Get all pokemon
service.get('/pokemon', (request, response) => {
  const query = "SELECT * FROM mon";
  connection.query(query, (error, rows) => {
    if (error) {
      response.status(500);
      console.error(error);
      response.json({
        ok:false,
        results: "Error",
      })
    } else {
        response.json({
        ok:true,
        results: rows.map(rowToMon)
      });
    } }
  );
});

// Get a specific pokemon using its name
service.get('/pokemon/:mon', (request, response) => {
  const mon = request.params.mon.toLowerCase();
  const query = "SELECT * FROM mon WHERE name = '" + mon + "'";
  connection.query(query, (error, rows) => {
    if (error) {
      response.status(500);
      console.error(error);
      response.json({
        ok:false,
        results: "Error",
      })
    } else {
        response.json({
        ok:true,
        results: rows.map(rowToMon)
      });
    } }
  );
});

// Like a pokemon
service.patch('/pokemon/:monId/like', (request, response) => {
  const monId = parseInt(request.params.mon);
  if (monId > -1 && monId < pokemon.size) {
  pokemon[monId].likes++;
  const parameters = [
    pokemon[monId].likes,
    monId,
  ];
  const query = 'UPDATE mon SET likes = ? WHERE id = ?';
  connection.query(query, parameters, (error, result) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
      });
    }
  });
} else {
  response.status(400);
  response.json({
    ok: false,
    results: 'Pokemon not found.',
  });
}
});

/** Nickname section */

function rowToNick(row) {
  return {
    id: row.id,
    nick: row.nick,
    mon: row.mon,
    reviewed: row.reviewed == 1,
    reported: row.reported == 1,
    likes: row.likes,
  };
}

// Get all nicknames
service.get('/nick', (request, response) => {
  const query = 'SELECT * FROM nickname';
  connection.query(query, (error, rows) => {
    if (error) {
      response.status(500);
      response.json({
        ok:false,
        results: `No nicknames found.`,
      })
    } else {
      response.json({
        ok:true,
        results: rows.map(rowToNick)
      });
    }
  });
});

// Get nicknames for a specific pokemon
service.get('/nick/:mon', (request, response) => {
  const mon = request.params.mon.toLowerCase();
  const query = "SELECT * FROM nickname WHERE mon='" + mon + "'";
  connection.query(query, (error, rows) => {
    if (error) {
      response.status(500);
      console.error(error);
      response.json({
        ok:false,
        results: `No nicknames found for ${mon}`,
      })
    } else {
      var res = rows.map(rowToNick);
      if (res.length == 0) {
        response.json({
          ok:false,
          results: `No nicknames found for ${mon}`
        });
      } else {
        response.json({
        ok:true,
        results: rows.map(rowToNick)
      });
    } }
  });
});

// Get a specific nickname
service.get('/nick/:id', (request, response) => {
  const id = request.params.mon;
  const query = "SELECT * FROM nickname WHERE mon='" + id + "'";
  connection.query(query, (error, rows) => {
    if (error) {
      response.status(500);
      console.error(error);
      response.json({
        ok:false,
        results: `No nicknames found for ${id}`,
      })
    } else {
      var res = rows.map(rowToNick);
      if (res.length == 0) {
        response.json({
          ok:false,
          results: `No nicknames found for ${id}`
        });
      } else {
        response.json({
        ok:true,
        results: rows.map(rowToNick)
      });
    } }
  });
});

// Post a new nickname
service.post('/nick', (request, response) => {
  if (request.body.hasOwnProperty('id') && 
  request.body.hasOwnProperty('nick') && 
  request.body.hasOwnProperty('mon') && 
  findMon(request.body.mon)) {
    const parameters = [
      parseInt(request.body.id),
      request.body.nick,
      request.body.mon.toLowerCase(),
      0,
      0,
      0
    ];
    var query = "INSERT INTO nickname(id, nick, mon, reviewed, reported, likes) VALUES (?, ?, ?, ?, ?, ?)";
    connection.query(query, parameters, (error, result) => {
      if (error) {
        response.status(500);
        response.json({
          ok: false,
          results: error.message,
        });
      } else {
        response.json({
          ok: true,
          results: "Nickname successfully added.",
        });
      }
    });
  } else {
    response.json({
      ok: false,
      results: "Invalid input"
    });
  }
});

// Like a nickname
service.patch('/nick/:id/like', (request, response) => {
  const id = request.params.id;
  const query = "SELECT likes FROM nickname WHERE id='" + id + "'";
  connection.query(query, (error, packet) => {
    if (error || packet == null || packet[0] == null) {
      response.status(500);
      console.error(error);
      response.json({
        ok:false,
        results: `No nickname associated with ${id}`,
      })
    } else {
      var newInt = parseInt(packet[0].likes) + 1;
      const parameters = [
        newInt,
        id
      ];
      const newQuery = "UPDATE nickname SET likes = ? WHERE id = ?";
      connection.query(newQuery, parameters, (error, result) => {
        if (error) {
          response.status(500);
          response.json({
            ok: false,
            results: error.message,
          });
        } else {
          response.json({
            ok: true
          });
        }
      });
    } 
  });
});

// Report a nickname
service.patch('/nick/:id/report', (request, response) => {
  const id = request.params.id;
  parameters = [
    1,
    id
  ]
  const query = 'UPDATE nickname SET reported = ? WHERE id = ?';
  connection.query(query, parameters, (error, result) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
      });
    }
  });
});

// Remove a report from a nickname
service.patch('/nick/:id/removereport', (request, response) => {
  const id = request.params.id;
  parameters = [
    0,
    id
  ]
  const query = 'UPDATE nickname SET reported = ? WHERE id = ?';
  connection.query(query, parameters, (error, result) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
      });
    }
  });
});

// Approve a nickname
service.patch('/nick/:id/approve', (request, response) => {
  const id = request.params.id;
  parameters = [
    1,
    id
  ]
  const query = 'UPDATE nickname SET reviewed = ? WHERE id = ?';
  connection.query(query, parameters, (error, result) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
      });
    }
  });
});

// Delete a nickname
service.delete('/nick/:id', (request, response) => {
  const id = request.params.id;
  const query = "DELETE FROM nickname WHERE id = '" + id + "'";
  connection.query(query, (error, result) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
        results: "Nickname successfully deleted."
      });
    }
  });
});

/** Fun fact section */

function rowToFact(row) {
  return {
    id: row.id,
    fact: row.fact,
    mon: row.mon,
    reviewed: row.reviewed == 1,
    reported: row.reported == 1,
    likes: row.likes,
  };
}

// Get all facts
service.get('/fact', (request, response) => {
  const query = 'SELECT * FROM funfact';
  connection.query(query, (error, rows) => {
    if (error) {
      response.status(500);
      response.json({
        ok:false,
        results: `No facts found.`,
      })
    } else {
      response.json({
        ok:true,
        results: rows.map(rowToFact)
      });
    }
  });
});

// Get facts for a specific pokemon
service.get('/fact/:mon', (request, response) => {
  const mon = request.params.mon.toLowerCase();
  const query = "SELECT * FROM funfact WHERE mon='" + mon + "'";
  connection.query(query, (error, rows) => {
    if (error) {
      response.status(500);
      console.error(error);
      response.json({
        ok:false,
        results: `No facts found for ${mon}`,
      })
    } else {
      var res = rows.map(rowToFact);
      if (res.length == 0) {
        response.json({
          ok:false,
          results: `No facts found for ${mon}`
        });
      } else {
        response.json({
        ok:true,
        results: rows.map(rowToFact)
      });
    } }
  });
});

// Get a specific fact
service.get('/fact/:id', (request, response) => {
  const id = request.params.mon;
  const query = "SELECT * FROM fact WHERE mon='" + id + "'";
  connection.query(query, (error, rows) => {
    if (error) {
      response.status(500);
      console.error(error);
      response.json({
        ok:false,
        results: `No facts found for ${id}`,
      })
    } else {
      var res = rows.map(rowToFact);
      if (res.length == 0) {
        response.json({
          ok:false,
          results: `No facts found for ${id}`
        });
      } else {
        response.json({
        ok:true,
        results: rows.map(rowToFact)
      });
    } }
  });
});

// Post a new fact
service.post('/fact', (request, response) => {
  if (request.body.hasOwnProperty('id') && 
  request.body.hasOwnProperty('fact') && 
  request.body.hasOwnProperty('mon') && 
  findMon(request.body.mon)) {
    const parameters = [
      parseInt(request.body.id),
      request.body.fact,
      request.body.mon.toLowerCase(),
      0,
      0,
      0
    ];
    var query = "INSERT INTO funfact(id, fact, mon, reviewed, reported, likes) VALUES (?, ?, ?, ?, ?, ?)";
    connection.query(query, parameters, (error, result) => {
      if (error) {
        response.status(500);
        response.json({
          ok: false,
          results: error.message,
        });
      } else {
        response.json({
          ok: true,
          results: "Fact successfully added.",
        });
      }
    });
  } else {
    response.json({
      ok: false,
      results: "Invalid input"
    });
  }
});

// Like a fact
service.patch('/fact/:id/like', (request, response) => {
  const id = request.params.id;
  const query = "SELECT likes FROM funfact WHERE id='" + id + "'";
  connection.query(query, (error, packet) => {
    if (error || packet == null || packet[0] == null) {
      response.status(500);
      console.error(error);
      response.json({
        ok:false,
        results: `No fact associated with ${id}`,
      })
    } else {
      var newInt = parseInt(packet[0].likes) + 1;
      const parameters = [
        newInt,
        id
      ];
      const newQuery = "UPDATE funfact SET likes = ? WHERE id = ?";
      connection.query(newQuery, parameters, (error, result) => {
        if (error) {
          response.status(500);
          response.json({
            ok: false,
            results: error.message,
          });
        } else {
          response.json({
            ok: true
          });
        }
      });
    } 
  });
});

// Report a fact
service.patch('/fact/:id/report', (request, response) => {
  const id = request.params.id;
  parameters = [
    1,
    id
  ]
  const query = 'UPDATE funfact SET reported = ? WHERE id = ?';
  connection.query(query, parameters, (error, result) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
      });
    }
  });
});

// Remove a report from a fact
service.patch('/fact/:id/removereport', (request, response) => {
  const id = request.params.id;
  parameters = [
    0,
    id
  ]
  const query = 'UPDATE funfact SET reported = ? WHERE id = ?';
  connection.query(query, parameters, (error, result) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
      });
    }
  });
});

// Approve a fact
service.patch('/fact/:id/approve', (request, response) => {
  const id = request.params.id;
  parameters = [
    1,
    id
  ]
  const query = 'UPDATE funfact SET reviewed = ? WHERE id = ?';
  connection.query(query, parameters, (error, result) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
      });
    }
  });
});

// Delete a fact
service.delete('/fact/:id', (request, response) => {
  const id = request.params.id;
  const query = "DELETE FROM funfact WHERE id = '" + id + "'";
  connection.query(query, (error, result) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
        results: "Fact successfully deleted."
      });
    }
  });
});





/**
service.post('/pokemon/:mon/like', (request, response) => {
  var name = request.params.mon.toLowerCase();
  var result = {};
  fetch('http://apir.me:' + port + '/pokemon/' + name)
    .then(data => {
      result = data.json()[];
    });


  var search = service.get('/pokemon/' + name);
  if (!search.ok) {
    response.json({
      ok: false
    });
  } else {
    var result = search.results[0];
    result.likes++;
    const parameters = [
      parseInt(result.id),
      result.name,
      paeseInt(result.likes) + 1,
      parseInt(result.id),
    ];
    const query = 'UPDATE mon SET id = ?, name = ?, likes = ? WHERE id = ?';
    connection.query(query, parameters, (error, result) => {
      if (error) {
        response.status(404);
        response.json({
          ok: false,
          results: error.message,
        });
      } else {
        response.json({
          ok: true,
        });
      }
    });
  }
});

/**
async function getNameSpriteType(name) {
    try {
        var response = await fetch('https://pokeapi.co/api/v2/pokemon/' + name);
        var data = await response.json();
        var result = {};
        result.name = data.name;
        result.sprite = data.sprites.front_default;
        result.typeOne = data.types[0].type.name;
        result.typeTwo = NULL;
        if (data.types.length > 1) {
            result.typeTwo = data.types[1].type.name;
        }
        return result;
    } catch (err) {
        console.log(err);
        return null;
    }
}

async function getIdDescGenus(name) {
    try {
        var response = await fetch('https://pokeapi.co/api/v2/pokemon-species/' + name);
        var data = await response.json();
        var info = {};
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
        console.log(err);
        return null;
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
        var result = {};
        result.id = idDescGenus.id;
        result.name = nameSpriteType.name;
        result.typeOne = nameSpriteType.typeOne;
        result.typeTwo = nameSpriteType.typeTwo;
        result.genus = idDescGenus.genus;
        result.description = idDescGenus.description;
        console.log(result);
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