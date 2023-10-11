const elementList = document.querySelector(".element-list");
const serverPull = "http://localhost:3000/getElements";

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

            // Erstelle für jedes Element im Pool einen eigenen Abschnitt
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
                elementSection.appendChild(deleteButton);

                const editButton = document.createElement("button");
                editButton.textContent = "Bearbeiten";
                editButton.classList.add("edit-button");
                elementSection.appendChild(editButton);

                elementList.appendChild(elementSection);
            });

        } else {
            throw new Error('Fehler bei der Serveranfrage.');
        }
    } catch (error) {
        console.error('Fehler:', error);
        console.log('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
    }
}
// ...
