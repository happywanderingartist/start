const page=await figma.getNodeByIdAsync('3:2');await figma.setCurrentPageAsync(page);
for(const f of [{family:'Noto Sans SC',style:'Regular'},{family:'Noto Sans SC',style:'Medium'},{family:'Noto Sans SC',style:'Bold'},{family:'Inter',style:'Bold'},{family:'Caveat',style:'Regular'}])await figma.loadFontAsync(f);
const vars=Object.fromEntries((await figma.variables.getLocalVariablesAsync()).filter(v=>v.name.startsWith('color/')||v.name.startsWith('space/')||v.name.startsWith('radius/')).map(v=>[v.name,v]));
const styles=Object.fromEntries((await figma.getLocalTextStylesAsync()).map(s=>[s.name,s.id]));
const createdNodeIds=[],mutatedNodeIds=[],componentSets={},components={};
function paint(name){return figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',vars[name]);}
async function label(parent,txt,role='Label',color='text',width){const n=figma.createText();createdNodeIds.push(n.id);n.name='Label';n.fontName={family:'Noto Sans SC',style:'Regular'};await n.setTextStyleIdAsync(styles['START/'+role]);n.characters=txt;n.fills=[paint('color/'+color)];parent.appendChild(n);if(width){n.textAutoResize='HEIGHT';n.resize(width,n.height);}return n;}
function container(parent,width,gap=8){const n=figma.createAutoLayout('VERTICAL');createdNodeIds.push(n.id);parent.appendChild(n);n.resize(width,20);n.layoutSizingVertical='HUG';n.fills=[];n.setBoundVariable('itemSpacing',vars['space/'+gap]);return n;}
function radius(n,key){for(const k of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius'])n.setBoundVariable(k,vars['radius/'+key]);}
function textProperty(comp,node,name='Label'){const key=comp.addComponentProperty(name,'TEXT',node.characters);node.componentPropertyReferences={characters:key};}
let activeFamily='';
async function hydrateComponent(comp){
 const value=Object.fromEntries(comp.name.split(', ').map(p=>p.split('=')));
 comp.fills=[];comp.clipsContent=false;comp.counterAxisAlignItems='CENTER';
 if(activeFamily==='Action'){
  const primary=value.Emphasis==='Primary';comp.fills=primary?[paint('color/accent')]:[];radius(comp,'input');
  const l=await label(comp,primary?'START':'SHARE',primary?'Body':'Label',primary?'text':'secondary');textProperty(comp,l);
  if(value.State==='Pressed')comp.opacity=.76;
 }else if(activeFamily==='SearchInput'){
  comp.fills=[paint('color/surface')];comp.strokes=[paint(value.State==='Focus'?'color/text':'color/border')];comp.strokeWeight=value.State==='Focus'?2:1;radius(comp,'input');
  const icon=components['Icon/search'].createInstance();createdNodeIds.push(icon.id);comp.appendChild(icon);
  const l=await label(comp,value.State==='Typing'?'台北':'艺人 / 城市 / 地点','Body',value.State==='Typing'?'text':'secondary');textProperty(comp,l,'Value');
 }else if(activeFamily==='DirectoryRow'){
  const col=container(comp,252,4);const l=await label(col,value.Entity==='Artist'?'苏打绿':value.Entity==='Route'?'春日城市路线':value.Entity==='Place'?'春日书店':'城市小演出','Body','text',252);textProperty(comp,l,'Title');const s=await label(col,value.Entity==='Artist'?'艺人 · 乐团':value.Entity==='Route'?'苏打绿 · 台北':value.Entity==='Place'?'地点 · 台北':'活动 · 台北','Caption','secondary',252);textProperty(comp,s,'Subtitle');
  const arrow=components['Icon/arrow-up-right'].createInstance();createdNodeIds.push(arrow.id);comp.appendChild(arrow);comp.primaryAxisAlignItems='SPACE_BETWEEN';
 }else if(activeFamily==='CityIndex'){
  if(value.State==='Active')comp.fills=[paint('color/accent')];
  const l=await label(comp,'台北','Label');textProperty(comp,l);
 }else if(activeFamily==='MiniInfo'){
  comp.layoutMode='VERTICAL';comp.counterAxisAlignItems='MIN';comp.primaryAxisAlignItems='MIN';comp.fills=[paint('color/subtle')];radius(comp,'object');const l=await label(comp,value.Kind==='Photo'?'PHOTO SPOT':'ANGLE','Caption','secondary');textProperty(comp,l,'Title');const s=await label(comp,'资料暂缺','Label','text',116);textProperty(comp,s,'Body');
 }else if(activeFamily==='DiscoveryObject'){
  comp.fills=[paint('color/surface')];comp.strokes=[paint('color/border')];comp.strokeWeight=1;radius(comp,'object');const l=await label(comp,'01  苏打绿','Label');textProperty(comp,l);
 }else if(activeFamily==='StopRow'){
  const index=figma.createAutoLayout('HORIZONTAL');createdNodeIds.push(index.id);index.resize(32,32);index.fills=value.State==='Active'?[paint('color/accent')]:[paint('color/subtle')];index.primaryAxisAlignItems='CENTER';index.counterAxisAlignItems='CENTER';comp.appendChild(index);const num=await label(index,'01','Caption');textProperty(comp,num,'Number');
  const body=container(comp,244,4);const l=await label(body,'春日书店','Body','text',244);textProperty(comp,l,'Title');const s=await label(body,'书店 · 查看关联与位置','Caption','secondary',244);textProperty(comp,s,'Subtitle');
 }else if(activeFamily==='NavItem'){
  const l=await label(comp,'Start','Label',value.State==='Active'?'text':'secondary');textProperty(comp,l);if(value.State==='Active')l.textDecoration='UNDERLINE';
 }
}
for(const [name,svg] of Object.entries(ICON_SOURCES)){
 let c=page.findOne(n=>n.type==='COMPONENT'&&n.name==='Icon/'+name);if(!c){const imported=figma.createNodeFromSvg(svg.replace(/currentColor/g,'#20231E'));createdNodeIds.push(imported.id,...imported.findAll(()=>true).map(n=>n.id));imported.resize(20,20);c=figma.createComponentFromNode(imported);createdNodeIds.push(c.id);c.name='Icon/'+name;c.x=80+Object.keys(components).length*80;c.y=80;c.description='Lucide SVG, ISC; original paths imported, no reconstruction.';}components['Icon/'+name]=c;
}
const familyDefs=[
 ['Action',{Emphasis:['Primary','Secondary'],State:['Default','Pressed']},148,52,16],
 ['SearchInput',{State:['Idle','Focus','Typing']},312,56,16],
 ['DirectoryRow',{Entity:['Artist','Route','Place','Event']},342,76,0],
 ['CityIndex',{State:['Inactive','Active']},72,44,12],
 ['MiniInfo',{Kind:['Photo','Angle']},158,96,16],
 ['DiscoveryObject',{Kind:['Collected']},172,48,12],
 ['StopRow',{State:['Default','Active']},342,76,0],
 ['NavItem',{State:['Inactive','Active']},100,52,8]
];
let y=160;
for(const [name,axes,w,h,pad]of familyDefs){
 activeFamily=name;let set=page.findOne(n=>n.type==='COMPONENT_SET'&&n.name==='START/'+name);
 if(!set){const made=await createComponentWithVariants({name:'START/'+name,variantAxes:axes,baseProps:{width:w,height:h,layoutMode:'HORIZONTAL',itemSpacing:12,padding:{left:pad,right:pad,top:pad?8:0,bottom:pad?8:0}},page,description:'START Phase C '+name+'; approved Discovery hierarchy; semantic variables, text properties and 44px minimum interaction.'});set=made.componentSet;createdNodeIds.push(set.id,...made.variants.map(v=>v.id));set.x=80;set.y=y;for(const c of made.variants){for(const field of ['paddingLeft','paddingRight'])if(pad)c.setBoundVariable(field,vars['space/'+pad]);c.setBoundVariable('itemSpacing',vars['space/12']);}}
 componentSets[name]={id:set.id,variants:set.children.map(c=>({id:c.id,name:c.name,width:c.width,height:c.height}))};y+=set.height+80;
}
for(const [name,hash,w,h]of [['Doll','2cb01045ec753f01c1fb2d8650632a948a9d1560',74,96],['Illustration','d14b939e1e2e39fae3d1458b171380ed3320eae8',160,120]]){
 let c=page.findOne(n=>n.type==='COMPONENT'&&n.name==='START/'+name);if(!c){c=figma.createComponent();createdNodeIds.push(c.id);c.name='START/'+name;c.resize(w,h);c.fills=[{type:'IMAGE',imageHash:hash,scaleMode:'FIT'}];c.x=2200;c.y=name==='Doll'?80:260;c.description=name==='Doll'?'Locked approved girl idle PNG; static visual only, no runtime.':'AI-generated fictional unbranded bookshop; illustrative media, NEVER evidence of artist/place.';}components[name]=c;
}
for(const [id,name,x,y]of [['4:2','Source / locked Doll',2500,80],['4:3','Source / fictional illustration',2500,600]]){const n=await figma.getNodeByIdAsync(id);if(n){n.name=name;n.resize(300,name.includes('Doll')?390:225);n.x=x;n.y=y;mutatedNodeIds.push(id);}}
return {createdNodeIds,mutatedNodeIds,componentSets,components:Object.fromEntries(Object.entries(components).map(([k,v])=>[k,v.id])),setCount:Object.keys(componentSets).length,variantCount:Object.values(componentSets).reduce((n,s)=>n+s.variants.length,0)};
