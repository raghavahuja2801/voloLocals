import React, { useRef, useEffect, useState } from 'react';

const Carousel = () => {
  const containerRef = useRef(null);
  const [items, setItems] = useState([]);


  // Fetch services from backend
  useEffect(() => {
    fetch('http://localhost:3000/api/services')
      .then((res) => res.json())
      .then((data) => setItems(data.services || []))
      .catch((err) => {
        console.error('Failed to fetch services:', err);
        setItems([]);
      });
  }, []);

  // Smooth, slow, infinite auto-scroll effect (right to left, like a news ticker)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || items.length === 0) return;

    // Start at the leftmost position
    el.scrollLeft = 0;

    let animationFrame;
    const speed = 0.75; // px per frame

    const scrollStep = () => {
      if (!el) return;
      el.scrollLeft += speed;
      // Loop back to start seamlessly
      // Use modulo for perfect infinite loop
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = el.scrollLeft % (el.scrollWidth / 2);
      }
      animationFrame = requestAnimationFrame(scrollStep);
    };

    animationFrame = requestAnimationFrame(scrollStep);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [items]);


  // Duplicate items for seamless loop
  const displayItems = [...items, ...items];

  return (
    <div className="relative w-full mx-auto">
      {/* Cards container */}
      <div
        ref={containerRef}
        className="flex space-x-6 no-scrollbar py-6 px-4 transition-all duration-500"
        style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', width: '100vw', minWidth: '100vw' }}
      >
        {displayItems.map((svc, idx) => (
          <div
            key={svc + '-' + idx}
            className="w-80 h-56 flex-shrink-0 rounded-2xl overflow-hidden relative shadow-lg bg-gradient-to-br from-blue-100 to-blue-50 hover:scale-105 transition-transform duration-300"
          >
            <img
              src={`/src/assets/services/${svc}.jpg`}
              alt={svc}
              className="w-full h-full object-cover opacity-90 hover:opacity-100 transition"
            />
            {/* Service name overlay */}
            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-xl font-bold shadow">
              {svc.charAt(0).toUpperCase() + svc.slice(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
