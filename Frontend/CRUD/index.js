const elementList = document.querySelector(".element-list");
const serverPull = "http://localhost:3000/getElements";
const container = document.querySelector(".container")
const contentContainer = document.querySelector(".content-container")
const parentContainer = document.querySelector(".parent-container")
const wrapper = document.querySelector(".wrapper")
const canvas = document.querySelectorAll(".canvas")
const cubeTrue = document.querySelectorAll(".cube-true")
const cubeMin = document.querySelectorAll(".cube-min")
const cubeMax = document.querySelectorAll(".cube-max")
const cubeID = document.querySelectorAll("#id")
let tmpPool = [];
let pool;
var isDelete;

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
    await getPool();
}

async function getPool() {
    try {
        const response = await fetch(serverPull);
        if (response.ok) {
            const data = await response.json();
            const pool = data.pool;

            pool.forEach(elementData => {
                const elementSection = document.createElement("div");
                elementSection.classList.add("element");

                const img = document.createElement("img");
                img.src = elementData.URL;
                img.alt = elementData.Name;
                elementSection.appendChild(img);

                const info = document.createElement("div");
                info.textContent = elementData.Name;
                elementSection.appendChild(info);

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Löschen";
                deleteButton.classList.add("delete-button");
                deleteButton.addEventListener("click", () => deleteComponent(elementData))
                elementSection.appendChild(deleteButton);

                const editButton = document.createElement("button");
                editButton.textContent = "Bearbeiten";
                editButton.classList.add("edit-button");
                editButton.addEventListener("click", () => getComponent(elementData));
                elementSection.appendChild(editButton);


                elementList.appendChild(elementSection);
                console.log(pool)
            });

        } else {
            throw new Error('Fehler bei der Serveranfrage.');
        }
    } catch (error) {
        console.error('Fehler:', error);
        console.log('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
    }
}


function deleteComponent(e){
    pool = e
    tmpPool.push(pool)
    isDelete = true
    pushToServer()
}

function getComponent(e) {
    wrapper.style.display = "none"
    parentContainer.style.display = "flex"
    canvas.forEach(canvas =>
        canvas.style = `background-image: url(${e.URL});`
    )

    pool = e
    tmpPool.push(pool)
    console.log("tmpPool: ", tmpPool)
    syncCubes();

    console.log(e.Name)
}

let mouseIsDown = false
cube = document.querySelectorAll(".cube-true")


self.addEventListener('mousedown', event => {
    mouseIsDown = true
    drawEventListener(event, true)
})
self.addEventListener('mouseup', event => (mouseIsDown = false))
let drawEventListener
document.querySelectorAll('.canvas').forEach(canvas =>
    canvas.addEventListener('mouseover', drawEventListener = (event, toggle = false) => {
        event.preventDefault()
        if (mouseIsDown) {
            const firstElement = event.composedPath()[0]
            if (firstElement.classList.contains("cube")) {
                firstElement.classList[toggle ? "toggle" : "add"]("selected")
            }
        }
    }))


function resetTrue() {
    cubeTrue.forEach(function (cube) {
        cube.classList.remove("selected");
    });
}

function resetMin() {
    cubeMin.forEach(function (cube) {
        cube.classList.remove("selected");
    });
}

function resetMax() {
    cubeMax.forEach(function (cube) {
        cube.classList.remove("selected");
    });
}



function syncCubes() {

    cubeTrue.forEach(cubeElement => {
        if (pool.ValidateF.includes(cubeElement.getAttribute("id"))) {
            cubeElement.classList.add("selected");
            console.log("selected");
        }
    });

    cubeMin.forEach(cubeElement => {
        if (pool.validateMinCubes.includes(cubeElement.getAttribute("id"))) {
            cubeElement.classList.add("selected");
            console.log("selected");
        }
    });
    cubeMax.forEach(cubeElement => {
        if (pool.validateMaxCubes.includes(cubeElement.getAttribute("id"))) {
            cubeElement.classList.add("selected");
            console.log("selected");
        }
    });

    
}

function finishUpdate(){
    const validateTrueCubes = Array.from(document.querySelectorAll(".cube-true"))
    .filter(cube => cube.classList.contains("selected"))
    .map(cube => cube.getAttribute("id"));
  
  const validateMinCubes = Array.from(document.querySelectorAll(".cube-min"))
    .filter(cube => cube.classList.contains("selected"))
    .map(cube => cube.getAttribute("id"));
  
  const validateMaxCubes = Array.from(document.querySelectorAll(".cube-max"))
    .filter(cube => cube.classList.contains("selected"))
    .map(cube => cube.getAttribute("id"));
  


    tmpPool[0].ValidateF = validateTrueCubes;
    tmpPool[0].validateMinCubes = validateMinCubes;
    tmpPool[0].validateMaxCubes = validateMaxCubes;

    pushToServer()
}

function pushToServer() {

    console.log(tmpPool);

    const API = 'http://localhost:3000/CRUD'
    fetch(API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tmpPool, isDelete })
    })

    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Fehler bei der Serveranfrage.');
        }
    })
    .then(data => {
        if(data.isGood){
            alert("Änderungen Erfolgreich am CRUD durchgenommen!")
            location.replace("./")

        }
        else{
            alert("Es ist ein Fehler aufgetreten schaue die Datenverarbeitung des CRUDS im Backend an")
        }        

    })
    .catch(error => {
        console.error('Fehler:', error);
        alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
    });


}