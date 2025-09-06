import { Engine } from 'noa-engine';
import * as BABYLON from "@babylonjs/core";

var associatedClass = new Map();

associatedClass.set([3,15],1);
associatedClass.set([16,30],2);
associatedClass.set([31,51],3);
associatedClass.set([52,71],4);
associatedClass.set([72,91],5);
associatedClass.set([92,111],6);
associatedClass.set([112,131],7);
associatedClass.set([132,152],8);

// (intensity value, id)
var associatedIDValue = new Map();
// (intensity, range value)
var associatedRangeValue = new Map();

for (let i = 0; i < 160; i++) {
    for (const key of associatedClass.keys()) {
        if (i >= key[0] && i <= key[1]) {
            associatedIDValue.set(i, associatedClass.get(key));
            associatedRangeValue.set(i, [key[0], key[1]]);
        }
    }
}

console.log(associatedRangeValue);

async function loadRGBMap(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, img.width, img.height).data;
                const rgbMap = [];

                // Loop over height (rows)
                for (let y = 0; y < img.height; y++) {
                    rgbMap[y] = []; // init row
                    // Loop over width (columns)
                    for (let x = 0; x < img.width; x++) {
                        const i = (y * img.width + x) * 4;
                        const r = imageData[i];
                        const g = imageData[i + 1];
                        const b = imageData[i + 2];
                        rgbMap[y][x] = [r, g, b]; // ✅ correct indexing
                    }
                }
                resolve(rgbMap);
            } catch (err) {
                reject(err);
            }
        };

        img.onerror = (err) => reject(new Error("Failed to load image: " + src));
        img.src = src;
    });
}

var pixelMap = [];

// Example usage
(async () => {
    try {
        pixelMap = await loadRGBMap("town map.png");
        //console.log("Pixel RGB map:", pixelMap);
    } catch (err) {
        console.error("Error loading RGB map:", err);
    }
})();



var noa = new Engine({
   debug: false,
   showFPS: true,
   chunkSize: 100,
})

var brownish = [0.45, 0.36, 0.22];
var greenish = [0.1, 0.8, 0.2];
var roof = [0,0,0];

noa.registry.registerMaterial('dirt', { color: brownish });
noa.registry.registerMaterial('grass', { color: greenish });
noa.registry.registerMaterial('blackRoof', { color: roof });


// block types and their material names
var dirtID = noa.registry.registerBlock(1, { material: 'dirt' });
var grassID = noa.registry.registerBlock(2, { material: 'grass' });
var roofID = noa.registry.registerBlock(3, { material: 'blackRoof' });

noa.world.on('worldDataNeeded', function (id, data, x, y, z) {

    if(y < 50 && y>=0) {
        for (var i = 0; i < data.shape[0]; i++) {
            for (var j = 0; j < data.shape[2]; j++) {
                // compute world coordinates
                const wx = i + x
                const wz = j + z

                // check bounds of heightMap
                if (
                    wx >= 0 && wx < pixelMap.length &&
                    wz >= 0 && wz < pixelMap[0].length
                )  {
                    var r = pixelMap[wx][wz][0];
                    var g = pixelMap[wx][wz][1];
                    var b = pixelMap[wx][wz][2];
                    if(r==127 && g == 127 && b==127) {
                        data.set(i,0,j,2);
                        continue;
                    }
                    if(r < 3) {
                        data.set(i,0,j,1);
                        continue;
                    }
                    var maxH = r - associatedRangeValue.get(r)[0];

                    for (var k = 0; k < 10+maxH; k++) {
                        if(k < 10) {
                            data.set(i, k - y, j, 1);
                        }
                        else {
                            data.set(i, k - y, j, 3);
                        }
                
                    }
                }

    }

    }
}
    noa.world.setChunkData(id, data); })

const playerEnt = noa.playerEntity;

// Set the player's position [x, y, z]
noa.ents.setPosition(playerEnt, [0, 50, 0]);

/*
const music = new Audio("OMORI OST - 005 By Your Side.mp3");

// Make it loop forever
music.loop = true;

document.addEventListener("click", () => {
    music.play();
});
*/

var scene = noa.rendering.getScene();

scene.clearColor = new BABYLON.Color3(0.949, 0.937, 0.239);
scene.ambientColor = new BABYLON.Color3(1,1,1);