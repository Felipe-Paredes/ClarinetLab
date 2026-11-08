import { useEffect, useRef } from 'react';
import abcjs from 'abcjs';
import type { Passage } from './types';
import { passageToAbc } from './music';

export function Notation({ passage }: { passage: Passage }) {
  const target = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!target.current) return;
    abcjs.renderAbc(target.current, passageToAbc(passage), {
      responsive: 'resize', staffwidth: 780, paddingtop: 24, paddingbottom: 24,
      add_classes: true, scale: 1.1,
    });
  }, [passage]);
  return <div className="notation-scroll" tabIndex={0} role="region" aria-label={`Written B-flat clarinet music, ${passage.options.measures} measures in ${passage.options.key} major, ${passage.options.meter}/4 time`}><div className="notation" ref={target} /></div>;
}

