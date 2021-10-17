const link = "https://pokeapi.co/api/v2/pokemon/";

async function fetchMon(pokemon) {
  var response = await fetch(link + pokemon);
  var data = await response.json();
  console.log(data.species.name);
  console.log(data.sprites.front_default);
  
}

fetchMon("pikachu");