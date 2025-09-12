import { Engine } from 'noa-engine';
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import * as GUI from '@babylonjs/gui'
import { makeCitizenMesh } from './citizen.js';
import { getRotationTowards } from './rotate.js';
import { degToRad } from './rotate.js';
import { loadRGBMap } from './loadRGB.js';

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

noa.ents.setPosition(playerEnt, [70, 1, 20]);

var Mesh = await makeCitizenMesh(noa);

//npclight

const npcLight = new BABYLON.PointLight(
    "npcLight",
    new BABYLON.Vector3(0, 3, -3), // position near your NPC
    scene
);
npcLight.intensity = 1;
npcLight.range = 20;
npcLight.parent = Mesh;


console.log(Mesh.material.disableLighting);
// testing npc
var citizen = noa.entities.add(
        [75,2,30], 0.6, 1.8, // required
        Mesh, [0,0,0], true, true// optional
    );

function aabbFromCenter(center, half) {
  return {
    base: [center[0] - half[0], center[1] - half[1], center[2] - half[2]],
    max:  [center[0] + half[0], center[1] + half[1], center[2] + half[2]],
  };
}

noa.inputs.down.on("fire", checkClicking);

function checkClicking() {
    // example: find ents within 2 units of player
    const center = noa.ents.getPosition(noa.playerEntity); // [x,y,z]
    const charPos = noa.ents.getPosition(citizen);
    const box = aabbFromCenter(center, [5, 5, 5]);

    var citizenMesh = noa.entities.getMeshData(citizen).mesh;

    // just a test for npc rotation;
    //var rotationToApply = getRotationTowards(center[0], center[2], charPos[0],charPos[2]);

    //citizenMesh.rotation.y = rotationToApply;

    // just a test for npc text;
    const hits = noa.entities.getEntitiesInAABB(box);
    /* 
    if(hits[2] != null) {
        doText();
    }
        */
}

var hadSetText = false;

var test = noa.entities.getMeshData(citizen).mesh;

test.name = "helloWorld";

console.log(test.name);

// npc text function test
function doText() {
    if(hadSetText == false) {
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI");
        var text1 = new GUI.TextBlock();
        text1.text = 'Dave: "Oh hey James, isnt it a fine day today?"';
        text1.color = "white";
        text1.fontSize = 100;
        text1.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        text1.top = 560;
        advancedTexture.addControl(text1);
        hadSetText = true;
    }
}

//skybox
var envTexture = new BABYLON.CubeTexture("../textures/skybox/skybox", scene);
var sky = scene.createDefaultSkybox(envTexture, true, 10000);
noa.rendering.addMeshToScene(sky);

noa.on("tick", update);

var t = 0;

var sequence = new Map();

const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI");
var texts = new GUI.TextBlock();
texts.color = "white";
texts.fontSize = 80;
texts.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
texts.top = 560;
advancedTexture.addControl(texts);

// seconds [text, velocity, rotation]
sequence.set(0, ["Dave: Hey James, it's your best friend dave, how ya been?", [0,0,0], 0]);
sequence.set(200, ["James (you): Having a splended day my friend.", [0,0,0], 0]);
sequence.set(400, ["Dave: Well, glad your having a great day, follow me around", [0,0,3], 180]);

var text = "";
var vel = [0,0,0];
var rotation = 0;

var meshedCitizen = noa.entities.getMeshData(citizen).mesh;
var animatedCitizen = noa.entities.getPhysicsBody(citizen);

function update(dt) {
    //console.log(dt);
    var seq = sequence.get(t);

    if(seq != null) {
        text = seq[0];
        vel = seq[1];
        console.log(vel);
        rotation = seq[2];
        meshedCitizen.rotation.y = degToRad(rotation);
    }
    t += 1;
    //console.log(t);
    if(animatedCitizen.velocity[0] <= vel[0] && animatedCitizen.velocity[2] <= vel[2]) {
        animatedCitizen.applyImpulse(vel);
    }
    texts.text = text;



}

    /*
const music = new Audio("OMORI OST - 005 By Your Side.mp3");

// Make it loop forever
music.loop = true;

document.addEventListener("click", () => {
    music.play();
});
*/