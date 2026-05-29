import { useEffect, useRef } from "react";
import * as THREE from "three";

import type { Mosaic } from "../types";

interface MosaicSceneProps {
  mosaic: Mosaic | null;
  partId: "tile-1x1" | "plate-1x1";
  theme: "light" | "dark";
}

const studPitchMm = 8;
const tileHeightMm = 3.2;
const plateHeightMm = 3.2;

export function MosaicScene({ mosaic, partId, theme }: MosaicSceneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    host.innerHTML = "";

    const width = host.clientWidth || 720;
    const height = host.clientHeight || 520;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === "dark" ? "#111827" : "#eef2f7");

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    host.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(theme === "dark" ? "#dbeafe" : "#ffffff", 1.8);
    const key = new THREE.DirectionalLight("#ffffff", 2.5);
    key.position.set(120, 180, 120);
    key.castShadow = true;
    scene.add(ambient, key);

    const group = new THREE.Group();
    scene.add(group);

    const safeMosaic = mosaic ?? createDemoMosaic();
    const brickHeight = partId === "plate-1x1" ? plateHeightMm : tileHeightMm;
    const baseThickness = 2.6;
    const totalWidthMm = safeMosaic.width * studPitchMm;
    const totalHeightMm = safeMosaic.height * studPitchMm;
    const maxDimension = Math.max(totalWidthMm, totalHeightMm);

    const baseGeometry = new THREE.BoxGeometry(totalWidthMm, baseThickness, totalHeightMm);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: theme === "dark" ? "#1f2937" : "#d8dee8",
      roughness: 0.72,
      metalness: 0.02
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -baseThickness / 2;
    base.receiveShadow = true;
    group.add(base);

    const cellsByColor = new Map<string, typeof safeMosaic.cells>();
    for (const cell of safeMosaic.cells) {
      const keyColor = cell.legoColor.hex;
      const list = cellsByColor.get(keyColor) ?? [];
      list.push(cell);
      cellsByColor.set(keyColor, list);
    }

    const brickGeometry = new THREE.BoxGeometry(studPitchMm * 0.92, brickHeight, studPitchMm * 0.92);
    const studGeometry = new THREE.CylinderGeometry(2.45, 2.45, 1.35, 24);
    const matrix = new THREE.Matrix4();
    const studMatrix = new THREE.Matrix4();

    for (const [hex, cells] of cellsByColor) {
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(hex),
        roughness: 0.5,
        metalness: 0.03
      });

      const bricks = new THREE.InstancedMesh(brickGeometry, material, cells.length);
      bricks.castShadow = true;
      bricks.receiveShadow = true;

      const studs = new THREE.InstancedMesh(studGeometry, material, cells.length);
      studs.castShadow = true;
      studs.receiveShadow = true;

      cells.forEach((cell, index) => {
        const x = cell.x * studPitchMm - totalWidthMm / 2 + studPitchMm / 2;
        const z = cell.y * studPitchMm - totalHeightMm / 2 + studPitchMm / 2;

        matrix.makeTranslation(x, brickHeight / 2, z);
        bricks.setMatrixAt(index, matrix);

        studMatrix.makeTranslation(x, brickHeight + 0.66, z);
        studs.setMatrixAt(index, studMatrix);
      });

      group.add(bricks, studs);
    }

    const floorGeometry = new THREE.PlaneGeometry(maxDimension * 1.8, maxDimension * 1.8);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: theme === "dark" ? "#0b1220" : "#e5e7eb",
      roughness: 0.9
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -baseThickness - 0.5;
    floor.receiveShadow = true;
    scene.add(floor);

    group.rotation.y = -0.35;

    camera.position.set(maxDimension * 0.65, maxDimension * 0.72, maxDimension * 0.95);
    camera.lookAt(0, 0, 0);

    let animationFrame = 0;
    const animate = () => {
      group.rotation.y += 0.0022;
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };
    animate();

    const resizeObserver = new ResizeObserver(([entry]) => {
      const nextWidth = entry.contentRect.width;
      const nextHeight = entry.contentRect.height;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    });
    resizeObserver.observe(host);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.dispose();
      brickGeometry.dispose();
      studGeometry.dispose();
      baseGeometry.dispose();
      floorGeometry.dispose();
      host.innerHTML = "";
    };
  }, [mosaic, partId, theme]);

  return <div ref={hostRef} className="mosaic-scene" aria-label="Modelo 3D em escala do mosaico" />;
}

function createDemoMosaic(): Mosaic {
  const colors = ["#05131D", "#0055BF", "#F2CD37", "#C91A09", "#FFFFFF", "#A0A5A9"];
  const cells = Array.from({ length: 32 * 32 }, (_, index) => {
    const x = index % 32;
    const y = Math.floor(index / 32);
    const color = colors[(Math.floor(x / 5) + Math.floor(y / 4)) % colors.length];

    return {
      x,
      y,
      sourceHex: color,
      legoColor: {
        id: color,
        name: "Demo",
        hex: color,
        rgb: { r: 0, g: 0, b: 0 }
      },
      colorDistance: 0
    };
  });

  return {
    width: 32,
    height: 32,
    colorLimit: colors.length,
    fidelityScore: 100,
    palette: [],
    cells
  };
}
