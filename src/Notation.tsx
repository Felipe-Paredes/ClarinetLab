import { useEffect, useRef, useState } from 'react';
import abcjs from 'abcjs';
import type { Passage } from './types';
import { passageToAbc } from './notationAbc';

export function Notation({ passage }: { passage: Passage }) {
  const target = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(entries => setNarrow(entries[0].contentRect.width < 650));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!target.current) return;
    // Keep one complete musical stream so ties, slurs and hairpins remain intact
    // across systems. Fewer bars per system preserve readability on phones.
    const dense = passage.bars.some(bar => bar.length > 10);
    abcjs.renderAbc(target.current, passageToAbc(passage, dense ? (narrow ? 1 : 2) : (narrow ? 2 : 4)), {
      responsive: 'resize', staffwidth: narrow ? 520 : 780, paddingtop: 24, paddingbottom: 24,
      add_classes: true, scale: 1.1,
    });
  }, [passage, narrow]);
  return <div ref={container} className="notation-scroll" tabIndex={0} role="region" aria-label={'Written B-flat clarinet music, ' + passage.options.measures + ' measures in ' + passage.options.key + ' major, ' + passage.options.meter + '/4 time'}><div className="notation" ref={target} /></div>;
}

