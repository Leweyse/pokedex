const btn = document.getElementById('run');
const input = document.getElementById('pokemon');
const main = document.querySelector('main');
const leftSection = document.querySelector('.left');
const rightBottomSection = document.querySelector('.bottom_right');

const getData = async (url) => {
    try {
        let res = await fetch(url);
        let data = await res.json();

        return data;

    } catch (err) {
        createError();
        setTimeout(() => {
            main.removeChild(document.querySelector('.error_container'));
        }, 3500);
    }
}

const getSpeciesData = async (nameArr) => {
    let names = [];
    nameArr.forEach(name => names.push(fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}/`).then((response) => response.json())));

    try {
        let data = await Promise.all(names);
        return data;
        
    } catch (error) {
        console.log('Missed pokemon');
    }
}

const getEvolutionData = async (idArr) => {
    let evolutions = [];
    idArr.forEach(id => evolutions.push(fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`).then((response) => response.json())));

    try {
        let data = await Promise.all(evolutions);
        return data;

    } catch (err) {
        console.log('Missed pokemon');
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
    let divTag = document.createElement('div');
    let secondDivTag = document.createElement('div');
    let h1Tag = document.createElement('h1');
    let h3Tag = document.createElement('h3');
    let imgTag = document.createElement('img');

    divTag.classList.add('top_left');
    secondDivTag.classList.add('bottom_left');

    leftSection.appendChild(divTag);
    leftSection.appendChild(secondDivTag);
    divTag.appendChild(h1Tag);
    divTag.appendChild(h3Tag);
    divTag.appendChild(imgTag);

    h1Tag.innerHTML = obj.name;
    h3Tag.innerHTML = obj.id;
    imgTag.setAttribute('src', obj.sprites.front_default);

    let moveIndex = listIndex(obj);

    for (let j = 0; j < moveIndex.length; j++) {
        let divTag = document.createElement('div');
        let pTag = document.createElement('p');
    
        divTag.appendChild(pTag);
        secondDivTag.appendChild(divTag);
        pTag.innerHTML = obj.moves[moveIndex[j]].move.name;
    }

    let columns = secondDivTag.childNodes.length;

    if (columns < 4) {
        secondDivTag.style.setProperty('--columns-l', columns);
    } else {
        secondDivTag.style.setProperty('--columns-l', columns / 2);
        secondDivTag.style.setProperty('--rows-l', columns / 2);
    }
}

const removeContent = (parent) => {
    parent.innerHTML = '';
}

const getEvolutionName = (obj) => {
    let names = [];
    let newObj = obj.chain;
    let prevObj = obj.chain;
    names.push(newObj.species.name);

    prevObj.evolves_to.map((evol, idx) => {
        while (newObj.hasOwnProperty('evolves_to') && newObj.evolves_to.length > 0) {
            newObj.evolves_to.map(evolution => {
                names.push(evolution.species.name);
            })
    
            newObj = newObj.evolves_to[0];
        }

        newObj = prevObj.evolves_to[idx + 1];
    })

    return names;
}

const getSpecieId = (nameArr) => {
    let ids = [];
    nameArr.forEach(obj => ids.push(obj.id));

    return ids;
}

const createEvolutionSection = (arr) => {
    arr.forEach(obj => {
        let divTag = document.createElement('div');
        let h1Tag = document.createElement('h1');
        let h3Tag = document.createElement('h3');
        let imgTag = document.createElement('img');

        let columns = arr.length;

        if (arr.length > 3) {
            columns = Math.ceil(arr.length / 2);
        }

        rightBottomSection.style.setProperty('--columns', columns);

        rightBottomSection.appendChild(divTag);
        divTag.appendChild(h1Tag);
        divTag.appendChild(h3Tag);
        divTag.appendChild(imgTag);

        h1Tag.innerHTML = obj.name;
        h3Tag.innerHTML = obj.id;
        imgTag.setAttribute('src', obj.sprites.front_default);
    })
}

const createError = () => {
    let divTag = document.createElement('div')
    let h1Tag = document.createElement('h1');
    let h3Tag = document.createElement('h3');
    let h4Tag = document.createElement('h4');

    divTag.classList.add('error_container');

    main.appendChild(divTag);
    divTag.appendChild(h1Tag);
    divTag.appendChild(h3Tag);
    divTag.appendChild(h4Tag);

    h1Tag.innerHTML = 'This pokemon is still a mystery';
    h4Tag.innerHTML = 'Try to find another pokemon';
}

input.addEventListener('keydown', function (event) {
    if (event.keyCode == 13) btn.click();
})

btn.addEventListener('click', async () => {
    let inputValue = input.value.toLowerCase();    
    let inputChecked = inputValue
        .trim()
        .replace(/[&\/\\#,+()$~%-.'":*?<>{}]/g, '')
        .replace(/ {2,}/g, ' ')
        .split(/[^a-zA-Z0-9]/g);
    
    let id = inputChecked.join('-');

    let pokemon = `https://pokeapi.co/api/v2/pokemon/${id}/`;
    let pokemonData = await getData(pokemon);

    let specieId = pokemonData.species.name;
    let specie = `https://pokeapi.co/api/v2/pokemon-species/${specieId}/`;
    let specieData = await getData(specie);

    let evolutionUrl = await getData(specieData.evolution_chain.url);

    let speciesData = await getSpeciesData(getEvolutionName(evolutionUrl))
    let evolutionsData = await getEvolutionData(getSpecieId(speciesData));

    removeContent(leftSection);
    removeContent(rightBottomSection);
    createContentLeft(pokemonData);
    createEvolutionSection(evolutionsData);
})