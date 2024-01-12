import React, { useEffect, useState } from "react";
import { createScene, loadCharacter } from "./loader/loader";
import { createHost } from "./helpers";
import HOST from "./host/threeAzure";
import HostObject from "./host/threeAzure/HostObject";

const renderFn: any[] = [];

const characterFile1 = "./assets/glTF/characters/adult_male/luke/luke.gltf";
const animationPath1 = "./assets/glTF/animations/adult_male";
const animationFiles = [
  "stand_idle.glb",
  "lipsync.glb",
  "gesture.glb",
  "emote.glb",
  "face_idle.glb",
  "blink.glb",
  "poi.glb",
];
const gestureConfigFile = "gesture.json";
const poiConfigFile = "poi.json";
const lookJoint1 = "charjx_c_look";
const audioAttachJoint1 = "chardef_c_neckB";
const voice1 = { regionCode: "en-us", name: "en-US-ChristopherNeural" };
const voiceEngine = "neural";

let host: HostObject;

const ServiceKey = "ff4e89548fcc4e2283aafd31cecb50d0";
const ServiceRegion = "eastus";

export default function TTS() {
  const [loading, setLoading] = useState(true);

  const main = async () => {
    const initSpeech = async () => {
      await HOST.aws.TextToSpeechFeature.initializeForAzure(
        ServiceKey,
        ServiceRegion
      );
    };

    const { scene, camera, clock } = createScene(renderFn);

    const {
      character: character1,
      clips: clips1,
      bindPoseOffset: bindPoseOffset1,
    } = await loadCharacter(
      scene,
      characterFile1,
      animationPath1,
      animationFiles
    );

    const audioAttach1 = character1.getObjectByName(audioAttachJoint1);
    const lookTracker1 = character1.getObjectByName(lookJoint1);

    const gestureConfig1 = await fetch(
      `${animationPath1}/${gestureConfigFile}`
    ).then((response) => response.json());

    const poiConfig1 = await fetch(`${animationPath1}/${poiConfigFile}`).then(
      (response) => response.json()
    );

    const [
      idleClips1,
      lipsyncClips1,
      gestureClips1,
      emoteClips1,
      faceClips1,
      blinkClips1,
      poiClips1,
    ] = clips1;

    host = createHost({
      renderFn,
      character: character1,
      audioAttachJoint: audioAttach1,
      voice: voice1,
      engine: voiceEngine,
      idleClip: idleClips1[0],
      faceIdleClip: faceClips1[0],
      lipsyncClips: lipsyncClips1,
      gestureClips: gestureClips1,
      gestureConfig: gestureConfig1,
      emoteClips: emoteClips1,
      blinkClips: blinkClips1,
      poiClips: poiClips1,
      poiConfig: poiConfig1,
      lookJoint: lookTracker1,
      bindPoseOffset: bindPoseOffset1,
      clock,
      camera,
      scene,
    });

    await initSpeech().then(() => {
      setLoading(false);
    });
  };

  const playAudio = () => {
    const textArea = document.getElementById(
      "text-input"
    ) as HTMLTextAreaElement;
    const speechInput = textArea.value || "";
    // @ts-ignore
    host.TextToSpeechFeature.play(speechInput);
  };

  useEffect(() => {
    void main();
  }, []);

  const defaultText = `The PsyAvatarVoice JS is a virtual assistant designed to integrate with websites. 
  It utilizes a dialog box display with a 3D avatar model that can realistically respond and move like a real assistant.`;

  return (
    <>
      <div style={{ position: "relative" }}>
        <canvas
          id="webgl-canvas"
          style={{ position: "absolute", top: 0, left: 0 }}
        ></canvas>
        <div style={{ position: "absolute", display: "block" }}>
          <textarea
            id="text-input"
            style={{
              background: "transparent",
              color: "#fff",
              width: "300px",
              height: "400px",
              margin: "10px",
              border: "2px solid #fff",
              display: "block",
            }}
            name="w3review"
            rows={4}
            cols={20}
            defaultValue={defaultText}
          ></textarea>
          <button
            id="play"
            onClick={playAudio}
            style={{ width: "100px", height: "30px", marginLeft: "100px" }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Start"}
          </button>
        </div>
      </div>
    </>
  );
}
