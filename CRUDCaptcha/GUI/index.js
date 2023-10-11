
document.getElementById("Capture").addEventListener("submit", function(event) {


    event.preventDefault(); 

    const componentName = document.querySelector("#Cname").value;
    const URL = document.querySelector("#URL").value;
    const Path = document.querySelector("#Path").value;

    const API = 'http://localhost:3000/newForm'

    fetch(API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ componentName, URL, Path })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
                if (componentName && URL && Path) {
                    console.log(componentName, URL, Path);
                    location.replace("http://localhost:5000/GUI/Capture/index.html");
                } else {
                    console.error();("Properties could not be defined");
                }
            } else {
                throw new Error('Fehler bei der Serveranfrage.');
            }

        })
    
        .catch(error => {
            console.error('Fehler:', error);
            alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
        });


    });
    






