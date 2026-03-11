import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Text, Sparkles, Billboard } from "@react-three/drei";
import { useMemo, useRef, useEffect, useState } from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import Stud from "./Stud";
import NeonGrid from "./NeonGrid";

/* CAMERA */

const TopCamera = () => {

  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0,85,0);
    camera.lookAt(0,0,0);
  }, [camera]);

  return null;

};

/* NUMBER TILE */

const NumberTile = ({ position, number }) => {

  const ref = useRef();
  const velocity = useRef(-0.7);

  const [landed,setLanded] = useState(false);
  const [particles,setParticles] = useState(false);

  useEffect(()=>{
    ref.current.position.y = 20;
  },[]);

  useFrame(()=>{

    if(!landed){

      ref.current.position.y += velocity.current;
      velocity.current -= 0.04;

      if(ref.current.position.y <= 1.2){

        ref.current.position.y = 1.2;

        velocity.current = 0.3;

        setTimeout(()=>{
          velocity.current = 0;
          setLanded(true);
        },150);

        setParticles(true);

        setTimeout(()=>{
          setParticles(false);
        },4000);

      }

    }

  });

  return(

    <group ref={ref} position={[position[0],20,position[2]]}>

      <RoundedBox args={[4.2,1.3,4.2]} radius={0.35}>
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.85}
          roughness={0.2}
          emissive={landed ? "#FFD700" : "#000"}
          emissiveIntensity={landed ? 1.3 : 0}
        />
      </RoundedBox>

      <Billboard position={[0,1.8,0]}>
        <Text
          fontSize={3}
          color="#111"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.3}
          outlineColor="#fff"
        >
          {number}
        </Text>
      </Billboard>

      {particles && (

        <Sparkles
          count={350}
          scale={8}
          size={14}
          speed={3}
          color="#FFD700"
        />

      )}

    </group>

  );

};

/* BOARD */

const LegoBoard3D = ({ drawnNumbers }) => {

  const tronMusic = useRef(null);
  const musicStarted = useRef(false);

  useEffect(()=>{

    tronMusic.current = new Audio("/tron_grid.mp3");
    tronMusic.current.volume = 0.6;
    tronMusic.current.loop = false;

    const startMusic = () => {

      if(!musicStarted.current){

        tronMusic.current.play().catch(()=>{});
        musicStarted.current = true;

      }

      window.removeEventListener("click", startMusic);
      window.removeEventListener("keydown", startMusic);
      window.removeEventListener("touchstart", startMusic);

    };

    window.addEventListener("click", startMusic);
    window.addEventListener("keydown", startMusic);
    window.addEventListener("touchstart", startMusic);

  },[]);

  const spacing = 6.2;

  const blocks = useMemo(()=>{

    const arr=[];
    let index=1;

    for(let row=0;row<9;row++){

      for(let col=0;col<10;col++){

        arr.push({

          number:index,

          position:[
            col*spacing-(spacing*4.5),
            0,
            row*spacing-(spacing*4)
          ]

        });

        index++;

      }

    }

    return arr;

  },[]);

  return(

    <Canvas shadows camera={{ position:[0,85,0], fov:55 }}>

      <TopCamera/>

      <ambientLight intensity={1}/>

      <directionalLight
        position={[40,80,30]}
        intensity={2.5}
      />

      <spotLight
        position={[0,90,0]}
        intensity={5}
      />

      {/* NEON GRID */}

      <NeonGrid duration={29}/>

      {/* STUD GRID */}

      {blocks.map(block => (

        <Stud
          key={block.number}
          position={block.position}
        />

      ))}

      {/* NUMBER TILES */}

      {drawnNumbers.map((num,i) => {

        const block = blocks[num-1];

        return(

          <NumberTile
            key={`${num}-${i}`}
            position={block.position}
            number={num}
          />

        )

      })}

      <OrbitControls
        enableRotate={false}
        enableZoom={false}
        enablePan={false}
      />

    </Canvas>

  );

};

export default LegoBoard3D;