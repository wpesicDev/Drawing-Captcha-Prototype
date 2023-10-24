const express = require('express');
const { promises: fsPromises } = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;
const crypto = require("crypto")
const fs = require("fs");
const path = require("path");
const session = require("express-session")
const uuid = require('uuid');
// const { Console } = require('console');


const newForm = new Map()

const sessionClient = new Map()

app.use(session({ secret: crypto.randomUUID(), resave: true, saveUninitialized: true }))

app.use(bodyParser.json());
app.use(cors({ credentials: true }))

app.use('/tmpimg', express.static('tmpimg'));

let pool;

async function initializePool() {
    try {
        const contents = await fsPromises.readFile("./src/pool.txt", 'utf-8');
        pool = JSON.parse(contents);
    } catch (err) {
        console.log(err);
        pool = [];
    }
}


initializePool().then(() => {
    console.log("pool initialized")
});


//achtung die Restapi's sind redundant und können durchaus in 1-2 verfasst werden

//Min of expected Fields is 40% / Max of selected Fields is 60% 
app.post('/checkCubes', (req, res) => {
    const selectedFields = req.body.selectedIds;
    const selectedId = req.body.clientData.ID;

    let client = sessionClient.get(selectedId);

    if (client) {
        const expectedFieldsMinTolerance = Math.ceil(Number(client.minToleranceOfPool) * client.expectedFields.length);
        const selectedFieldsMaxTolerance = Math.ceil(Number(client.maxToleranceOfPool) * client.expectedFields.length);

        const successfullySelectedFields = selectedFields.filter(selectedField => client.expectedFields.includes(selectedField)).length;

        const isValid = successfullySelectedFields >= expectedFieldsMinTolerance && selectedFields.length <= selectedFieldsMaxTolerance;

        console.log({
            isValid,
            expectedFields: client.expectedFields,
            successfullySelectedFields,
            expectedFieldsMinTolerance,
            selectedFieldsLength: selectedFields.length,
            selectedFieldsMaxTolerance
        });

        res.json({ isValid });
    } else {
        res.status(400).json({ error: 'Client-Daten nicht gefunden' });
    }

    sessionClient.delete(selectedId);
});



app.post('/information', (req, res) => {
    const canvasinfo = req.body.canvasinfo;
    const isSuccessfull = canvasinfo ? true : false;

    console.log("isSuccesfull:", isSuccessfull)

    res.json({ isSuccessfull });
});

app.get('/getImage', (req, res) => {

    initializePool()

    deleteAllFilesInDir("./tmpimg").then(() => {
        console.log("Removed all files from tmpimg");
    });
    try {
        const sessionId = req.sessionID;

        if (!pool || pool.length === 0) {
            console.error("Pool is empty or not initialized.");
            return res.status(500).json({ error: 'Pool is empty or not initialized.' });
        }

        const randomIndex = Math.floor(Math.random() * pool.length);
        const selectedContent = pool[randomIndex];

        sessionClient.set(sessionId, {
            ID: selectedContent.ID,
            imgURL: selectedContent.URL,
            Name: selectedContent.Name,
            expectedFields: selectedContent.ValidateF,
            FileName: selectedContent.FileName,
            Path: selectedContent.Path,
            minToleranceOfPool: selectedContent.MinTolerance,
            maxToleranceOfPool: selectedContent.MaxTolerance,
        });

        let client = sessionClient.get(sessionId);
        console.log(client)

        req.session.clientSpecificData = {
            ID: sessionId,
        };

        clientData = req.session.clientSpecificData;

        let uniqueFileName;
        let savePath;

        if (client.imgURL) {
            const imageBase64 = client.imgURL;
            // sehr wichtig ansonsten kann das nicht gelesen werden ich muess das ganze replacen mit dem wird der anfangsteil entfernt
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
            const imageBuffer = Buffer.from(base64Data, 'base64');
            uniqueFileName = generateUniqueName(`${uuid.v4()}.png`);

            savePath = `./tmpimg/${uniqueFileName}`;

            fs.writeFile(savePath, imageBuffer, (err) => {
                if (err) {
                    console.error(`Fehler beim Speichern der Datei: ${err}`);
                    return res.status(500).json({ error: 'Fehler beim Speichern der Datei.' });
                } else {
                    console.log(`Datei erfolgreich gespeichert unter: ${savePath}`);
                }
            });
        } else {
            console.error("client.imgURL is undefined");
            return res.status(500).json({ error: 'client.imgURL is undefined.' });
        }

        const finishedURL = `http://localhost:3000/tmpimg/${uniqueFileName}`;

        res.json({ finishedURL, clientData });


    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Fehler bei der Serveranfrage.' });
    }


});



