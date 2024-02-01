
const serverPull = "http://localhost:3000/getImage";
const canvas = document.querySelector(".canvas")
const body = document.querySelector("body");
let clientData = null
body.onload = initialize

async function initialize() {
    await pullImage();
    await postInfo();
}


async function pullImage() {
    try {
        const response = await fetch(serverPull);
        if (response.ok) {
            const data = await response.json();
             clientData = data.clientData;
             console.log("clientid clientside: ", clientData)
            const backgroundImageUrl = data.finishedURL;

            const background = document.querySelector(".canvas");
            try {
                background.style = `background-image: url(${backgroundImageUrl}); `;
            }
            catch {
                console.log("Error bei server aufruf von bildern")
            }



        } else {
            throw new Error('Fehler bei der Serveranfrage.');
        }
    } catch (error) {
        console.error('Fehler:', error);
        console.log('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
    }
}


async function postInfo() {
    try {
        const canvasinfo = document.querySelector(".canvas");
        const serverPost = "http://localhost:3000/information";

        const response = await fetch(serverPost, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ canvasinfo: canvasinfo.textContent }) 
        });

        if (response.ok) {
            data = await response.json();
            if (data.isSuccessfull) {
                console.log("Canvas Data successfully posted")
            }
        } else {
            throw new Error("Error beim Posten von Canvas Informationen")
        }
    } catch (error) {
        console.error("Fehler:", error)
        console.log("Es ist ein Fehler aufgetreten.")
    }
}

let mouseIsDown = false
cube = document.querySelectorAll(".cube")


self.addEventListener('mousedown', event => {
    mouseIsDown = true
    drawEventListener(event, true)
})
self.addEventListener('mouseup', event => (mouseIsDown = false))
let drawEventListener
document.querySelector('.canvas').addEventListener('mouseover', drawEventListener = (event, toggle = false) => {
    event.preventDefault()
    if (mouseIsDown) {
        const firstElement = event.composedPath()[0]
        if (firstElement.classList.contains("cube")) {
            firstElement.classList[toggle ? "toggle" : "add"]("selected")
        }
    }
})


function reset() {
    cube.forEach(function (cube) {
        cube.classList.remove("selected");
    });
}

function submit() {
    const selectedCubes = Array.from(document.querySelectorAll(".cube")).filter(cube => cube.classList.contains("selected"));
    const selectedIds = selectedCubes.map(cube => cube.id);
    const countFields = canvas.childElementCount;


    console.log("Ausgewählte Cubes", selectedIds)

    const serverPush = 'http://localhost:3000/checkCubes';

    fetch(serverPush, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selectedIds, clientData })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Fehler bei der Serveranfrage.');
            }
        })
        .then(data => {
            if (data.isValid) {
                alert("Validierung erfolgreich!");
                location.reload()
            } else {
                alert("Validierung fehlgeschlagen. Bitte überprüfen Sie Ihre Auswahl.");
                location.reload()
            }
        })
        .catch(error => {
            console.error('Fehler:', error);
            alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
        });
}

