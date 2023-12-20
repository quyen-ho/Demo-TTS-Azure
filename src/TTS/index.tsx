import React, { useEffect } from "react";
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import HOST from './host/threeAzure';
import { createScene } from './loader/loader'


const ServiceKey = "65fca895fcad4274800ae6c90b6fdcb9";
const ServiceRegion = "eastus";
const speechInit = HOST.aws.TextToSpeechFeature.initializeForAzure(ServiceKey, ServiceRegion);

const initSpeech = async () => {
  await speechInit
}

const main = () => {

  const { scene, camera, clock } = createScene();

}

export default function TTS() {
  
  useEffect(() => {
    
    const renderFn = [];
    const speakers = new Map([
        ['Luke', undefined],
        ['Alien', undefined],
    ]);

    void initSpeech();
  }, [])
  
  return (
    <canvas id="webgl-canvas" ></canvas>
  )
}