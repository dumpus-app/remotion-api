import { Composition as RemotionComposition } from 'remotion';
import Composition from '#video/Compositions/Video/Composition';
import { loadFont } from '@remotion/google-fonts/Rubik';
import './style.css';

loadFont();

const FPS = 30;

export default function RemotionRoot() {
  return (
    <>
      <RemotionComposition
        id="Video"
        component={Composition}
        durationInFrames={FPS * 12}
        fps={FPS}
        width={1280}
        height={720}
        defaultProps={{
          title: 'DUMPUS',
          subtitle: 'Get detailed insights and stats for your Discord account',
        }}
      />
    </>
  );
}
