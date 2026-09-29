import './styles/base.css';import './styles/overlays.css';import './styles/editor.css';import './styles/responsive.css';import {App} from './core/App.js';import {ErrorFallback} from './ui/ErrorFallback.js';
const canvas=document.querySelector('#experience'),ui=document.querySelector('#ui');
if(!window.WebGLRenderingContext)new ErrorFallback(ui).show();else{const app=new App({canvas,container:ui});app.init().then(()=>app.start()).catch(err=>{console.error(err);new ErrorFallback(ui).show(err.message);});window.yellowUniverse=app;}
