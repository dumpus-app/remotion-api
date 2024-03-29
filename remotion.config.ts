import { Config } from 'remotion';
import { webpackOverride } from '#video/webpack-override';

Config.setImageFormat('jpeg');
Config.setOverwriteOutput(true);

Config.overrideWebpackConfig(webpackOverride);
