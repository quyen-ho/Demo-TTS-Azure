import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const renderFn: any[] = [];

// Set up base scene
export const createScene = () => {
    // Base scene
    const scene = new THREE.Scene();
    const clock = new THREE.Clock();
    scene.background = new THREE.Color(0x33334d);
    scene.fog = new THREE.Fog(0x33334d, 0, 10);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0x33334d);
    renderer.domElement.id = 'renderCanvas';
    document.body.appendChild(renderer.domElement);

    // Env map
    new THREE.TextureLoader()
        .setPath('assets/')
        .load('images/machine_shop.jpg', hdrEquirect => {
            const hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(
                hdrEquirect
            );
            hdrEquirect.dispose();
            pmremGenerator.dispose();

            scene.environment = hdrCubeRenderTarget.texture;
        });

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // Camera
    const camera = new THREE.PerspectiveCamera(
        THREE.MathUtils.radToDeg(0.8),
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 1.4, 3.1);
    controls.target = new THREE.Vector3(0, 0.8, 0);
    controls.screenSpacePanning = true;
    controls.update();

    // Handle window resize
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize, false);

    // Render loop
    function render() {
        requestAnimationFrame(render);
        controls.update();

        renderFn.forEach(fn => {
            fn();
        });

        renderer.render(scene, camera);
    }

    render();

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.6);
    hemiLight.position.set(0, 1, 0);
    hemiLight.intensity = 0.6;
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(0, 5, 5);

    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.top = 2.5;
    dirLight.shadow.camera.bottom = -2.5;
    dirLight.shadow.camera.left = -2.5;
    dirLight.shadow.camera.right = 2.5;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);

    const dirLightTarget = new THREE.Object3D();
    dirLight.add(dirLightTarget);
    dirLightTarget.position.set(0, -0.5, -1.0);
    dirLight.target = dirLightTarget;

    // Environment
    // const groundMat = new THREE.MeshStandardMaterial({
    //     color: 0x808080,
    //     depthWrite: false,
    // });
    // groundMat.metalness = 0;
    // groundMat.refractionRatio = 0;
    // const ground = new THREE.Mesh(
    //     new THREE.PlaneBufferGeometry(100, 100),
    //     groundMat
    // );
    // ground.rotation.x = -Math.PI / 2;
    // ground.receiveShadow = true;
    // scene.add(ground);

    return { scene, camera, clock };
}