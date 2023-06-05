import { Series } from 'remotion';
import Intro from './Sequences/Intro';

export default function Composition(props: {
  title: string;
  subtitle: string;
}) {
  return (
    <Series>
      <Series.Sequence durationInFrames={240}>
        <Intro {...props} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={120}>
        <Intro {...props} />
      </Series.Sequence>
    </Series>
  );
}
