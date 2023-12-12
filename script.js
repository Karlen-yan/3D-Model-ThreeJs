import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const models = [
  {
    path: "access/sscene.glb",
    scaleFactor: 3,
    thumbnail: "thumbnail1.png"
  },
  {
    path: "access/chandelier.glb",
    scaleFactor: 1.5,
    thumbnail: "lamp.png"
  },
  {
    path: "access/harry_potter.glb",
    scaleFactor: 5,
    thumbnail: "person.png"
  }
];

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("myCanvas")
});

renderer.setSize(800, 600);

const clearColor = new THREE.Color(0xa3a3a3);
renderer.setClearColor(clearColor);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.autoRotate = true;
orbit.autoRotateSpeed = 5;

camera.position.set(10, 10, 10);
orbit.update();

const grid = new THREE.GridHelper(30, 30);
scene.add(grid);

const loader = new GLTFLoader();

let currentModelIndex = 0;
let modelDisplayed = false;
let modeloOriginal;

const modelImgContainer = document.querySelector(".model-img");


models.forEach((model, index) => {
  const imageElement = new Image();
  imageElement.src = model.thumbnail;
  modelImgContainer.appendChild(imageElement);

  imageElement.addEventListener("click", function() {
    cargarModelo(index);

    if (!modelDisplayed) {
      mostrarModelo();
      modelDisplayed = true;
    } else {
      ocultarModelo();
      modelDisplayed = false;
    }

    function mostrarModelo() {
      const overlay = document.createElement("div");
      overlay.classList.add("overlay");

      const modelContainer = document.createElement("div");
      modelContainer.classList.add("model-container");
      modelContainer.appendChild(renderer.domElement);

      const modelContainerItem = document.createElement("div");
      modelContainerItem.classList.add("modelContainerItem");
      modelContainer.appendChild(modelContainerItem);

      const closeButton = document.createElement("button");
      closeButton.classList.add("close-button");
      closeButton.innerHTML = "X";
      closeButton.addEventListener("click", function() {
        ocultarModelo();
        modelDisplayed = false;
      });

      modelContainer.appendChild(closeButton);
      overlay.appendChild(modelContainer);
      document.body.appendChild(overlay);

      const solidButton = document.createElement("button");
      solidButton.innerHTML = "Modo Sólido";
      solidButton.classList.add("cambiar_model-button");
      solidButton.addEventListener("click", function() {
        cambiarModoRenderizado("solido");
      });
      modelContainerItem.appendChild(solidButton);

      const wireframeButton = document.createElement("button");
      wireframeButton.innerHTML = "Modo Wireframe";
      wireframeButton.classList.add("cambiar_model-button");

      wireframeButton.addEventListener("click", function() {
        cambiarModoRenderizado("wireframe");
      });
      modelContainerItem.appendChild(wireframeButton);

      const texturedButton = document.createElement("button");
      texturedButton.innerHTML = "Modo Texturizado";
      texturedButton.classList.add("cambiar_model-button");

      texturedButton.addEventListener("click", function() {
        cambiarModoRenderizado("texturizado");
      });
      modelContainerItem.appendChild(texturedButton);
    }

    function ocultarModelo() {
      const overlay = document.querySelector(".overlay");
      if (overlay) {
        document.body.removeChild(overlay);
      }
    }

    function cambiarModoRenderizado(modo) {
      scene.traverse(child => {
        if (child.isMesh) {
          switch (modo) {
            case "solido":
              child.material.wireframe = false;
              child.material.map = null;
              child.material.needsUpdate = false;

              break;
            case "wireframe":
              child.material.wireframe = true;
              child.material.map = null;
              child.material.needsUpdate = false;

              break;
            case "texturizado":
              const textureLoader = new THREE.TextureLoader();
              textureLoader.load(
                // "desarrolladorweb.png",
                "desarrolladorweb.jpg",
                function(texture) {
                  child.material = new THREE.MeshBasicMaterial({
                    map: texture
                  });
                  child.material.needsUpdate = true;
                },
                function(xhr) {
                  console.error("Error al cargar la textura:", xhr);
                }
              );

              break;
            default:
              break;
          }
          child.material.needsUpdate = true;
        }
      });
    }
    
  });
});

let modeloActual; 

function cargarModelo(index){
  
  if (modeloActual) {
    scene.remove(modeloActual); 
  }
  
  loader.load(
    models[index].path,
    function(glb) {
      const root = glb.scene;
      modeloOriginal = root;
      const scaleFactor = models[index].scaleFactor;
      root.scale.set(scaleFactor, scaleFactor, scaleFactor);
  
      const box = new THREE.Box3().setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      

      root.position.sub(center);
      root.position.setY(root.position.y + size.y / 2);
      scene.add(root);
      modeloActual = root; 

      console.log(renderer);
  
      let isMatcap = false;
    },
    undefined,
    function(error) {
      console.error(error);
    }
  );
}



function animate() {
  renderer.render(scene, camera);
}

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

renderer.setAnimationLoop(animate);
