// Figma design tooling only. Skill createVariableCollection/createSemanticTokens embedded at execution.
const createdNodeIds = [], mutatedNodeIds = [];
const pages = {};
for (const name of ['00 Context & Direction', '01 START Library', '02 Discovery Screens']) {
  let p = figma.root.children.find(p => p.name === name);
  if (!p && name.startsWith('00') && figma.root.children.length === 1) {
    p = figma.root.children[0]; p.name = name; mutatedNodeIds.push(p.id);
  }
  if (!p) { p = figma.createPage(); p.name = name; createdNodeIds.push(p.id); }
  pages[name] = p.id;
}
const available = await figma.listAvailableFontsAsync();
for (const fontName of [{family:'Noto Sans SC',style:'Regular'}, {family:'Noto Sans SC',style:'Medium'}, {family:'Noto Sans SC',style:'Bold'}, {family:'Inter',style:'Regular'}, {family:'Inter',style:'Bold'}, {family:'Caveat',style:'Regular'}]) {
  if (!available.some(f => f.fontName.family === fontName.family && f.fontName.style === fontName.style)) throw new Error('Missing selected font '+JSON.stringify(fontName));
  await figma.loadFontAsync(fontName);
}
const collectionMap = {};
const existingCollections = await figma.variables.getLocalVariableCollectionsAsync();
for (const name of ['START Primitives', 'START Semantic']) {
  const existing = existingCollections.find(c=>c.name===name);
  collectionMap[name] = existing ? {collection:existing,modeIds:{Value:existing.defaultModeId}} : await createVariableCollection(name,['Value']);
}
const primitives = [
  ['paper','COLOR','#FAF9F5'], ['white','COLOR','#FFFFFF'], ['ink','COLOR','#20231E'], ['secondary','COLOR','#62665E'], ['line','COLOR','#D9DCD2'], ['soft','COLOR','#F0F1EB'], ['accent','COLOR','#D9EB48'], ['accentInk','COLOR','#3F4C08'], ['error','COLOR','#9D3027'],
  ...[4,8,12,16,20,24,32,40,48,64].map(n=>['space/'+n,'FLOAT',n]),
  ['radius/input','FLOAT',12], ['radius/object','FLOAT',12], ['radius/sheet','FLOAT',24], ['hit/min','FLOAT',44]
];
const primitiveMap = {}, semanticMap = {};
const currentVars = await figma.variables.getLocalVariablesAsync();
async function ensureToken(collectionInfo,name,type,value,scopes) {
  let variable=currentVars.find(v=>v.name===name && v.variableCollectionId===collectionInfo.collection.id);
  if(!variable) { variable=(await createSemanticTokens(collectionInfo.collection,collectionInfo.modeIds,[{name,type,values:{Value:value},scopes,codeSyntax:{WEB:'var(--start-'+name.replace(/\//g,'-')+')'}}])).variables[name]; }
  return variable;
}
for(const [name,type,value] of primitives) primitiveMap[name]=await ensureToken(collectionMap['START Primitives'],'primitive/'+name,type,value,[]);
const semanticDefs=[
 ['color/background','paper',['FRAME_FILL','SHAPE_FILL']], ['color/surface','white',['FRAME_FILL','SHAPE_FILL']], ['color/text','ink',['TEXT_FILL']], ['color/secondary','secondary',['TEXT_FILL']], ['color/border','line',['STROKE_COLOR']], ['color/subtle','soft',['FRAME_FILL','SHAPE_FILL']], ['color/accent','accent',['FRAME_FILL','SHAPE_FILL','STROKE_COLOR']], ['color/accent-ink','accentInk',['TEXT_FILL']], ['color/error','error',['TEXT_FILL']],
 ...[4,8,12,16,20,24,32,40,48,64].map(n=>['space/'+n,'space/'+n,['GAP']]),
 ['radius/input','radius/input',['CORNER_RADIUS']], ['radius/object','radius/object',['CORNER_RADIUS']], ['radius/sheet','radius/sheet',['CORNER_RADIUS']], ['size/hit-min','hit/min',['WIDTH_HEIGHT']]
];
for (const [name,ref,scopes] of semanticDefs) semanticMap[name]=await ensureToken(collectionMap['START Semantic'],name,primitiveMap[ref].resolvedType,{type:'VARIABLE_ALIAS',id:primitiveMap[ref].id},scopes);
const styleDefs=[
 ['START/Display',{family:'Inter',style:'Bold'},32,38],
 ['START/Title',{family:'Noto Sans SC',style:'Bold'},28,36],
 ['START/Chapter',{family:'Noto Sans SC',style:'Bold'},22,30],
 ['START/Body',{family:'Noto Sans SC',style:'Regular'},16,24],
 ['START/Label',{family:'Noto Sans SC',style:'Medium'},14,22],
 ['START/Caption',{family:'Noto Sans SC',style:'Regular'},12,18],
 ['START/Accent',{family:'Caveat',style:'Regular'},18,24]
];
const styles={};const oldStyles=await figma.getLocalTextStylesAsync();
for(const [name,fontName,fontSize,line] of styleDefs){let s=oldStyles.find(x=>x.name===name);if(!s){s=figma.createTextStyle();s.name=name;s.fontName=fontName;s.fontSize=fontSize;s.lineHeight={unit:'PIXELS',value:line};}styles[name]=s.id;}
return {createdNodeIds,mutatedNodeIds,pages,collections:Object.fromEntries(Object.entries(collectionMap).map(([k,v])=>[k,v.collection.id])),variables:Object.fromEntries(Object.entries(semanticMap).map(([k,v])=>[k,v.id])),primitiveVariables:Object.fromEntries(Object.entries(primitiveMap).map(([k,v])=>[k,v.id])),styles,fonts:styleDefs.map(x=>({role:x[0],font:x[1],size:x[2],lineHeight:x[3]}))};
