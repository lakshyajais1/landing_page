const fs = require('fs');
let code = fs.readFileSync('src/neo/NeoShared.tsx', 'utf8');

const replacement = `export function useScrollProgress(ref: React.RefObject<HTMLElement>) {
  const [p, setP] = useState(0);
  const targetP = useRef(0);
  
  useEffect(() => {
    let raf;
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const wh = window.innerHeight;
      const start = wh;
      const end = -rect.height;
      const total = start - end;
      const current = start - rect.top;
      targetP.current = clamp(current / total);
    };
    
    const loop = () => {
      setP(prev => {
        const diff = targetP.current - prev;
        if (Math.abs(diff) < 0.0001) return targetP.current;
        return prev + diff * 0.08;
      });
      raf = requestAnimationFrame(loop);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();
    raf = requestAnimationFrame(loop);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
  
  return p;
}`;

code = code.replace(/export function useScrollProgress[\s\S]*?return p;\n\}/, replacement);
fs.writeFileSync('src/neo/NeoShared.tsx', code);
