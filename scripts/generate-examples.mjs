import { createServer } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
const server = await createServer({ server: { middlewareMode: true } });
try {
 const { generatePassage, seededRandom, passageToAbc } = await server.ssrLoadModule('/src/music.ts');
 const { ACCEPTANCE_OPTIONS } = await server.ssrLoadModule('/src/acceptance.ts');
 await mkdir('examples/version3', { recursive: true });
 for (const seed of [1729,1730]) {
  const passage = generatePassage(ACCEPTANCE_OPTIONS,seededRandom(seed));
  await writeFile(`examples/version3/study-${seed}.json`,JSON.stringify({seed,passage},null,2)+'\n');
  await writeFile(`examples/version3/study-${seed}.abc`,passageToAbc(passage,2)+'\n');
 }
} finally { await server.close(); }
