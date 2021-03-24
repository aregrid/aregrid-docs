function History(){

}
History.prototype = {
    undoCommands: [],
    undo(){
        return this.undoCommands.pop();
    },
    record(command){
        this.undoCommands.push(command);
    }
}
export default History;