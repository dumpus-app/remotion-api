import { useVideoConfig } from 'remotion';

export function useFramesFromEnd(n: number) {
  const { durationInFrames } = useVideoConfig();
  return durationInFrames - 1 - n;
}
