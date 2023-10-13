const writeContainer = document.querySelector(".container-write")
const contentContainer = document.querySelector(".container-content")
const imgChangeBtn = document.querySelector(".changeImgBtn")
const cubes = document.querySelectorAll(".cube")
const controls = document.querySelector(".controls")
const canvas = document.querySelector('.canvas')
const toDo = document.querySelector("#toDo")
const fileInput = document.querySelector("#myFileinput")
const captchaContainer = document.querySelector(".captcha-container")
let backgroundImage;
let validateTrueCubes;
let validateMinCubes;
let validateMaxCubes;
let componentName;
let URL;
const API = "http://localhost:3000/newValidation"
let result;

document.getElementById("Capture").addEventListener("submit", function (event) {
    event.preventDefault();

    componentName = document.querySelector("#Cname").value;

    writeContainer.style.display = "none"
    contentContainer.style.display = "flex"

})

function reset() {
    cube.forEach(function (cube) {
        cube.classList.remove("selected");
    });
}

let mouseIsDown = false
const cube = document.querySelectorAll(".cube")


self.addEventListener('mousedown', event => {
    mouseIsDown = true
    drawEventListener(event, true)
})
self.addEventListener('mouseup', event => (mouseIsDown = false))
let drawEventListener
canvas.addEventListener('mouseover', drawEventListener = (event, toggle = false) => {
    event.preventDefault()
    if (mouseIsDown) {
        const firstElement = event.composedPath()[0]
        if (firstElement.classList.contains("cube")) {
            firstElement.classList[toggle ? "toggle" : "add"]("selected")
        }
    }
})

fileInput.addEventListener("change", async () => {

    const reader = new FileReader();
    reader.addEventListener("load", async () => {
        const result = reader.result;

        if (result) {
            backgroundImage = result;
            console.log("Bild erfolgreich importiert");
            canvas.style.backgroundImage = `url(${result})`;
            toDo.innerHTML = "Wählen Sie nun die Felder aus, die validiert werden sollen. Malen Sie genau diese, sie werden dann als gültige Felder verwendet.";
            fileInput.style.display = "none";
            imgChangeBtn.style.display = "block"
            cubes.forEach(cube => {
                cube.classList.remove("selected")
                cube.style = "cursor: crosshair;"
            })



        }
        console.log(result);
    });

    if (fileInput.files.length > 0) {
        reader.readAsDataURL(fileInput.files[0]);
    }
});

imgChangeBtn.addEventListener("click", function () {
    toDo.innerHTML = "Laden sie Ihr Bild hoch welches sie zur validierung der Captcha Komponente verwenden möchten.";
    fileInput.style.display = "block";
    imgChangeBtn.style.display = "none"
    canvas.style.backgroundImage = "none";


    cubes.forEach(cube => {
        cube.classList.remove("selected")
    })
    updateControlsVisibility();

})

function updateControlsVisibility() {
    const canvasBackground = canvas.style.backgroundImage;
    const selectedCubeCount = document.querySelectorAll(".cube.selected").length;

    console.log("selcted cube lenght: ", selectedCubeCount)

    if (canvasBackground && selectedCubeCount > 0) {
        controls.style.display = "flex";
    } else {
        controls.style.display = "none";
    }
}

cubes.forEach(cube => {
    cube.addEventListener("mouseup", updateControlsVisibility);
});

function Continue() {
    validateTrueCubes = Array.from(document.querySelectorAll(".cube")).filter(cube => cube.classList.contains("selected")).map(cube => cube.id);

    console.log(validateTrueCubes)

    document.querySelector(".submit-button").setAttribute("onclick", "Continuemin()");

    toDo.innerHTML = "Malen sie die minimale Tolleranz aus."
    imgChangeBtn.style.display = "none"
    cubes.forEach(cube => {
        cube.classList.remove("selected")
    })
    updateControlsVisibility();

}

function Continuemin() {
    validateMinCubes = Array.from(document.querySelectorAll(".cube")).filter(cube => cube.classList.contains("selected")).map(cube => cube.id);

    document.querySelector(".submit-button").setAttribute("onclick", "Continuemax()");
    toDo.innerHTML = "Malen sie die maximale Tolleranz aus."
    cubes.forEach(cube => {
        cube.classList.remove("selected")
    })
    validateTrueCubes.forEach(cubeId => {
        var cubeElement = document.getElementById(cubeId)
        if (cubeElement) {
            cubeElement.classList.add("selected")
        }
    })


}

function Continuemax() {
    validateMaxCubes = Array.from(document.querySelectorAll(".cube")).filter(cube => cube.classList.contains("selected")).map(cube => cube.id);

    pushToServer();

}

function pushToServer() {
    fetch(API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ validateTrueCubes, validateMinCubes, validateMaxCubes, componentName, backgroundImage })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Server responded with an error status: ' + response.status);
            }
        })
        .then(data => {
            if (data.isValid) {
                canvas.style.display = "none"
                controls.style.display = "none"
                toDo.innerHTML = "Captcha Form erfolgreich hinzugefügt"

                imgChangeBtn.innerHTML = "Neues Hinzufügen"
                imgChangeBtn.setAttribute("onclick", "reset()")
                imgChangeBtn.style.display = "block"

            } 
            else {
                console.log("An error occoured while trying to fetch server")
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            alert('An error occurred while making the request. Please try again later.');
        });
}

function reset(){
    captchaContainer.style.display = "none";
    location.reload()

}