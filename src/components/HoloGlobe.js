"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { MOINKEE_LOCATIONS } from "@/constants/gallery";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const NIGHT_TEXTURE = "//unpkg.com/three-globe/example/img/earth-night.jpg";

export default function HoloGlobe({ onHover, onSelect, activeRegion }) {
  const globeRef = useRef();
  const containerRef = useRef();
  const [dims, setDims] = useState({ w: 0, h: 0 });

  const onHoverRef = useRef(onHover);
  const onSelectRef = useRef(onSelect);
  useEffect(() => { onHoverRef.current = onHover; }, [onHover]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  const geoLocations = useMemo(() => {
    const all = MOINKEE_LOCATIONS.filter((l) => l.id !== "base");
    if (!activeRegion || activeRegion === "All") return all;
    return all.filter((l) => l.region === activeRegion);
  }, [activeRegion]);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDims({
          w: containerRef.current.offsetWidth,
          h: containerRef.current.offsetHeight,
        });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleGlobeReady = useCallback(() => {
    const g = globeRef.current;
    if (!g) return;
    const c = g.controls();
    c.autoRotate = true;
    c.autoRotateSpeed = 0.35;
    c.enableZoom = true;
    c.minDistance = 120;
    c.maxDistance = 450;
    g.pointOfView({ lat: 18, lng: 10, altitude: 2.2 }, 0);
  }, []);

  const handleGlobeClick = useCallback(() => {
    onHoverRef.current?.(null);
  }, []);

  const htmlElement = useCallback((d) => {
    const el = document.createElement("div");
    el.className = "holo-marker";
    el.innerHTML = [
      '<div class="holo-marker-ring"></div>',
      '<div class="holo-marker-core"></div>',
      '<div class="holo-marker-wave"></div>',
    ].join("");
    el.style.pointerEvents = "auto";
    el.style.cursor = "pointer";

    el.addEventListener("mouseenter", () => {
      el.classList.add("holo-marker-active");
      onHoverRef.current?.(d);
      const g = globeRef.current;
      if (g) g.controls().autoRotate = false;
    });
    el.addEventListener("mouseleave", () => {
      el.classList.remove("holo-marker-active");
      onHoverRef.current?.(null);
      const g = globeRef.current;
      if (g) g.controls().autoRotate = true;
    });
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      onSelectRef.current?.(d);
      const g = globeRef.current;
      if (g) {
        g.controls().autoRotate = false;
        g.pointOfView({ lat: d.lat, lng: d.lng, altitude: 1.6 }, 1000);
        setTimeout(() => {
          if (globeRef.current) globeRef.current.controls().autoRotate = true;
        }, 4000);
      }
    });
    return el;
  }, []);

  const ringColor = useCallback(
    () => (t) => `rgba(0, 247, 255, ${Math.max(0, 0.3 - t * 0.3)})`,
    []
  );

  return (
    <div ref={containerRef} className="fixed inset-0 z-0">
      {dims.w > 0 && (
        <Globe
          ref={globeRef}
          width={dims.w}
          height={dims.h}
          backgroundColor="#000000"
          globeImageUrl={NIGHT_TEXTURE}
          showAtmosphere
          atmosphereColor="#5b2dc9"
          atmosphereAltitude={0.25}
          showGraticules
          animateIn
          onGlobeReady={handleGlobeReady}
          onGlobeClick={handleGlobeClick}
          htmlElementsData={geoLocations}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0.01}
          htmlElement={htmlElement}
          htmlTransitionDuration={800}
          ringsData={geoLocations}
          ringLat="lat"
          ringLng="lng"
          ringColor={ringColor}
          ringMaxRadius={3}
          ringPropagationSpeed={1}
          ringRepeatPeriod={3000}
        />
      )}
    </div>
  );
}
