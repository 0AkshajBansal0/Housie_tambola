import { RoundedBox } from "@react-three/drei";

const Stud = ({ position }) => {

  return (

    <group position={position}>

      <RoundedBox args={[5,1,5]} radius={0.35}>
        <meshStandardMaterial
          color="#555"
          metalness={0.2}
          roughness={0.4}
        />
      </RoundedBox>

      <mesh position={[0,0.7,0]}>
        <cylinderGeometry args={[0.9,0.9,0.4,32]} />
        <meshStandardMaterial color="#888"/>
      </mesh>

    </group>

  );

};

export default Stud;