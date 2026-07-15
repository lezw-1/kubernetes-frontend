import { useEffect, useRef } from 'react';

const NODE_COUNT = 65;   // Total drifting nodes
const MAX_DIST  = 18;    // Max distance to draw a connecting line
const LINE_POOL = 500;   // Pre-allocated SVG line elements (enough for all possible edges)
const SPEED     = 0.03;  // Units per frame (~1.8 units/sec at 60 fps — very slow drift)

interface Node { x: number; y: number; vx: number; vy: number; }

function initNodes(): Node[] {
  return Array.from({ length: NODE_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.4 + Math.random() * 0.6) * SPEED;
    return {
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    };
  });
}

export default function Background() {
  const svgRef   = useRef<SVGSVGElement>(null);
  const nodes    = useRef<Node[]>(initNodes());
  const rafRef   = useRef<number>(0);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Pre-create a pool of <line> elements once — avoids DOM churn every frame
    const pool: SVGLineElement[] = Array.from({ length: LINE_POOL }, () => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      el.setAttribute('stroke', 'rgba(160,160,160,0.35)');
      el.setAttribute('stroke-width', '0.10');
      el.style.display = 'none';
      svg.appendChild(el);
      return el;
    });

    function tick() {
      const ns = nodes.current;

      // Advance each node, bounce off slightly-outside boundaries
      for (const n of ns) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -5 || n.x > 105) { n.vx *= -1; n.x = Math.max(-5, Math.min(105, n.x)); }
        if (n.y < -5 || n.y > 105) { n.vy *= -1; n.y = Math.max(-5, Math.min(105, n.y)); }
      }

      // Recompute edges and write directly to pre-allocated elements
      let li = 0;
      for (let i = 0; i < ns.length && li < LINE_POOL; i++) {
        for (let j = i + 1; j < ns.length && li < LINE_POOL; j++) {
          const dx = ns[i].x - ns[j].x;
          const dy = ns[i].y - ns[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            const opacity = 0.30 + (1 - d / MAX_DIST) * 0.08;
            const el = pool[li];
            el.setAttribute('x1', ns[i].x.toFixed(2));
            el.setAttribute('y1', ns[i].y.toFixed(2));
            el.setAttribute('x2', ns[j].x.toFixed(2));
            el.setAttribute('y2', ns[j].y.toFixed(2));
            el.setAttribute('stroke', `rgba(160,160,160,${opacity.toFixed(3)})`);
            el.setAttribute('stroke-width', (opacity * 0.28).toFixed(4));
            el.style.display = '';
            li++;
          }
        }
      }

      // Hide unused pool slots
      for (let k = li; k < LINE_POOL; k++) pool[k].style.display = 'none';

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      for (const el of pool) el.remove();
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          style={{ width: '100%', height: '100%' }}
          preserveAspectRatio="xMidYMid slice"
        />
      </div>
    </div>
  );
}
