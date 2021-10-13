const btn = document.getElementById('run');
const input = document.getElementById('pokemon');
const leftSection = document.querySelector('.left');

const getData = async (url) => {
    try {
        let res = await fetch(url);
        let data = await res.json();

        return data;

    } catch (err) {
        console.log(err);
    }
}

const getEvolutionData = async (idArr) => {
    let evolutions = [];
    idArr.forEach(id => evolutions.push(fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`).then((response) => response.json())));

    try {
        let data = await Promise.all(evolutions);

        return data;

    } catch (err) {
        console.log(err);
    }
}

const listIndex = (obj) => {
    let indexArr = [];
    let uniq = [];
    let result = [];

    let maxLength = 4;

    for (let i = 0; i < obj.moves.length; i++) {
        indexArr.push(Math.floor(Math.random() * obj.moves.length));

        if (maxLength > obj.moves.length) maxLength = obj.moves.length;
        else maxLength = 4;

        if (uniq.length < maxLength) uniq = [...new Set(indexArr)];
        else i = obj.moves.length;

        result = [...uniq]
    }

    return result;
}

const createContentLeft = (obj) => {
    let h1Tag = document.createElement('h1');
    let h3Tag = document.createElement('h3');
    let imgTag = document.createElement('img');

    leftSection.appendChild(h1Tag);
    leftSection.appendChild(h3Tag);
    leftSection.appendChild(imgTag);

    h1Tag.innerHTML = obj.name;
    h3Tag.innerHTML = obj.id;
    imgTag.setAttribute('src', obj.sprites.front_default);

    let moveIndex = listIndex(obj);

    for (let j = 0; j < moveIndex.length; j++) {
        let pTag = document.createElement('p');
        leftSection.appendChild(pTag);
        pTag.innerHTML = obj.moves[moveIndex[j]].move.name;
    }
}

const removeContent = (parent) => {
    parent.innerHTML = '';
}

input.addEventListener('keydown', function (event) {
    if (event.keyCode == 13) btn.click();
})

const getEvolutionId = (obj) => {
    let names = [];
    let newObj = obj.chain;
    names.push(newObj.species.name);

    while (newObj.hasOwnProperty('evolves_to') && newObj.evolves_to.length > 0) {
        newObj.evolves_to.map(evolution => {
            names.push(evolution.species.name);
        })

        newObj = newObj.evolves_to[0];
    }

    return names;
}

btn.addEventListener('click', async () => {
    let id = input.value.toLowerCase();

    let pokemon = `https://pokeapi.co/api/v2/pokemon/${id}/`;
    let specie = `https://pokeapi.co/api/v2/pokemon-species/${id}/`;
    
    let pokemonData = await getData(pokemon);
    let specieData = await getData(specie);
    let evolutionData = await getData(specieData.evolution_chain.url);

    let evolutionInfo = await getEvolutionData(getEvolutionId(evolutionData));

    console.log(evolutionInfo);

    removeContent(leftSection);
    createContentLeft(pokemonData);
})