import {defaultConfig} from './defaultConfig.js';
const ranges={exposure:[.6,1.8],strength:[0,2.5],radius:[0,1],threshold:[0,1],lensingStrength:[0,1.5],starCount:[500,15000],count:[4,120],fov:[35,75],parallax:[0,.35],smoothing:[.01,.2],volume:[0,1]};
const clone=v=>JSON.parse(JSON.stringify(v));
function merge(base,input){const out=clone(base);for(const [k,v] of Object.entries(input||{})){if(!(k in out))continue;if(v&&typeof v==='object'&&!Array.isArray(v)&&out[k]&&typeof out[k]==='object')out[k]=merge(out[k],v);else if(typeof v===typeof out[k])out[k]=v;}return out;}
function clampTree(obj){for(const [k,v] of Object.entries(obj)){if(v&&typeof v==='object')clampTree(v);else if(typeof v==='number'&&ranges[k])obj[k]=Math.min(ranges[k][1],Math.max(ranges[k][0],v));}return obj;}
export function validateConfig(input){if(!input||typeof input!=='object')return clone(defaultConfig);return clampTree(merge(defaultConfig,input));}
