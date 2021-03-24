export default {
     insertStr(source, start, newStr){   
        return source.slice(0, start) + newStr + source.slice(start);
     },
     removeStr(source, index){
      return source.slice(0, index) + source.slice(index+1);

     }
}