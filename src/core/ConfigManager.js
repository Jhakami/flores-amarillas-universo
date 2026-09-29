import { defaultConfig } from '../config/defaultConfig.js';
import { validateConfig } from '../config/configSchema.js';
const KEY = 'yellowUniverseConfig'; const BACKUP_KEY = 'yellowUniverseConfigV1Backup';
export class ConfigManager extends EventTarget {
  constructor(initial){super();this.config=validateConfig(initial||this.load());}
  load(){try{const raw=localStorage.getItem(KEY);if(!raw)return defaultConfig;const parsed=JSON.parse(raw);if((parsed.version??1)<2&&!localStorage.getItem(BACKUP_KEY))localStorage.setItem(BACKUP_KEY,raw);return parsed;}catch{return defaultConfig;}}
  save(){localStorage.setItem(KEY,JSON.stringify(this.config));this.emit();}
  reset(){this.config=validateConfig(defaultConfig);localStorage.removeItem(KEY);this.emit();}
  import(text){this.config=validateConfig(JSON.parse(text));this.save();return this.config;}
  export(){return JSON.stringify(this.config,null,2);}
  emit(){this.dispatchEvent(new CustomEvent('change',{detail:this.config}));}
}
