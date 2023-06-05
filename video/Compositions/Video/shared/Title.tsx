import { interpolate, spring } from 'remotion';
import { useVideoConfig } from 'remotion';
import { useCurrentFrame } from 'remotion';
import { useFramesFromEnd } from '#video/hooks';
import clsx from 'clsx';

export type Props = {
  title: string;
  className?: string;
};

export function Title({ title, className }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [20, 40, useFramesFromEnd(40), useFramesFromEnd(20)],
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
    delay: 20,
    durationInFrames: 20,
    config: {
      stiffness: 50,
    },
  });

  return (
    <div
      style={{ opacity, transform: `translateY(${translateY}px)` }}
      className={clsx(
        'text-gray-50 text-5xl font-bold leading-relaxed',
        className,
      )}
    >
      {title}
    </div>
  );
}
