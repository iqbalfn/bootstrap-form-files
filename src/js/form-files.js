/**
 * --------------------------------------------------------------------------
 * Bootstrap Form Files (v0.0.3): form-files.js
 * --------------------------------------------------------------------------
 */

import $ from 'jquery'
import Util from './util'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

 const NAME               = 'formfiles'
 const VERSION            = '0.0.3'
 const DATA_KEY           = 'bs.formfiles'
 const EVENT_KEY          = `.${DATA_KEY}`
 const DATA_API_KEY       = '.data-api'
 const JQUERY_NO_CONFLICT = $.fn[NAME]
 
 const Default = {
    filePicker : null,
    transform  : res => res
}

const DefaultType = {
  filePicker : '(function|string)',
  transform  : '(function|string)'
}

const Event = {
    ADD                 : `add${EVENT_KEY}`,
    ADDED               : `added${EVENT_KEY}`,
    CHANGE              : `change${EVENT_KEY}`,
    DELETE              : `delete${EVENT_KEY}`,
    DELETED             : `deleted${EVENT_KEY}`,
    TRUNCATE            : `truncate${EVENT_KEY}`,

    CHANGE_DATA_API     : `change${EVENT_KEY}`,
    CLICK_DATA_API      : `click${EVENT_KEY}`,
}

const ClassName = {
    ADDER           : 'formfiles-btn-add',
    HIDE            : 'hide',
    ITEMS           : 'formfiles-items',
    REMOVER         : 'formfiles-item-remove',
    SLIDEUP         : 'slide-up',
}

const Selector = {
    ITEMS           : `.${ClassName.ITEMS}`,
    ADDER           : `.${ClassName.ADDER}`,
    REMOVER         : `.${ClassName.REMOVER}`
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class FormFiles {
    constructor(element, config) {
        this._config        = this._getConfig(config)
        this._element       = element
        this._model         = document.querySelector(this._element.dataset.model)
        this._items         = $(element).children(Selector.ITEMS).get(0)

        this._isTransitioning = false

        this._updateValue()

        this._addElementListener()
        this._addModelListener()
        this._drawItems()
    }


    // Getters

    static get VERSION() {
        return VERSION
    }

    static get Default() {
        return Default
    }


    // Public

    addItem(item){
        $(this._element).trigger(Event.ADD, item)
        this._value.push(item)
        this._model.value = JSON.stringify(this._value)

        this._drawItem(item)
        $(this._element).trigger(Event.ADDED, item)
        $(this._element).trigger(Event.CHANGE)
    }

    removeItem(index){
        let item = this._value[index]
        if(!item)
            return

        if(this._isTransitioning)
            return
        this._isTransitioning = true

        $(this._element).trigger(Event.DELETE, item)
        this._value.splice(index, 1)
        this._model.value = this._value.length ? JSON.stringify(this._value) : ''

        let itemEl = $(this._items).children()[index]

        itemEl.classList.add(ClassName.HIDE)

        const transitionDuration  = Util.getTransitionDurationFromElement(itemEl)
        $(itemEl)
            .one(Util.TRANSITION_END, e => {
                $(itemEl).remove()
                this._isTransitioning = false
                $(this._element).trigger(Event.DELETED, item)
                $(this._element).trigger(Event.CHANGE)
            })
            .emulateTransitionEnd(transitionDuration)
    }

    truncate(){
        this._model.value     = '[]'
        this._value           = []
        this._items.innerHTML = ''

        $(this._element).trigger(Event.TRUNCATE)
        $(this._element).trigger(Event.CHANGE)
    }

    // Private

    _addElementListener(){
        $(this._element).on(Event.CLICK_DATA_API, Selector.ADDER, e => {
            if(this._config.filePicker){
                this._config.filePicker(res => {
                    if(res)
                        this.addItem(res)
                }, this)
            }
        })

        $(this._element).on(Event.CLICK_DATA_API, Selector.REMOVER, (e,i) => {
            let index = $(e.currentTarget.parentNode).index()
            this.removeItem(index)
        })
    }

    _addModelListener(){
        $(this._model).on(Event.CHANGE_DATA_API, e => {
            this._updateValue()
            this._drawItems()
            $(this._element).trigger(Event.CHANGE)
        })
    }

    _drawItem(item, index){
        item = this._config.transform(item)

        let icon = item.icon || '<i class="fa fa-file-text-o" aria-hidden="true"></i>'

        let tmpl = `
            <li class="slide-up">
                <a href="${item.url}" class="formfiles-item" target="_blank">
                    <div class="formfiles-item-icon">${icon}</div>
                    <div class="formfiles-item-title">${item.name}</div>
                    <div class="formfiles-item-meta">${item.meta}</div>
                </a>
                <button type="button" class="close formfiles-item-remove" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </li>`;

        $(tmpl).appendTo(this._items)
    }

    _drawItems(){
        this._items.innerHTML = ''
        this._value.forEach((e,i) => this._drawItem(e,i))
    }

    _getConfig(config) {
        config = {
          ...Default,
          ...config
        }
        Util.typeCheckConfig(NAME, config, DefaultType)
        return config
    }

    _updateValue(){
        let val = this._model.value.trim()
        this._value = []

        if(!val)
            return

        try{
            this._value = JSON.parse(val)
        }catch{
            console.error('The model value is not valid JSON', this._model)
        }

        if(!Array.isArray(this._value)){
            console.error('The model value is not valid JSON Array', this._model)
            this._value = []
        }
    }

    // Static

    static _jQueryInterface(config, relatedTarget) {
        return this.each(function () {
            let data = $(this).data(DATA_KEY)
            const _config = {
                ...Default,
                ...$(this).data(),
                ...typeof config === 'object' && config ? config : {}
            }

            if (!data) {
                data = new FormFiles(this, _config)
                $(this).data(DATA_KEY, data)
            }
        })
    }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = FormFiles._jQueryInterface
$.fn[NAME].Constructor = FormFiles
$.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return FormFiles._jQueryInterface
}

export default FormFiles