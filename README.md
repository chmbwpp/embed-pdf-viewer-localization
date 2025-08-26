# embed-pdf-viewer-localization
EmbedPDF Snippet  汉化组件  直接引用即可汉化


```js
//EmbedPDF.init后加入
//初始化
const container = document.querySelector('embedpdf-container');
t = new TranslatePDF(container?.shadowRoot || container!, map);
//销毁
t.destroy();
```