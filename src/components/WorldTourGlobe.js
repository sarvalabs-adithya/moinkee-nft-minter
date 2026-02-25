"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { MOINKEE_LOCATIONS } from "@/constants/gallery";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const NIGHT_TEXTURE = "//unpkg.com/three-globe/example/img/earth-night.jpg";
const BUMP_TEXTURE = "//unpkg.com/three-globe/example/img/earth-topology.png";

export default function WorldTourGlobe({ onSelect, selected }) {
  const globeRef = useRef();
  const containerRef = useRef();
  const [hovered, setHovered] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const autoRotateTimer = useRef(null);

  const geoLocations = useMemo(
    () => MOINKEE_LOCATIONS.filter((l) => l.id !== "base"),
    []
  );

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleGlobeReady = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.enableZoom = true;
    controls.minDistance = 150;
    controls.maxDistance = 500;
    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.2 }, 0);
  }, []);

  const handlePointClick = useCallback(
    (point) => {
      const loc = MOINKEE_LOCATIONS.find((l) => l.id === point.id);
      if (!loc) return;
      onSelect?.(loc);

      const globe = globeRef.current;
      if (!globe) return;

      globe.controls().autoRotate = false;
      globe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.5 }, 1000);

      clearTimeout(autoRotateTimer.current);
      autoRotateTimer.current = setTimeout(() => {
        if (globeRef.current) {
          globeRef.current.controls().autoRotate = true;
        }
      }, 4000);

      const gallery = document.getElementById("memento-gallery");
      if (gallery) {
        setTimeout(() => {
          gallery.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 600);
      }
    },
    [onSelect]
  );

  const handlePointHover = useCallback((point) => {
    setHovered(point || null);
  }, []);

  const pointColor = useCallback(
    (d) => {
      if (d.id === hovered?.id) return "#00F0FF";
      if (d.id === selected?.id) return "#a78bfa";
      return "#d8b4fe";
    },
    [hovered, selected]
  );

  const pointAlt = useCallback(
    (d) => {
      if (d.id === hovered?.id || d.id === selected?.id) return 0.07;
      return 0.02;
    },
    [hovered, selected]
  );

  const ringColor = useCallback(
    () => (t) => `rgba(124, 58, 237, ${Math.max(0, 1 - t)})`,
    []
  );

  const tooltipLabel = useCallback(
    (d) =>
      `<div style="
        background: rgba(13,13,26,0.92);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(124,58,237,0.4);
        border-radius: 10px;
        padding: 10px 14px;
        font-family: system-ui, sans-serif;
        min-width: 140px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(124,58,237,0.2);
      ">
        <div style="font-size:13px; font-weight:600; color:#e9d5ff; margin-bottom:3px;">
          ${d.event}
        </div>
        <div style="font-size:11px; color:rgba(255,255,255,0.4); display:flex; align-items:center; gap:4px;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${d.location}
        </div>
      </div>`,
    []
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: "55vh", minHeight: 360, maxHeight: 600 }}
    >
      {/* Gradient fade at bottom so globe blends into page */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0D0D1A] to-transparent z-10 pointer-events-none" />

      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={NIGHT_TEXTURE}
          bumpImageUrl={BUMP_TEXTURE}
          showAtmosphere
          atmosphereColor="#7c3aed"
          atmosphereAltitude={0.18}
          animateIn
          onGlobeReady={handleGlobeReady}
          pointsData={geoLocations}
          pointLat="lat"
          pointLng="lng"
          pointColor={pointColor}
          pointAltitude={pointAlt}
          pointRadius={0.35}
          pointResolution={12}
          pointLabel={tooltipLabel}
          onPointClick={handlePointClick}
          onPointHover={handlePointHover}
          ringsData={geoLocations}
          ringLat="lat"
          ringLng="lng"
          ringColor={ringColor}
          ringMaxRadius={2.5}
          ringPropagationSpeed={1.2}
          ringRepeatPeriod={2500}
        />
      )}
    </div>
  );
}
