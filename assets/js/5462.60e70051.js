"use strict";(self.webpackChunklmcache_architecture_lectures=self.webpackChunklmcache_architecture_lectures||[]).push([["5462"],{9301(e,t,a){a.d(t,{diagram:()=>v});var i=a(8213),l=a(5871),r=a(7959),s=a(8424),n=a(797),o=a(8731),c=a(7829),p=s.UI.pie,d={sections:new Map,showData:!1,config:p},u=d.sections,h=d.showData,g=structuredClone(p),f=(0,n.K2)(()=>structuredClone(g),"getConfig"),m=(0,n.K2)(()=>{u=new Map,h=d.showData,(0,s.IU)()},"clear"),x=(0,n.K2)(({label:e,value:t})=>{if(t<0)throw Error(`"${e}" has invalid value: ${t}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);u.has(e)||(u.set(e,t),n.Rm.debug(`added new section: ${e}, with value: ${t}`))},"addSection"),w=(0,n.K2)(()=>u,"getSections"),$=(0,n.K2)(e=>{h=e},"setShowData"),S=(0,n.K2)(()=>h,"getShowData"),y={getConfig:f,clear:m,setDiagramTitle:s.ke,getDiagramTitle:s.ab,setAccTitle:s.SV,getAccTitle:s.iN,setAccDescription:s.EI,getAccDescription:s.m7,addSection:x,getSections:w,setShowData:$,getShowData:S},C=(0,n.K2)((e,t)=>{(0,l.S)(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},"populateDb"),T={parse:(0,n.K2)(async e=>{let t=await (0,o.qg)("pie",e);n.Rm.debug(t),C(t,y)},"parse")},k=(0,n.K2)(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,"getStyles"),D=(0,n.K2)(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),a=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1);return(0,c.rLf)().value(e=>e.value).sort(null)(a)},"createPieArcs"),v={parser:T,db:y,renderer:{draw:(0,n.K2)((e,t,a,l)=>{n.Rm.debug("rendering pie chart\n"+e);let o=l.db,p=(0,s.D7)(),d=(0,r.$t)(o.getConfig(),p.pie),u=(0,i.D)(t),h=u.append("g");h.attr("transform","translate(225,225)");let{themeVariables:g}=p,[f]=(0,r.I5)(g.pieOuterStrokeWidth);f??=2;let m=d.textPosition,x=(0,c.JLW)().innerRadius(0).outerRadius(185),w=(0,c.JLW)().innerRadius(185*m).outerRadius(185*m);h.append("circle").attr("cx",0).attr("cy",0).attr("r",185+f/2).attr("class","pieOuterCircle");let $=o.getSections(),S=D($),y=[g.pie1,g.pie2,g.pie3,g.pie4,g.pie5,g.pie6,g.pie7,g.pie8,g.pie9,g.pie10,g.pie11,g.pie12],C=0;$.forEach(e=>{C+=e});let T=S.filter(e=>"0"!==(e.data.value/C*100).toFixed(0)),k=(0,c.UMr)(y).domain([...$.keys()]);h.selectAll("mySlices").data(T).enter().append("path").attr("d",x).attr("fill",e=>k(e.data.label)).attr("class","pieCircle"),h.selectAll("mySlices").data(T).enter().append("text").text(e=>(e.data.value/C*100).toFixed(0)+"%").attr("transform",e=>"translate("+w.centroid(e)+")").style("text-anchor","middle").attr("class","slice");let v=h.append("text").text(o.getDiagramTitle()).attr("x",0).attr("y",-200).attr("class","pieTitleText"),b=[...$.entries()].map(([e,t])=>({label:e,value:t})),K=h.selectAll(".legend").data(b).enter().append("g").attr("class","legend").attr("transform",(e,t)=>"translate(216,"+(22*t-22*b.length/2)+")");K.append("rect").attr("width",18).attr("height",18).style("fill",e=>k(e.label)).style("stroke",e=>k(e.label)),K.append("text").attr("x",22).attr("y",14).text(e=>o.getShowData()?`${e.label} [${e.value}]`:e.label);let A=Math.max(...K.selectAll("text").nodes().map(e=>e?.getBoundingClientRect().width??0)),R=v.node()?.getBoundingClientRect().width??0,M=Math.min(0,225-R/2),z=Math.max(512+A,225+R/2)-M;u.attr("viewBox",`${M} 0 ${z} 450`),(0,s.a$)(u,450,z,d.useMaxWidth)},"draw")},styles:k}}}]);