import { useEffect, useMemo, useRef, useState } from 'react';
import { ClarinetPlayer } from './audio';
import { generatePassage, seededRandom } from './music';
import { DEFAULT_OPTIONS, type ExerciseOptions } from './types';
import { Notation } from './Notation';
import './styles.css';

type PlayerState = 'idle' | 'loading' | 'playing' | 'paused';
const keyLabel = (key: string) => key.replace('b', '♭').replace('#', '♯');
const difficultyHint = { beginner: 'Stepwise melodies, clear beats and room to breathe.', intermediate: 'Dotted rhythms, eighth notes and melodic variation.', advanced: 'Sixteenths, syncopation and wider register movement.', expert: 'Dense rhythmic motifs, large leaps and extended register changes.' };

export default function App() {
  const [options, setOptions] = useState<ExerciseOptions>(DEFAULT_OPTIONS);
  const [seed, setSeed] = useState(1729);
  const [passage, setPassage] = useState(() => generatePassage(DEFAULT_OPTIONS, seededRandom(1729)));
  const [activeSeed, setActiveSeed] = useState(1729);
  const [status, setStatus] = useState<PlayerState>('idle');
  const [transportBusy, setTransportBusy] = useState(false);
  const [metronome, setMetronome] = useState(false);
  const [error, setError] = useState('');
  const player = useRef<ClarinetPlayer | null>(null);
  const request = useRef(0);
  useEffect(() => () => { request.current++; void player.current?.dispose(); }, []);
  function stop() { request.current++; player.current?.stop(); setStatus('idle'); setTransportBusy(false); }
  function generate(nextSeed = seed) {
    stop();
    try {
      setPassage(generatePassage(options, seededRandom(nextSeed)));
      setSeed(nextSeed); setActiveSeed(nextSeed); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not generate this exercise.'); }
  }
  async function play() {
    const id = ++request.current;
    setError(''); setStatus('loading');
    try {
      if (!player.current) player.current = new ClarinetPlayer();
      await player.current.play(passage, options.tempo, metronome, () => {
        if (request.current === id) { request.current++; setStatus('idle'); setTransportBusy(false); }
      }, failure => {
        if (request.current === id) { stop(); setError(failure.message); }
      });
      if (request.current === id) setStatus('playing');
    } catch (e) {
      if (request.current === id) {
        setStatus('idle'); setError(e instanceof Error ? e.message : 'Audio could not load. Check your connection and try again.');
      }
    }
  }
  async function changeTransport(action: 'pause' | 'resume') {
    const id = request.current;
    setTransportBusy(true);
    try {
      await player.current?.[action]();
      if (request.current === id) setStatus(action === 'pause' ? 'paused' : 'playing');
    } catch {
      if (request.current === id) {
        stop();
        setError('Playback could not ' + action + '. Please press Listen to retry.');
      }
    } finally {
      if (request.current === id) setTransportBusy(false);
    }
  }
  function update<K extends keyof ExerciseOptions>(key: K, value: ExerciseOptions[K]) {
    if (key === 'tempo') stop();
    setOptions(previous => ({ ...previous, [key]: value }));
  }
  const busy = status === 'loading';
  const displayedPassage = useMemo(() => ({ ...passage, options: { ...passage.options, tempo: options.tempo } }), [passage, options.tempo]);
  return <div className="app">
    <header className="topbar"><a className="brand" href="./"><span className="brand-icon">♮</span>Clarinet<span>Lab</span></a><span className="top-label">YOUR DAILY PRACTICE, REIMAGINED</span><span className="instrument-pill">B♭ Clarinet</span></header>
    <main>
      <section className="intro"><div><div className="eyebrow">FREE PRACTICE / STUDIO 01</div><h1>A fresh page.<br/><span>A better player.</span></h1><p>Build your fluency, one new passage at a time.</p></div><div className="intro-note"><span>♩</span><p>Read. Listen. Play.<br/><strong>Make it your own.</strong></p></div></section>
      <div className="studio-layout">
        <aside className="settings-panel">
          <div className="section-title"><span className="step">01</span><h2>Shape your exercise</h2></div>
          <label>Difficulty<select value={options.difficulty} onChange={e => update('difficulty', e.target.value as ExerciseOptions['difficulty'])}>{(['beginner','intermediate','advanced','expert'] as const).map(level => <option key={level} value={level}>{level[0].toUpperCase()+level.slice(1)}</option>)}</select></label>
          <p className="field-hint">{difficultyHint[options.difficulty]}</p>
          <div className="field-grid"><label>Written key<select value={options.key} onChange={e => update('key', e.target.value as ExerciseOptions['key'])}>{(['C','G','D','A','E','B','F#','F','Bb','Eb','Ab','Db','Gb'] as const).map(key => <option key={key} value={key}>{keyLabel(key)} major</option>)}</select></label><label>Time signature<select value={options.meter} onChange={e => update('meter', Number(e.target.value) as 3 | 4)}><option value={4}>4/4</option><option value={3}>3/4</option></select></label></div>
          <label>Passage length<select value={[4,8,12,16,24,32,64].includes(options.measures) ? options.measures : 'custom'} onChange={e => update('measures', e.target.value === 'custom' ? 20 : Number(e.target.value))}>{[4,8,12,16,24,32,64].map(count => <option key={count} value={count}>{count} measures</option>)}<option value="custom">Custom</option></select></label>
          <label>Custom measure count<input type="number" min="1" max="128" step="1" value={options.measures || ''} onChange={e => update('measures', Number(e.target.value))}/></label>
          <details className="advanced-settings"><summary>Musical expression</summary>
            <label>Exercise focus<select value={options.exerciseType ?? 'sight-reading'} onChange={e => update('exerciseType', e.target.value as ExerciseOptions['exerciseType'])}><option value="sight-reading">Sight-reading</option><option value="scales">Scale fragments</option><option value="rhythm">Rhythm study</option></select></label>
            <label>Rhythmic complexity<select value={options.rhythm ?? 'auto'} onChange={e => update('rhythm', e.target.value as ExerciseOptions['rhythm'])}><option value="auto">Match difficulty</option><option value="simple">Simple</option><option value="mixed">Mixed</option><option value="complex">Complex (within level)</option></select></label>
            <label>Articulation pattern<select value={options.articulationComplexity ?? 'simple'} onChange={e => update('articulationComplexity', e.target.value as ExerciseOptions['articulationComplexity'])}><option value="none">Unmarked</option><option value="simple">Simple</option><option value="patterned">Phrase patterns</option></select></label>
            <label>Articulation type<select disabled={options.articulationComplexity === 'none'} value={options.articulation ?? 'mixed'} onChange={e => update('articulation', e.target.value as ExerciseOptions['articulation'])}>{['mixed','unmarked','staccato','tenuto','accent','marcato','legato'].map(value => <option key={value} value={value}>{value[0].toUpperCase()+value.slice(1)}</option>)}</select></label>
            <label>Dynamic variation<select value={options.dynamics ?? 'gentle'} onChange={e => update('dynamics', e.target.value as ExerciseOptions['dynamics'])}><option value="none">None</option><option value="gentle">Gentle · mp to mf</option><option value="expressive">Expressive · pp to ff</option></select></label>
            <label>Rest frequency<select value={options.restFrequency ?? 'low'} onChange={e => update('restFrequency', e.target.value as ExerciseOptions['restFrequency'])}><option value="none">None</option><option value="low">Occasional breaths</option><option value="medium">Moderate</option><option value="high">Frequent</option></select></label>
            <p className="field-hint">Custom length: 1–128 measures. Rhythm choices remain within the selected level. Expression uses sample length and volume, not new timbral layers.</p>
          </details>
          <label>Exercise seed<input type="number" min="0" max="4294967295" step="1" value={seed} onChange={e => setSeed(Math.max(0, Math.min(4294967295, Math.floor(Number(e.target.value)))))} /></label><p className="field-hint">Use the same seed and settings to revisit a passage.</p>
          <button className="primary generate" onClick={() => generate()} disabled={busy}>Generate passage <span>↗</span></button>
          <p className="settings-foot">Settings apply when you generate.</p>
        </aside>
        <section className="score-panel">
          <div className="score-heading"><div><div className="eyebrow">YOUR MUSIC STAND</div><h2>{keyLabel(passage.options.key)} major study</h2></div><span className="difficulty-tag">{passage.options.difficulty}</span></div>
          <div className="score-meta"><span>B♭ clarinet · written pitch</span><span>{passage.options.meter}/4 · {passage.options.measures} measures · Seed {activeSeed}</span></div>
          <div className="playback">
            <div className="transport">
              {status === 'paused' ? <button className="play-button" disabled={transportBusy} onClick={() => void changeTransport('resume')}>▶ Resume</button> : status === 'playing' ? <button className="play-button" disabled={transportBusy} onClick={() => void changeTransport('pause')}>Ⅱ Pause</button> : <button className="play-button" disabled={busy} onClick={play}>{busy ? 'Loading samples…' : '▶ Listen'}</button>}
              <button className="stop-button" onClick={stop} disabled={status === 'idle'} aria-label="Stop playback">■</button>
              <span className="playback-status" role="status">{status === 'playing' ? 'Playing clarinet' : status === 'paused' ? 'Paused' : status === 'loading' ? 'Preparing clarinet' : 'Ready when you are'}</span>
            </div>
            <div className="playback-settings"><label className="tempo">Tempo <input aria-label="Playback tempo" aria-valuetext={options.tempo + ' beats per minute'} type="range" min="30" max="240" step="1" value={options.tempo} onChange={e => update('tempo', Number(e.target.value))}/><strong>{options.tempo}<small> BPM</small></strong></label><label className="metronome"><input type="checkbox" checked={metronome} onChange={e => { stop(); setMetronome(e.target.checked); }}/>Metronome</label></div>
          </div>
          {error && <div className="error" role="alert">{error}</div>}
          <Notation passage={displayedPassage}/>
          <div className="score-bottom"><span>Sounds a major second below the written notes.</span><button className="text-button" disabled={busy} onClick={() => generate(crypto.getRandomValues(new Uint32Array(1))[0])}>↻ New variation</button></div>

        </section>
      </div>
      <p className="field-hint">Clarinet samples: <a href="https://gleitz.github.io/midi-js-soundfonts/">FluidR3 / Frank Wen · Benjamin Gleitzman</a> · <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a></p><footer><span className="footer-tip"><strong>A little practice goes a long way.</strong> Start slowly, find your flow, then turn up the tempo.</span><span>PHASE 01 · PRACTICE STUDIO</span></footer>
    </main>
  </div>;
}
