const fs = require('fs');
const https = require('https');

const patch_url = "https://ddragon.leagueoflegends.com/api/versions.json";
const champion_url = "https://ddragon.leagueoflegends.com/cdn/15.1.1/data/en_US/champion/";

async function update() {
    const patches = await call(patch_url);
    const current_patch = patches[0];
    const data_url = `https://ddragon.leagueoflegends.com/cdn/${current_patch}/data/en_US/champion.json`;
    const image_url = `https://ddragon.leagueoflegends.com/cdn/15.1.1/img/spell/`;
    const image_path = `./spell_icons/`;

    const champion_data = await call(data_url);

    var spell_set = [];

    for (const champion in champion_data["data"]) {
        console.log(`Processing ${champion}`);
        
        let data = await call(champion_url + `${champion}.json`);
        let spells = data["data"][champion]["spells"];

        for (let i = 0; i < 4; i++) {

            // aphelios has no E ability
            if (champion == "Aphelios") {
                if (i == 2) {
                    continue;
                }
            }

            let champion_name = data["data"][champion]["name"];
            let spell = spells[i];
            let spell_name = spell["name"];
            let cooldown = spell["cooldown"][0];
            let image = spell["image"]["full"];

            spell_set.push(
                {
                    "champion": champion_name,
                    "spell_name": spell_name,
                    "cooldown": cooldown,
                    "image": image,
                    "position": i
                }
            )

            

            //await downloadImage(image_url + image, image_path + image);
        }
        
    }

    arrayToFile(spell_set);

}

async function call(url) {
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error:', error);
        throw error;
    }
    
}

function arrayToFile(array) {
    let jsonString = JSON.stringify(array, (key, value) => {
        if (value && typeof value === 'object' && value.champion) {
            return { 
                champion: value.champion, 
                spell_name: value.spell_name,
                cooldown: value.cooldown, 
                image: value.image,
                position: value.position
            };
        }
        return value;
    }, 4); // pretty print with 2 spaces
    
    fs.writeFile('spellData.json', jsonString, (err) => {
        if (err) {
            console.error('Error writing to file', err);
        }
    });
}

async function downloadImage(url, filepath) {
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
        if (response.statusCode === 200) {
            response.pipe(file);

            file.on('finish', () => {
                file.close(); 
            });
        } else {
            console.log(`Failed to download image. Status code: ${response.statusCode}`);
            file.close();
            fs.unlink(filepath, () => {});
        }
    }).on('error', (err) => {
        console.error(`Error downloading image: ${err.message}`);
        file.close();
        fs.unlink(filepath, () => {});
    });
}

update();