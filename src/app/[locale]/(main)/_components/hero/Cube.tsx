"use client";
import { Canvas } from "@react-three/fiber";
import { PresentationControls, Float, RoundedBox } from "@react-three/drei";
import { motion } from "framer-motion";

export default function GraphoodCube() {
  return (
    <motion.div
      className="w-full h-full"
      animate={{ y: [0, -20, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        {/* 1. إضاءة خفيفة جداً فقط لإظهار التفاصيل */}
        <ambientLight intensity={0.1} />

        {/* 2. أضواء ملونة مركزة من زوايا مختلفة لخلق مزيج الألوان (Cyan/Purple/Orange) */}
        <spotLight position={[5, 5, 5]} intensity={5} color="#3b82f6" angle={0.5} />
        <spotLight position={[-5, -5, -5]} intensity={5} color="#d946ef" angle={0.5} />
        <spotLight position={[0, 5, -5]} intensity={3} color="#f59e0b" angle={0.5} />

        <PresentationControls
          global
          rotation={[0.4, 0.85, 0.35]}
          polar={[-0.3, 0.3]}
          azimuth={[-0.3, 0.3]}
          snap={true}
        >
          {/* 3. حركة طفو ناعمة باستخدام Float من Drei بدل Framer Motion للثبات */}
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <RoundedBox args={[2.2, 2.2, 2.2]} radius={0.15} smoothness={16}>
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.05}
                metalness={0.1}
                transmission={0.99} // شفافية عالية
                thickness={1.5}
                clearcoat={1}
                clearcoatRoughness={0.05}
                ior={1.4} // معامل انكسار الزجاج
              />
            </RoundedBox>
          </Float>
        </PresentationControls>
      </Canvas>
    </motion.div>

  );
}