var globalSizeIframe;
function setIframeHTML(iframe, html) {
  
      iframe.sandbox = 'allow-same-origin';
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(html);
      iframe.contentWindow.document.close();
   
  }

  
export default {
    getHtmlSize(html){
        if(!html){
            return {
                width: 0
            }
        }
        html = html.replace(/\s/g,'&nbsp;')
        // console.log(html)
        if(!globalSizeIframe){
            globalSizeIframe = document.createElement('iframe');
            globalSizeIframe.style.visibility = 'hidden';
            var iframHtml = '<body><span id="box"></span></body>';
            document.body.appendChild(globalSizeIframe);
            setIframeHTML(globalSizeIframe, iframHtml);
        }
        
        let boxEle = globalSizeIframe.contentWindow.document.getElementById('box');
        boxEle.setAttribute('style','font-size:14px;')
        boxEle.innerHTML = html;

        // debugger;
        return globalSizeIframe.contentWindow.document.getElementById('box').getBoundingClientRect();
    }
}