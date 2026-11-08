import { useEffect, useRef, useState } from 'react';
import { ClarinetPlayer } from './audio';
import { generatePassage, seededRandom } from './music';
import { DEFAULT_OPTIONS, type ExerciseOptions } from './types';
import { Notation } from './Notation';
import './styles.css';

type PlayerState = 'idle' | 'loading' | 'playing' | 'paused';

export default function App() {
  const [options, setOptions] = useState<ExerciseOptions>(DEFAULT_OPTIONS);
  const [seed, setSeed] = useState(1729);
  const [passage, setPassage] = useState(() => generatePassage(DEFAULT_OPTIONS, seededRandom(1729)));
  const [activeSeed, setActiveSeed] = useState(1729);
  const [status, setStatus] = useState<PlayerState>('idle');
  const [metronome, setMetronome] = useState(false);
  const [error, setError] = useState('');
  const player = useRef<ClarinetPlayer | null>(null);
  const request = useRef(0);
  useEffect(() => () => { request.current++; player.current?.stop(); }, []);
  function stop() { request.current++; player.current?.stop(); setStatus('idle'); }
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
        if (request.current === id) setStatus('idle');
      });
      if (request.current === id) setStatus('playing');
    } catch (e) {
      if (request.current === id) {
        setStatus('idle'); setError(e instanceof Error ? e.message : 'Audio could not load. Check your connection and try again.');
      }
    }
  }
  async function resume() {
    try { await player.current?.resume(); setStatus('playing'); }
    catch { setStatus('idle'); setError('Playback could not resume. Please press Play to retry.'); }
  }
  function update<K extends keyof ExerciseOptions>(key: K, value: ExerciseOptions[K]) {
    if (key === 'tempo') stop();
    setOptions(previous => ({ ...previous, [key]: value }));
  }
  const busy = status === 'loading';
  return <div className="app">
    <header className="topbar"><a className="brand" href="./"><span className="brand-icon">♮</span>Clarinet<span>Lab</span></a><span className="top-label">YOUR DAILY PRACTICE, REIMAGINED</span><span className="instrument-pill">B♭ Clarinet</span></header>
    <main>
      <section className="intro"><div><div className="eyebrow">FREE PRACTICE / STUDIO 01</div><h1>A fresh page.<br/><span>A better player.</span></h1><p>Build your fluency, one new passage at a time.</p></div><div className="intro-note"><span>♩</span><p>Read. Listen. Play.<br/><strong>Make it your own.</strong></p></div></section>
      <div className="studio-layout">
        <aside className="settings-panel">
          <div className="section-title"><span className="step">01</span><h2>Shape your exercise</h2></div>
          <label>Difficulty<select value={options.difficulty} onChange={e => update('difficulty', e.target.value as ExerciseOptions['difficulty'])}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option></select></label>
          <p className="field-hint">{options.difficulty === 'beginner' ? 'Gentle movement and simple rhythms.' : 'More melodic movement and rhythmic variety.'}</p>
          <div className="field-grid"><label>Written key<select value={options.key} onChange={e => update('key', e.target.value as ExerciseOptions['key'])}>{(['C','G','D','F','Bb'] as const).map(key => <option key={key} value={key}>{key === 'Bb' ? 'B♭' : key} major</option>)}</select></label><label>Time signature<select value={options.meter} onChange={e => update('meter', Number(e.target.value) as 3 | 4)}><option value={4}>4/4</option><option value={3}>3/4</option></select></label></div>
          <label>Passage length<select value={options.measures} onChange={e => update('measures', Number(e.target.value))}><option value={4}>4 measures</option><option value={8}>8 measures</option></select></label>
          <label>Exercise seed<input type="number" min="0" max="4294967295" step="1" value={seed} onChange={e => setSeed(Math.max(0, Math.min(4294967295, Math.floor(Number(e.target.value)))))} /></label><p className="field-hint">Use the same seed and settings to revisit a passage.</p>
          <button className="primary generate" onClick={() => generate()} disabled={busy}>Generate passage <span>↗</span></button>
          <p className="settings-foot">Settings apply when you generate.</p>
        </aside>
        <section className="score-panel">
          <div className="score-heading"><div><div className="eyebrow">YOUR MUSIC STAND</div><h2>{passage.options.key === 'Bb' ? 'B♭' : passage.options.key} major study</h2></div><span className="difficulty-tag">{passage.options.difficulty}</span></div>
          <div className="score-meta"><span>B♭ clarinet · written pitch</span><span>{passage.options.meter}/4 · {passage.options.measures} measures · Seed {activeSeed}</span></div>
          <Notation passage={{ ...passage, options: { ...passage.options, tempo: options.tempo } }}/>
          <div className="score-bottom"><span>Sounds a major second below the written notes.</span><button className="text-button" disabled={busy} onClick={() => generate(crypto.getRandomValues(new Uint32Array(1))[0])}>↻ New variation</button></div>
          <div className="playback">
            <div className="transport">
              {status === 'paused' ? <button className="play-button" onClick={resume}>▶ Resume</button> : status === 'playing' ? <button className="play-button" onClick={() => { player.current?.pause(); setStatus('paused'); }}>Ⅱ Pause</button> : <button className="play-button" disabled={busy} onClick={play}>{busy ? 'Loading samples…' : '▶ Listen'}</button>}
              <button className="stop-button" onClick={stop} disabled={status === 'idle'} aria-label="Stop playback">■</button>
              <span className="playback-status" role="status">{status === 'playing' ? 'Playing clarinet' : status === 'paused' ? 'Paused' : status === 'loading' ? 'Preparing clarinet' : 'Ready when you are'}</span>
            </div>
            <div className="playback-settings"><label className="tempo">Tempo <input aria-label="Playback tempo" type="range" min="40" max="180" step="1" value={options.tempo} onChange={e => update('tempo', Number(e.target.value))}/><strong>{options.tempo}<small> BPM</small></strong></label><label className="metronome"><input type="checkbox" checked={metronome} onChange={e => { stop(); setMetronome(e.target.checked); }}/>Metronome</label></div>
          </div>
          {error && <div className="error" role="alert">{error}</div>}
        </section>
      </div>
      <p className="field-hint">Clarinet samples: <a href="https://gleitz.github.io/midi-js-soundfonts/">FluidR3 / Frank Wen · Benjamin Gleitzman</a> · <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a></p><footer><span className="footer-tip"><strong>A little practice goes a long way.</strong> Start slowly, find your flow, then turn up the tempo.</span><span>PHASE 01 · PRACTICE STUDIO</span></footer>
    </main>
  </div>;
}

