import spacerUtil from './../libs/spacerUtil';

class Model{
    constructor(){
        this.spacers_ = '';
    }

    getSpackers(){
        return this.spacers_;
    }

    insertStr(index, str){
        return spacerUtil.insertStr(this.spacers_, index, str);
    }
    removeStr(index){
        return spacerUtil.removeStr(this.spacers_, index);
    }
    getSpackerAt(index){
        return this.spacers_.substr(index, 1);
    }
    updateSpacers(spacers){
        this.spacers_ = spacers;
    }
}
export default Model;