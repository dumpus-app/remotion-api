import clsx from 'clsx';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useFramesFromEnd } from '#video/hooks';

export type Props = {
  subtitle: string;
  className?: string;
};

export function Subtitle({ subtitle, className }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [30, 50, useFramesFromEnd(50), useFramesFromEnd(30)],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  const translateY = spring({
    fps,
    frame,
    from: 100,
    to: 0,
    delay: 30,
    durationInFrames: 20,
    config: {
      stiffness: 50,
    },
  });

  return (
    <div
      className={clsx('text-gray-400 text-3xl', className)}
      style={{ opacity, transform: `translateY(${translateY}px)` }}
    >
      {subtitle}
    </div>
  );
}
