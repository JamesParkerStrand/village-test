import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";

export async function makeCitizenMesh(noa) {

    var result = await SceneLoader.ImportMeshAsync(
            "",                 // empty string = load all meshes
            "../models/",          // folder path
            "generic felari.obj",      // your obj filename
            noa.rendering.getScene()
        );

    var result = await SceneLoader.ImportMeshAsync(
    "",                 // empty string = load all meshes
    "../models/",          // folder path
    "generic felari.obj",      // your obj filename
    noa.rendering.getScene()
        );

    var allMeshes = result.meshes;
    
    var customMesh = BABYLON.Mesh.MergeMeshes(allMeshes, true, true, undefined, false, true);   // root mesh
    customMesh.rotationQuaternion = null;  // allow Euler rotations
    customMesh.scaling.setAll(1); 
    customMesh.bakeCurrentTransformIntoVertices();
    customMesh.position.set(0, 0, 0); 
    return customMesh;
}