import { Engine } from 'noa-engine';
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";

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
var doorMap = [];

async function init() {
    try {
        pixelMap = await loadRGBMap("town map.png");
        doorMap = await loadRGBMap("doormap.png");

        // safe to use doorMap here
    } catch (err) {
        console.error("Error loading maps:", err);
    }
}
   // wait for maps

await init();

var noa = new Engine({
    debug: false,
    showFPS: true,
    chunkSize: 100,
});

var scene = noa.rendering.getScene();

scene.clearColor = new BABYLON.Color3(0.949, 0.937, 0.239);
scene.ambientColor = new BABYLON.Color3(1,1,1);
noa.rendering.useAO = false;

setWorld(noa);

noa.registry.registerMaterial('smoothStone', {textureURL:  "../blocktextures/Smooth_Stone.png"});
noa.registry.registerMaterial('brick', { textureURL: "../blocktextures/Bricks.png"});
noa.registry.registerMaterial("plank", {textureURL: "../blocktextures/Oak_Planks.png"});
noa.registry.registerMaterial("endStone", {textureURL: "../blocktextures/End_Stone_Bricks.png"});
noa.registry.registerMaterial("deepslateBrick", {textureURL: "../blocktextures/Deepslate_Bricks.png"});
noa.registry.registerMaterial("quartz", {textureURL: "../blocktextures/Quartz_Bricks.png"});
noa.registry.registerMaterial("stoneBricks", {textureURL: "../blocktextures/Stone_Bricks.png"});
noa.registry.registerMaterial("mudBricks", {textureURL: "../blocktextures/mud_Bricks.png"});
noa.registry.registerMaterial("purpur", {textureURL: "../blocktextures/Purpur_Block.png"});
noa.registry.registerMaterial('blackRoof', { textureURL: "../blocktextures/Nether_Bricks.png"});
noa.registry.registerMaterial('grass', { textureURL: "../blocktextures/Grass_Block.png"});
noa.registry.registerMaterial('sprucebottom', { textureURL: "../blocktextures/Spruce_Door_bottom.png"});
noa.registry.registerMaterial('sprucetop', { textureURL: "../blocktextures/Spruce_Door_top.png"});

// block types and their material names
noa.registry.registerBlock(1, { material: 'plank' });
noa.registry.registerBlock(2, { material: 'brick' });
noa.registry.registerBlock(3, { material: 'endStone' });
noa.registry.registerBlock(4, { material: 'deepslateBrick' });
noa.registry.registerBlock(5, { material: 'quartz' });
noa.registry.registerBlock(6, { material: 'stoneBricks' });
noa.registry.registerBlock(7, { material: 'mudBricks' });
noa.registry.registerBlock(8, { material: 'purpur' });
noa.registry.registerBlock(9, { material: 'blackRoof' });
noa.registry.registerBlock(10, { material: 'grass' });
noa.registry.registerBlock(11, { material: 'smoothStone'});
noa.registry.registerBlock(12, { material: 'sprucebottom' });
noa.registry.registerBlock(13, { material: 'sprucetop' });

function setWorld(noa) {
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

                        var g2 = doorMap[wx][wz][1];

                        if(r==127 && g == 127 && b==127) {
                            data.set(i,0,j,11);
                            continue;
                        }
                        if(r < 3) {
                            data.set(i,0,j,10);
                            continue;
                        }
                        var maxH = r - associatedRangeValue.get(r)[0];

                        for (var k = 0; k < 10+maxH; k++) {
                            if(k < 10) {
                                data.set(i, k - y, j, associatedIDValue.get(r));
                            }
                            else {
                                data.set(i, k - y, j, 9);
                            }
                    
                        }
                        if(g2 == 255) {
                            data.set(i,1,j,12);
                            data.set(i,2,j,13);
                            continue;
                        }
                    }

        }

        }
    }
        noa.world.setChunkData(id, data); })
}

const playerEnt = noa.playerEntity;

var done = false;
var allMeshes = null;
while(done === false) {
    var result = await SceneLoader.ImportMeshAsync(
    "",                 // empty string = load all meshes
    "/models/",          // folder path
    "generic felari.obj",      // your obj filename
    noa.rendering.getScene()
);
    allMeshes = result.meshes;
    if(allMeshes != null) {
        done = true;
    }
}

// Set the player's position [x, y, z]
noa.ents.setPosition(playerEnt, [70, 50, 10]);

var customMesh = BABYLON.Mesh.MergeMeshes(allMeshes, true, true, undefined, false, true);   // root mesh

customMesh.rotationQuaternion = null;  // allow Euler rotations
customMesh.scaling.setAll(1); 
customMesh.bakeCurrentTransformIntoVertices();
customMesh.position.set(0, 0, 0); 

const npcLight = new BABYLON.PointLight(
    "npcLight",
    new BABYLON.Vector3(3, 3, 3), // position near your NPC
    scene
);
npcLight.intensity = 1;
npcLight.range = 10;
npcLight.parent = customMesh;

var id = noa.entities.add(
        [75,1,30], 0.6, 1.8, // required
        customMesh, [0,0,0], false, true// optional
    );

    /*
const music = new Audio("OMORI OST - 005 By Your Side.mp3");

// Make it loop forever
music.loop = true;

document.addEventListener("click", () => {
    music.play();
});
*/