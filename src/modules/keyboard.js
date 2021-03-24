const SHORTKEY = /Mac/i.test(navigator.platform) ? 'metaKey' : 'ctrlKey';
import lodash from 'lodash';
import {
    COMMAND_CONFIG
} from './../libs/commandUtil';

class Keyboard {
    static match(evt, binding) {
        if (
            ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'].some(key => {
                return !!binding[key] !== evt[key] && binding[key] !== null;
            })
        ) {
            return false;
        }
        return binding.key === evt.key || binding.key === evt.which;
    }

    constructor(editor) {
        this.editor = editor;
        this.bindings = {};
        Object.keys(Keyboard.DEFAULTS.bindings).forEach(name => {
            if (Keyboard.DEFAULTS.bindings[name]) {
                this.addBinding(Keyboard.DEFAULTS.bindings[name]);
            }
        });



        this.listen();
    }

    addBinding(keyBinding, context = {}, handler = {}) {
        const binding = normalize(keyBinding);
        if (binding == null) {
            console.warn('Attempted to add invalid keyboard binding', binding);
            return;
        }
        if (typeof context === 'function') {
            context = {
                handler: context
            };
        }
        if (typeof handler === 'function') {
            handler = {
                handler
            };
        }
        const keys = Array.isArray(binding.key) ? binding.key : [binding.key];
        keys.forEach(key => {
            const singleBinding = {
                ...binding,
                key,
                ...context,
                ...handler,
            };
            this.bindings[singleBinding.key] = this.bindings[singleBinding.key] || [];
            this.bindings[singleBinding.key].push(singleBinding);
        });
    }

    getBindsByEvt(evt) {
        if (evt.key.length === 1) {
            if (!this.bindings[evt.key] || this.bindings[evt.key].length === 0) {
                let tmp = lodash.cloneDeep(Keyboard.DEFAULTS.bindings.insertCharacter);
                tmp.key = evt.key;
                this.addBinding(evt.key, tmp)
                return this.bindings[evt.key] || [];
            }

        }
        return this.bindings[evt.key] || [];
    }
    listen() {
        this.editor.getRoot().focus();
        this.editor.getRoot().addEventListener('keydown', evt => {
            if (evt.defaultPrevented || evt.isComposing) return;
            // console.log(evt)
            let bindings = this.getBindsByEvt(evt).concat(
                this.bindings[evt.which] || [],
            );
            let matches = bindings.filter(binding => Keyboard.match(evt, binding));
            if (matches.length === 0) return;

            const range = this.editor.getSelection();
            const curContext = {
                userInput: evt.key
            };
            const prevented = matches.some(binding => {
                return binding.handler.call(this, range, curContext, binding) !== true;
            });
            if (prevented) {
                evt.preventDefault();
            }
        });
    }
}


Keyboard.DEFAULTS = {
    bindings: {
        'Undo': {
            key: 'z',
            shortKey: true,
            handler() {
                this.editor.undo();
            }
        },
        'Backspace': {
            key: 'Backspace',
            handler(range, context) {
                let command = {
                    type: COMMAND_CONFIG.DELETE_CHARTER,
                    startIndex: range[0]
                };
                this.editor.flush(command);

                return false;
            }
        },
        'Enter': {
            key: 'Enter',
            metaKey: null,
            ctrlKey: null,
            altKey: null,
            handler(range, context) {
                let command = {
                    type: COMMAND_CONFIG.INSERT_CHARTER,
                    startIndex: range[0],
                    value: '\n'
                };

                this.editor.flush(command);
                return false;
            }
        },
        'insertCharacter': {
            handler(range, context) {
                let command = {
                    type: COMMAND_CONFIG.INSERT_CHARTER,
                    startIndex: range[0],
                    value: context.userInput
                };

                this.editor.flush(command);
                return false;
            }
        },
        'left': {
            key: 'ArrowLeft',
            handler() {
                if (this.editor.getCursorInfo().locationX > 0) {
                    this.editor.updateCursorInfo(--this.editor.getCursorInfo().locationX);
                } else {
                    if (this.editor.getCursorInfo().locationY > 0) {
                        this.editor.updateCursorInfo(undefined, --this.editor.getCursorInfo().locationY);
                    }
                }
                this.editor.flush();
            }
        },
        'right': {
            key: 'ArrowRight',
            handler() {
                if ((this.editor.getCursorInfo().locationX + 1) <= this.editor.getCurrentBlockCharacterCount()) {
                    this.editor.updateCursorInfo(++ this.editor.getCursorInfo().locationX);
                    this.editor.flush();
                }
            }
        },
        'up': {
            key: 'ArrowUp',
            handler() {
                this.editor.getCursorInfo().locationY > 0 ?  this.editor.updateCursorInfo(undefined,-- this.editor.getCursorInfo().locationY): null;
                this.editor.flush();
            },
        },
        'down': {
            key: 'ArrowDown',
            handler() {
                if (this.editor.getCursorInfo().locationY < this.editor.blocks.length - 1) {
                    this.editor.updateCursorInfo(undefined, ++ this.editor.getCursorInfo().locationY);
                    this.editor.flush();
                }
                
            }
        }
    }
}


function normalize(binding) {
    if (typeof binding === 'string' || typeof binding === 'number') {
        binding = {
            key: binding
        };
    } else if (typeof binding === 'object') {
        binding = lodash.cloneDeep(binding);
    } else {
        return null;
    }
    if (binding.shortKey) {
        binding[SHORTKEY] = binding.shortKey;
        delete binding.shortKey;
    }
    return binding;
}


export {
    Keyboard as
    default, SHORTKEY, normalize
};
