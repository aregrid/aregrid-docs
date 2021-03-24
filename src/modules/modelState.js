import Model from './model';
import History from './history';
import {
    COMMAND_CONFIG
} from './../libs/commandUtil';
import sizeUtil from './../libs/sizeUtil';
import PAGE_CONFIG from './modules/../pageConfig';
import lodash from 'lodash';
const EDIT_SOURCE_CONFIG = {
    UNDO: "UNDO",
    USER_EDIT: "USER_EDIT"
}
class ModelState {
    constructor() {
        this.history_ = new History();
        this.model_ = new Model();
        this.commands_ = [];
        this.cursorInfo_ = {
            locationX: 0,
            locationY: 0
        };
        this.cursorStyle_ = {}
        this.blocks_ = [];
    }
    applyCommand(command, {
        editSource = EDIT_SOURCE_CONFIG.UNDO
    }) {
        this.commands_.push(command);
        this.updateModel(command, {
            editSource
        });
    }
    getCursorSpacerIndex() {
        let blocksLocationXCount = 0;
        if (this.cursorInfo_.locationY > 0) {
            let list = this.blocks_.slice(0, this.cursorInfo_.locationY);
            let count = 0;
            list.forEach(item => count += item.html.length);
            blocksLocationXCount = count + this.cursorInfo_.locationY;
        }
        let result = blocksLocationXCount + this.cursorInfo_.locationX;
        return result;
    }
    updateBlocks() {
        let spacerBlocks = this.model_.getSpackers().split('\n');
        this.blocks_ = spacerBlocks.map((item) => {
            return {
                html: item
            }
        });

        this.blocksForRedraw_ = this.blocks_.map((item) => {
            let html = item.html.replace(/\s/g, '&nbsp;');
            let size = sizeUtil.getHtmlSize(html);
            return {
                html: html,
                overlayStyle: {
                    width: size.width + 'px',
                    height: size.height + 'px'
                }
            }
        });

    }
    getBlocksForRedraw() {
        return this.blocksForRedraw_;
    }
    getSelection() {
        return [this.getCursorSpacerIndex(), this.getCursorSpacerIndex()]
    }
    getCurrentCursorLoctionX() {
        let lastBlock = this.getCurrentBlock();
        return lastBlock.html.length;
    }
    updateModel(command, {
        editSource = EDIT_SOURCE_CONFIG.USER_EDIT
    } = {}) {
        if (command.type === COMMAND_CONFIG.INSERT_CHARTER) {
            let startIndex = command.startIndex;
            if (editSource === EDIT_SOURCE_CONFIG.USER_EDIT) {
                this.history_.record({
                    type: COMMAND_CONFIG.DELETE_CHARTER,
                    startIndex: startIndex + 1
                });
            }

            let newSpacers = this.model_.insertStr(startIndex, command.value);
            this.model_.updateSpacers(newSpacers);
            if (command.value === '\n') {
                this.cursorInfo_.locationY += 1;
                this.cursorInfo_.locationX = 0;
            } else {
                this.cursorInfo_.locationX += 1;
            }
        } else if (command.type === COMMAND_CONFIG.DELETE_CHARTER) {
            let startIndex = command.startIndex;
            if (startIndex === 0) {
                return;
            }
            let deleteCharterValue = this.model_.getSpackerAt(startIndex - 1);
            if (editSource === EDIT_SOURCE_CONFIG.USER_EDIT) {
                this.history_.record({
                    type: COMMAND_CONFIG.INSERT_CHARTER,
                    startIndex: startIndex,
                    value: deleteCharterValue
                })
            }
            this.removeSpackerIndex(startIndex - 1);
        }

    }
    removeSpackerIndex(targetSpacerIndex) {
        let deleteCharterValue = this.model_.getSpackerAt(targetSpacerIndex);


        if (deleteCharterValue === '\n') {
            let locationX;
            if (this.cursorInfo_.locationY > 0) {
                locationX = this.blocks_[this.cursorInfo_.locationY - 1].html.length;
            }

            this.cursorInfo_.locationY -= 1;
            this.cursorInfo_.locationX = locationX;

        } else {
            this.cursorInfo_.locationX -= 1;
        }
        let newSpacers = this.model_.removeStr(targetSpacerIndex);
        this.model_.updateSpacers(newSpacers);
    }

    getCurrentBlock() {
        // this.updateBlocks();
        return this.blocks_[this.cursorInfo_.locationY] || {
            html: ''
        };
    }
    updateCursor() {
        let bloczdount = this.blocks_.length;
        let block = this.getCurrentBlock();
        this.cursorStyle_ = {
            left: PAGE_CONFIG.PADDING_LEFT + sizeUtil.getHtmlSize((block.html).substr(0, this.cursorInfo_.locationX))
                .width + 'px',
            top: PAGE_CONFIG.PADDING_TOP + 20 * this.cursorInfo_.locationY + 'px'
        }
        // this.cursorInfo_.locationX = this.getCurrentCursorLoctionX();
    }
    getCursorStyle() {
        return this.cursorStyle_;
    }
    getCursorInfo() {
        return this.cursorInfo_;
    }
    updateCursorInfo(x, y) {
        if (!lodash.isUndefined(x)) {
            this.cursorInfo_.locationX = x;
        }
        if (!lodash.isUndefined(y)) {
            this.cursorInfo_.locationY = y;
        }
    }
    undo() {
        return this.history_.undo();
    }
    getCommands(){
        return this.commands_;
    }

}

export default ModelState;