// TODO: Display animation while it's waiting for the data
// TODO: Add transition and interaction with varieties section

const btn = document.getElementById('run');
const input = document.getElementById('pokemon');
const main = document.querySelector('main');
const leftSection = document.querySelector('.left');
const rightSection = document.querySelector('.right');
const rightBottomSection = document.querySelector('.bottom_right');

const evolutionSection = document.querySelector('.bottom_right .evolutions');
const varietieSection = document.querySelector('.bottom_right .varieties')

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

const getMultiData = async (arr, endpoint) => {
    let ids = [];
    arr.forEach(id => ids.push(fetch(`https://pokeapi.co/api/v2/${endpoint}/${id}/`).then((response) => response.json())));

    try {
        let data = await Promise.all(ids);
        return data;
        
    } catch (error) {
        console.log('Missed pokemon');
    }
}

const listIndex = (obj) => {
    let result = [];
    let maxLength = 4;

    while (result.length < maxLength) {
        let num = Math.floor(Math.random() * obj.moves.length);

        if (maxLength > obj.moves.length) maxLength = obj.moves.length;
        else maxLength = 4;

        if (result.indexOf(num) === -1) result.push(num);
    } 

    return result;
}

const createContentLeft = (obj) => {
    let divTag = document.createElement('div');
    let secondDivTag = document.createElement('div');
    let articleTag = document.createElement('article');
    let h1Tag = document.createElement('h1');
    let h3Tag = document.createElement('h3');
    let imgTag = document.createElement('img');

    divTag.classList.add('top_left');
    secondDivTag.classList.add('bottom_left');

    articleTag.appendChild(h1Tag);
    articleTag.appendChild(imgTag);
    articleTag.appendChild(h3Tag);
    divTag.appendChild(articleTag)
    leftSection.appendChild(divTag);
    leftSection.appendChild(secondDivTag);

    h1Tag.innerHTML = obj.name;
    h3Tag.innerHTML = obj.id;
    imgTag.setAttribute('src', obj.sprites.front_default);

    let moveIndex = listIndex(obj);

    for (let j = 0; j < moveIndex.length; j++) {
        let divTag = document.createElement('div');
        let buttonTag = document.createElement('button');
    
        divTag.appendChild(buttonTag);
        secondDivTag.appendChild(divTag);
        buttonTag.innerHTML = obj.moves[moveIndex[j]].move.name;
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

const checkVarieties = (arr) => {
    let result = [];
    let varietieUrl = [];

    arr.forEach(obj => {
        if (obj.varieties.length > 1) {
            obj.varieties.forEach(varietie => {
                varietieUrl.push(varietie.pokemon.url);
            })
        }
    })

    varietieUrl.forEach(url => {
        let id = url.split('/').splice(6, 1)[0];
        result.push(id);
    })

    return result;
}

const createEvolutionSection = (arr, parent) => {
    arr.forEach(obj => {
        let divTag = document.createElement('div');
        let h1Tag = document.createElement('h1');
        let h3Tag = document.createElement('h3');
        let imgTag = document.createElement('img');

        let columns = arr.length;
        let rows = 1;

        if (arr.length > 3 && arr.length <= 8) {
            columns = Math.ceil(arr.length / 2);
            rows = 2;
        } else if (arr.length > 8) {
            if (window.matchMedia("(max-width: 940px)").matches) {
                columns = 4;
                rows = 3   
            } else {
                columns = Math.ceil(arr.length / 2);
                rows = 2;
            }
        }

        parent.style.setProperty('--columns', columns);
        parent.style.setProperty('--rows', rows);

        parent.appendChild(divTag);
        divTag.appendChild(h1Tag);
        divTag.appendChild(imgTag);
        divTag.appendChild(h3Tag);

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

    h1Tag.innerHTML = 'This pokemon is still a mystery.';
    h4Tag.innerHTML = 'Try to find another pokemon!';
}

const resize = () => {
    if (window.matchMedia("(max-width: 940px)").matches) rightSection.insertBefore(leftSection, rightBottomSection);
    else main.insertBefore(leftSection, rightSection);
}

resize();

window.addEventListener('resize', () => resize());

input.addEventListener('keydown', function (event) {
    if (event.code == 'Enter') btn.click();
})

btn.addEventListener('click', async () => {
    let inputValue = input.value.toLowerCase();    
    let inputChecked = inputValue
        .trim()
        .replace(/[&\/\\#,+()$~%-.'":*?<>{}]/g, '')
        .replace(/ {2,}/g, ' ')
        .split(/[^a-zA-Z0-9]/g);
    
    let id = inputChecked.join('-');

    removeContent(leftSection);
    removeContent(evolutionSection);
    removeContent(varietieSection);

    let pokemon = `https://pokeapi.co/api/v2/pokemon/${id}/`;
    let pokemonData = await getData(pokemon);

    let specieId = pokemonData.species.name;
    let specie = `https://pokeapi.co/api/v2/pokemon-species/${specieId}/`;
    let specieData = await getData(specie);

    let evolutionUrl = await getData(specieData.evolution_chain.url);

    let speciesData = await getMultiData(getEvolutionName(evolutionUrl), "pokemon-species");
    let evolutionsData = await getMultiData(getSpecieId(speciesData), "pokemon");

    let varietiesData = await getMultiData(checkVarieties(speciesData), "pokemon");

    createContentLeft(pokemonData);
    createEvolutionSection(evolutionsData, evolutionSection);
    createEvolutionSection(varietiesData, varietieSection);
})