app.post('/newValidation', (req, res) => {
    const ID = crypto.randomUUID()
    const validateTrueCubes = req.body.validateTrueCubes;
    const validateMinCubes = req.body.validateMinCubes;
    const validateMaxCubes = req.body.validateMaxCubes;
    const componentName = req.body.componentName;
    const backgroundImage = req.body.backgroundImage;

    let isValid;

    if (validateTrueCubes && validateMinCubes && validateMaxCubes && componentName) {
        isValid = true;

        const MaxTolerance = (validateMaxCubes.length * 1) / validateTrueCubes.length;
        const MinTolerance = (validateMinCubes.length * 1) / validateTrueCubes.length;

        initializePool();

        fs.readFile('./src/pool.txt', 'utf-8', (err, data) => {
            if (err) {
                console.error('Fehler beim Lesen von pool.txt:', err);
            } else {
                // let tmpPool = JSON.parse(data);
                let tmpPool = [
                    {
                        "ID": ID,
                        "Name": componentName,
                        "URL": backgroundImage,
                        "MaxTolerance": MaxTolerance,
                        "MinTolerance": MinTolerance,
                        "ValidateF": validateTrueCubes,
                        "validateMinCubes": validateMinCubes,
                        "validateMaxCubes": validateMaxCubes

                    }

                ]

                if (pool) {
                    //Hier findet das Mergen der beiden Arrays statt
                    tmpPool = tmpPool.concat(pool);
                }

                console.log("Pool:", tmpPool);

                const jsonContent = JSON.stringify(tmpPool, null, 2);
                fs.writeFile('./src/pool.txt', jsonContent, 'utf-8', (err) => {
                    if (err) {
                        console.error('Fehler beim Speichern der JSON-Datei:', err);
                    } else {
                        console.log('Daten wurden zu pool.txt hinzugefügt.');
                    }
                });
            }
        });
    } else {
        console.log("Fehler beim Abrufen der Daten vom Client");
        isValid = false;
    }

    res.json({ isValid });
});


async function deleteAllFilesInDir(dirPath) {
    try {
        const files = await fs.promises.readdir(dirPath);

        const deleteFilePromises = files.map(async (file) => {
            const filePath = path.join(dirPath, file);
            await fs.promises.unlink(filePath);
        });

        await Promise.all(deleteFilePromises);
    } catch (err) {
        console.log(err);
    }
}

app.get('/getElements', (req, res) => {
    initializePool();
    if (pool) {
        res.json({ pool });
    }
    else ("pool nicht definiert")


});

app.post('/CRUD', (req, res) => {
    initializePool();
    let deletedObject;
    let tmpPool = req.body.tmpPool
    let isGood = false
    console.log("Deleting: ", req.body.isDelete)
    let index
    console.log(tmpPool)
    if (Array.isArray(tmpPool)) {
        tmpPool.map(x => {
            index = pool.findIndex(b => b.ID === x.ID);
        });


        if (req.body.isDelete) {
            console.log("Deleting Process")
            deletedObject = pool.splice(index, 1)
            console.log("deleted object: ", deletedObject)
            console.log("current pool: ", pool)
            

        }else{

            console.log("vom pool selber: ", pool[index])

            console.log("Änderungen werden vom CRUD übernommen")
    
            pool[index].ValidateF = tmpPool[0].ValidateF
            pool[index].validateMinCubes = tmpPool[0].validateMinCubes
            pool[index].validateMaxCubes = tmpPool[0].validateMaxCubes
            pool[index].MaxTolerance = (tmpPool[0].validateMaxCubes.length * 1) / tmpPool[0].ValidateF.length;
            pool[index].MinTolerance = (tmpPool[0].validateMinCubes.length * 1) / tmpPool[0].ValidateF.length;

        }


        const jsonContent = JSON.stringify(pool, null, 2);
        fs.writeFile('./src/pool.txt', jsonContent, 'utf-8', (err) => {
            if (err) {
                console.error('Fehler beim Speichern der JSON-Datei:', err);
            } else {
                console.log('Daten wurden zu pool.txt hinzugefügt.');
            }
        });
        initializePool();

        isGood = true;
    } else {
        console.log("Problem mit dem Array")
    }




    res.json({ isGood })

})


app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
});

function generateUniqueName(FileName) {
    const timestamp = new Date().getTime();
    const randomValue = crypto.randomBytes(8).toString("hex");
    const fileExtension = FileName.split(".").pop();

    return `${timestamp}-${randomValue}.${fileExtension}`;
}


