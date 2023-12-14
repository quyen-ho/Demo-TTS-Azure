import { useEffect, useState, useRef } from "react";
import * as THREE from 'three';
import axios from "axios";
import ReactAudioPlayer from "react-audio-player";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import exampleData from "./animations/example.json";

const host = "http://localhost:3001";
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, mixer: THREE.AnimationMixer
// let morphTargetDictionary: Record<string, number> 
let morphTargetDictionary: { [key: string]: number; }

const text = `Artificial intelligence (AI) is the intelligence of machines or software, as opposed to the intelligence of humans or
 animals. It is a field of study in computer science which develops and studies intelligent machines. Such machines may be called AIs`

const callAPI = () => {
    // return axios.post(host + "/talk", { text });
    const filename = 'speech-t1x5h.mp3'
    const blendData = exampleData
     const data = {filename, blendData }
     return { data }
}

const createAnimation = (recordedData: any[], morphData: { [key: string]: number; } , bodyPart: string ) => {
  const animations: THREE.AnimationClip[] = [];

  recordedData.forEach((frameData) => {
    const time = frameData.time;
    const blendshapes = frameData.blendshapes;

    const tracks = Object.keys(blendshapes).map((blendShapeName) => {
      let value = blendshapes[blendShapeName];
      return new THREE.NumberKeyframeTrack(
        `${bodyPart}.morphTargetInfluences[${morphData[blendShapeName]}]`,
        [time],
        [value]
      );
    });

    const clip = new THREE.AnimationClip(
      `SpeechAnimation_${time}`,
      time,
      tracks
    );
    animations.push(clip);
  });
  return animations;
}



function TTS() {

    const [audioSource, setAudioSource] = useState('');
    const audioPlayer = useRef(null);

    function playerReady() {
      // @ts-ignore
      audioPlayer.current?.audioEl.current.play()
    }

    const makeSpeech = async () => {
        const response = await callAPI()
        const { blendData, filename } = response.data;
        // setAudioSource(host + filename);
        setAudioSource(filename);
        const animations = [
          // createAnimation( BlendDataBlink, morphTargetDictionary,  'Wolf3D_Head'),
          createAnimation( blendData, morphTargetDictionary,  'Wolf3D_Head'),
          // createAnimation( blendData, morphTargetDictionary,  'Wolf3D_Teeth'),
          // createAnimation( BlendDataBlink, morphTargetDictionary,  'Wolf3D_Teeth'),
          // createAnimation( BlendDataBlink, morphTargetDictionary , ' Wolf3D_Body'),
          // createAnimation( BlendDataBlink, morphTargetDictionary , ' EyeRight'),
        ]
        return animations
    }


    useEffect(() => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.5, 1);

    const canvas = document.getElementById("canvas.webgl") as HTMLCanvasElement;
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    /* Create Light */
    const mainLight = new THREE.DirectionalLight("#FFFFFF", 1);
    mainLight.position.set(0.0, 0.0, 1.0).normalize();
    const hemisphereLight = new THREE.HemisphereLight("#f6f5f5", "#080820", 1);
    scene.add(mainLight, hemisphereLight);
    const loader = new GLTFLoader();
    loader.load("/rpm-model-default.glb", (gltf) => {
        const model = gltf.scene
        mixer = new THREE.AnimationMixer(model)
        scene.add(model);
        model.traverse((node) => {
          
          if (node instanceof THREE.SkinnedMesh) {
            
            if (node.name === "Wolf3D_Head") {
              morphTargetDictionary = node.morphTargetDictionary as { [key: string]: number; }
              // node.morphTargetInfluences[67] = 1
              // node.morphTargetInfluences[68] = 1
              
            } else if (node.name === "Wolf3D_Teeth") {
              
            } else if (node.name === "Wolf3D_Head") {
              
            } else if (node.name === "EyeLeft") {
              
            }  else if (node.name === "EyeRight") {
              
              morphTargetDictionary = node.morphTargetDictionary as { [key: string]: number; }
            }
          }
        })
        makeSpeech().then((animations: THREE.AnimationClip[][]) => {
          animations.forEach(clips => {
            clips.forEach(clip => {
              let clipAction = mixer.clipAction(clip)
              clipAction.loop = THREE.LoopOnce
              // clipAction.setLoop(THREE.LoopOnce)
              clipAction.play()
            })
          })
          console.log('played');
        })
        animate();
    });

    

    const clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      mixer.update(delta);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

   
    }, [])

    

  return (
    <div>
       <canvas id="canvas.webgl" />
       <ReactAudioPlayer
        src={audioSource}
        ref={audioPlayer}
        onEnded={() => {
          setAudioSource('')
        }}
        onCanPlayThrough={playerReady}
      />
    </div>

  );
}

export default TTS;
