import { AbsoluteFill } from 'remotion';
import { Logo } from '#video/Compositions/Video/shared/Logo';
import { Subtitle } from '../shared/Subtitle';
import { Title } from '../shared/Title';

export default function Composition({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <AbsoluteFill className="bg-gray-950 items-center justify-center">
      <div className="m-10" />
      <Logo />
      <Title title={title} className="my-3" />
      <Subtitle subtitle={subtitle} />
    </AbsoluteFill>
  );
}
