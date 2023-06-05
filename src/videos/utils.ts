import path from 'node:path';
import fsp from 'fs/promises';

export function getFilePath(id: string) {
  return path.join(process.cwd(), `./out/Video-${id}.mp4`);
}

export async function fileExists(path: string) {
  return !!(await fsp.stat(path).catch((e) => false));
}
