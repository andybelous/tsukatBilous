var container = document.getElementById("container");

var renderer, scene, camera;
var mesh, transform_control;
var glasses_arr = [];

var params = {
  color1: "#FF0000",
  color2: "#008000",
  addGlasses1: function () {
    addGlasses("oculos.obj");
  },
  addGlasses2: function () {
    addGlasses("Sunglasses.obj");
  },
  clear: function () {
    removeGlasses();
  },
};

window.addEventListener("load", init);

function addGlasses(filename) {
  if (!scene.getObjectByName(filename)) var loader = new THREE.OBJLoader();
  loader.load(
    "models/" + filename,
    (object) => {
      object.scale.set(10, 10, 10);
      object.children[0].material.color.set(
        filename === "oculos.obj" ? params.color1 : params.color2
      );
      object.children[0].name = filename;
      scene.add(object);
      glasses_arr.push(object);
      transform_control.attach(object);
      scene.add(transform_control);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    (error) => {
      console.log("An error happened");
    }
  );
}

function removeGlasses() {
  glasses_arr.forEach(function (g) {
    scene.remove(g);
  });
  glasses_arr = [];
  scene.remove(transform_control);
}

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 120;
  camera.target = new THREE.Vector3();

  var orbit = new THREE.OrbitControls(camera, renderer.domElement);
  orbit.minDistance = 50;
  orbit.maxDistance = 200;

  scene.add(new THREE.AmbientLight(0x443333));

  var light = new THREE.DirectionalLight(0xffddcc, 1);
  light.position.set(1, 0.75, 0.5);
  scene.add(light);

  var light = new THREE.DirectionalLight(0xccccff, 1);
  light.position.set(-1, 0.75, -0.5);
  scene.add(light);

  loadLeePerrySmith();

  window.addEventListener("resize", onWindowResize, false);

  var gui = new dat.GUI();

  gui.add(params, "addGlasses1");
  gui.add(params, "addGlasses2");
  gui.add(params, "clear");
  var controller1 = gui.addColor(params, "color1");
  var controller2 = gui.addColor(params, "color2");
  gui.open();

  controller1.onChange(() => {
    var obj = scene.getObjectByName("oculos.obj");
    if (obj) obj.material.color.set(params.color1);
  });

  controller2.onChange(() => {
    var obj = scene.getObjectByName("Sunglasses.obj");
    if (obj) obj.material.color.set(params.color2);
  });

  transform_control = new THREE.TransformControls(camera, renderer.domElement);
  transform_control.addEventListener("change", render);
  transform_control.addEventListener("dragging-changed", function (event) {
    orbit.enabled = !event.value;
  });

  onWindowResize();
  animate();
}

function loadLeePerrySmith() {
  var textureLoader = new THREE.TextureLoader();
  var loader = new THREE.GLTFLoader();

  loader.load("models/LeePerrySmith.glb", function (gltf) {
    mesh = gltf.scene.children[0];
    mesh.material = new THREE.MeshPhongMaterial({
      specular: 0x111111,
      map: textureLoader.load("models/Map-COL.jpg"),
      specularMap: textureLoader.load("models/Map-SPEC.jpg"),
      normalMap: textureLoader.load(
        "models/Infinite-Level_02_Tangent_SmoothUV.jpg"
      ),
      shininess: 25,
    });

    scene.add(mesh);
    mesh.scale.set(10, 10, 10);
  });
}

window.addEventListener("keydown", function (event) {
  switch (event.keyCode) {
    case 87: // W
      transform_control.setMode("translate");
      break;

    case 69: // E
      transform_control.setMode("rotate");
      break;

    case 82: // R
      transform_control.setMode("scale");
      break;
  }
});

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
function render() {
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}
