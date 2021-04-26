/**
 * @license ChantersJs v0.5
 * (c) 2013-2016 Chanters, Inc. http://chanters.herokuapp.com
 * License: MIT
 */

/**
 * ChantersJs is a JavaScript library for creating Web Components
 * ShadowRoot not supporting
 * Provides light Two-way data binding(browser supported) i.e.,
 * Obect.defineProperty depends on the browser
 * https://plnkr.co/edit/Ij8WmgZwlFDO89X5JnIv?p=preview
 */


 (function(window, document, undefined, factory) {
    window["Chanters"] = factory();

})(window, document, undefined, function() {

    window.onload = addContextMenu;

    function addContextMenu() {
        document.body.addEventListener('contextmenu', function(event) {
            return false;
        });
        var needContextMenu = document.querySelectorAll("[chanters-contextmenu]");

        if (!needContextMenu.forEach)
            needContextMenu = Array.prototype.slice.call(needContextMenu);

        needContextMenu.forEach(function(element) {
            element.contextmenu = element.getAttribute("chanters-contextmenu");
            element.addEventListener('contextmenu', function(event) {
                event.preventDefault();
                this[this.getAttribute("chanters-contextmenu")](event);
            });
        });
    }

    var ChantersConstants = function(key) {
        var chantersConstants = {
            AttributeObect: {
                "Attribute": {
                    bindingType: "Attribute",
                    raw: "HTMLNode Attribute AttributeValue eg style: color:{{color}}, size:{{size}}  //or// class : dark-div {{hidden}}",
                    keys: new Array(),
                    values: new Array(),
                    attributeName: "AttributeName eg Style/Class"
                },
                "Event": {
                    bindingType: "Event",
                    raw: "HTMLNode Attribute name in which on-click/on-input or on-event name found",
                    functionBody: "contains function which from webComponent prototype, always first level",
                    eventName: "on-EventType"
                }

            },
            TextObect: {
                bindingType: "TextContent",
                raw: "HTMLNode textContent eg hello my name is {{user.name}} or color",
                keys: new Array(),
                values: new Array()
            },
            "EventObject": {
                bindingType: "Event",
                raw: "HTMLNode Attribute name in which on-click/on-input or on-event name found",
                functionBody: "contains function which from webComponent prototype, always first level",
                eventName: "on-EventType"
            },
            "repeaterObject": {
                parsingLevel: {
                    bindingType: "Repeater",
                    raw: "HTMLNode Attribute Value eg repeat = [[order in orders]] or friend in user.friendList",
                    nextSibling: "template tag nextSibling",
                    parentNode: "template tag parentNode",
                    targetArray: new Array(),
                    cloneTargetArray: new Array(),
                    template: "orginal template for binding",
                    templateClone: "create a clone from orginal template"
                },
                childLevel: {
                    bindingType: "ReaterChild",
                    processedNode: "either true or undefined",
                    index: "index of currently repeating array",
                    item: "object on which bingding is done",
                    clone: "clone object for defineProperty",
                    bindingObject: "object contains information of top level repeater on which we are iterating i.e parsingLevel",
                }
            }

        }

        return chantersConstants[key];
    };

    /**
     * core functions
     */
    var isArray = Array.isArray;

    function forLoop(arr, callback) {
        if (!arr)
            return;

        if (isArray(arr))
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] && typeof callback === "function")
                    callback(arr[i], i);
            }
        else if (isObject(arr))
            Object.keys(arr).forEach(function(key, index, object) {
                if (arr[key] && typeof callback === "function")
                    callback(key, arr[key], index);
            });
    }

    function lowercase(string) {
        return isString(string) ? string.toLowerCase() : string;
    };

    function uppercase(string) {
        return isString(string) ? string.toUpperCase() : string;
    };


    function isString(value) {
        return typeof value === 'string';
    };

    function isObject(value) {
        return value !== null && typeof value === 'object';
    }

    function isNumber(value) {
        return typeof value === 'number';
    }

    function isDate(value) {
        return toString.call(value) === '[object Date]';
    }

    function isFunction(value) {
        return typeof value === 'function';
    }

    function isWindow(obj) {
        return obj && obj.window === obj;
    }

    function isFile(obj) {
        return toString.call(obj) === '[object File]';
    }

    function isFormData(obj) {
        return toString.call(obj) === '[object FormData]';
    }



    function keys(obj) {
        return isObject(obj) && Object.keys(obj);
    }

    /*
     *  HTML NODE related function
     */

    /*
     *  Recursive loop for html node
     *  node parser
     */
    function walkNodes(node, callback) {
        if (node.childNodes.length > 0) {
            var child = node.firstChild;
            while (child) {
                if (callback && typeof callback === "function")
                    callback(child);

                walkNodes(child, callback);
                child = child.nextSibling;
            }
        }
    }

    function getBindingVariables(str) {
        if (str.indexOf("{{") !== -1)
            return str.trim().match(/{{\s*[\w\.]+\s*}}/g).map(function(x) {
                return x.match(/[\w\.]+/)[0];
            });
    }

    function setBindingVariables(textContent, from, With) {
        var str = textContent;
        for (var i = 0; i < from.length; i++) {
            if (isObject(With[i])) // if try to print object
                With[i] = JSON.stringify(With[i]);

            str = str.replace(new RegExp('{{' + from[i] + '}}', 'gi'), With[i]);
        }

        return str;
    }

    function addEventListener(n, eventName, callback) {
        n.addEventListener(eventName, callback, true);
    }

    function createHTMLElement(tagName) {
        return document.createElement(tagName);
    }

    function getNodeName(element) {
        return lowercase(element.nodeName || (element[0] && element[0].nodeName));
    }

    function hasTextContent(n) {
        if (n.textContent.trim().length)
            return true;
        else
            return false;
    }

    function cloneHTMLNodes(n) {
        var cloneNode = createHTMLElement(n.nodeName);
        cloneNode.innerHTML = n.innerHTML;
        return cloneNode;
    }

    function cloneObject(obj) {
        if (isObject(obj))
            return JSON.parse(JSON.stringify(obj));
    }

    /*
     *  HTML NODE related function
     */


    /**
     * core functions
     */


    /**
     * ChantersJs constructor function
     */

    function Chanters(name, prototype) {
        if (!name)
            throw "please provide template name";

        if (typeof name === "object")
            throw "Template name should not be a String";

        if (name && prototype)
            Chanters.init(name, prototype);
    }

    Chanters.createElement = createHTMLElement;

    Chanters.init = function(name, prototype) {
        var ChantersObject = {};
        var node = document.currentScript.parentNode;

        var XFooProto = Object.create(HTMLElement.prototype, {
            createdCallback: {
                value: function() {
                    var content = node.querySelector("template").content;
                    var clone = document.importNode(content, true);
                    this.createShadowRoot().appendChild(clone);
                    var webComponent = new WebComponent(this, prototype);

                    if (webComponent.inheritParent) {
                        webComponent.parent = webComponent.parentNode;


                        if (webComponent.parent)
                            webComponent.parent.communicate = function(options, callback) {
                                // todo :: refactor this code/logic
                                var element = this.querySelector(options.element);
                                if (element && element[options.effectedProperty])
                                    // element[options.effectedProperty] = options.newValue;

                                    if (element[options.effectedProperty + "_"])
                                        element[options.effectedProperty + "_"](options.newValue);
                            }
                    }


                    if (webComponent.onReady)
                        webComponent.onReady();
                }
            }
        });


        var XFoo = document.registerElement(name, { prototype: XFooProto });


    }


    /**
     * ChantersJs constructor function
     */


    /**
     * Base Observer Class
     * Detects the changes over an object
     */

    Observers.prototype.__destroy__ = function(callback) {};



    function Observers(webComponent, prototype) {
        this.mapper = {};
        this.prototype = prototype;
        this.webComponent = webComponent;
        this.__cloneWebCompnent__(webComponent);
    }

    Observers.prototype.__cloneWebCompnent__ = function(webComponent) {
        var proto = cloneObject(this.prototype);
        var prototype = this.prototype;

        forLoop(proto, function(key) {
            webComponent[key] = proto[key];
        });

        forLoop(prototype, function(key) {
            if (isFunction(prototype[key]))
                webComponent[key] = prototype[key];
        })
    }

    // Note :: at a time only one binding type will be here 
    // means if a div have 

    Observers.prototype.__observe__ = function(n, nodeObject) {
        var that = this,
            webComponent = this.webComponent;


        // for first level DOM nodes
        if (nodeObject.Attribute) {
            nodeObject.Attribute.forEach(function(item) {
                var _keys = item.keys;
                var templateInstance = nodeObject.targetNodes;
                var clone = nodeObject.clone;
                var obj = nodeObject.obj;

                if (!templateInstance)
                    return;

                forLoop(_keys, function(key, i) {
                    var check = utils.__checkValuesFromKeys__(webComponent, key, that.mapper);
                    if (check) {
                        that.__defineProperty__(obj, key, clone, templateInstance);
                    }

                });
            });

        } else if (nodeObject.TextContent) {
            nodeObject.TextContent.forEach(function(item) {
                var _keys = item.keys;
                var templateInstance = nodeObject.targetNodes;
                var clone = nodeObject.clone;
                var obj = nodeObject.obj;

                if (!templateInstance)
                    return;

                forLoop(_keys, function(key, i) {
                    var check = utils.__checkValuesFromKeys__(webComponent, key, that.mapper);
                    if (check) {
                        that.__defineProperty__(obj, key, clone, templateInstance, webComponent);
                    }

                });
            });
        } else if (n.nodeName === "INPUT" && nodeObject.Event) {
            nodeObject.Event.forEach(function(item) {
                if (!item.valueAttribute)
                    return;

                var _keys = [item.valueAttribute];
                var templateInstance = item.targetNodes;
                var clone = item.clone;
                var obj = item.obj;



                if (!templateInstance)
                    return;

                forLoop(_keys, function(key, i) {
                    var check = utils.__checkValuesFromKeys__(webComponent, key, that.mapper);
                    if (check) {
                        that.__defineProperty__(obj, key, clone, templateInstance, webComponent);
                    }

                });
            })
        } else if (nodeObject.Repeater && n.nodeName === "TEMPLATE") {
            var repeaterObject = nodeObject.Repeater[0];
            var check = utils.__checkValuesFromKeys__(webComponent, repeaterObject.targetArrayName, that.mapper);

            // if (check) {
            //     Object.defineProperty(webComponent, repeaterObject.targetArrayName, {
            //         get: function() {
            //             return that.prototype[repeaterObject.targetArrayName];
            //         },
            //         set: function(val) {
            //             if (isArray(val)) {
            //                 var key = repeaterObject.targetArrayName;
            //                 var change = that.__apply__(that.prototype, key, val);
            //                 if (!change)
            //                     return;

            //                 change.templateInstance = this.templateInstance && this.templateInstance[key] || templateInstance;
            //                 that.prototype[repeaterObject.targetArrayName] = val;
            //             } else
            //                 console.warn("array type variables cann't accept other values")


            //             // that.__digest__(change);

            //         },
            //         enumerable: true
            //     });
            // }

        }


    }


    Observers.prototype.__defineProperty__ = function(tags, key, clones, templateInstance, webComponent) {
        var that = this;
        key = key.split(".").pop();

        var tag = tags[key];
        var clone = clones[key];

        Object.defineProperty(tag, key, {
            get: function() {
                return clone[key];
            },
            set: function(val) {
                var change = that.__apply__(clone, key, val);
                if (!change)
                    return;


                change.templateInstance = this.templateInstance && this.templateInstance[key] || templateInstance;
                clone[key] = val;


                that.__digest__(change);

            },
            enumerable: true
        });
    };

    Observers.prototype.__apply__ = function(clone, key, value) {
        var newValue = value;
        var oldValue = clone[key];

        if (oldValue !== newValue) {
            return {
                name: key,
                newValue: newValue,
                oldValue: oldValue,
                type: "updated"
            }
        }
    }

    Observers.prototype.__digest__ = function(change) {
        if (!change.templateInstance)
            return;

        var webComponent = this.webComponent;
        that = this;

        change.templateInstance.forEach(function(item) {
            var node = item.node;

            if (node === webComponent.target)
                return;

            // var bindingObject = item.bindingObject.textContent ? item.bindingObject.textContent[0] : item.bindingObject;

            var bindingObject = item.bindingObject;

            if (bindingObject.Attribute) {
                that.__ObserveAttibuteChanges__(change, bindingObject.Attribute, node);
            } else if (bindingObject.TextContent) {
                that.__ObserveTextChanges__(change, bindingObject.TextContent, node);
            } else if (node.nodeName === "INPUT")
                that.__ObserveTextBoxChanges__(change, bindingObject, node);



        })

        delete webComponent.target;
    }

    Observers.prototype.__ObserveTextBoxChanges__ = function(change, bindingObject, node) {
        node.value = change.newValue;
    }

    Observers.prototype.__ObserveAttibuteChanges__ = function(change, bindingObject, node) {
        bindingObject.forEach(function(item) {
            var effectedPropertyName = change.name;

            item.keys.forEach(function(key, index) {
                key = key.split(".").pop();
                if (key === effectedPropertyName)
                    item.values[index] = change.newValue;
            })

            Setters.prototype.__Setter__Attribute(node, item);
        })
    }

    Observers.prototype.__ObserveTextChanges__ = function(change, bindingObject, node) {
        bindingObject.forEach(function(item) {
            var effectedPropertyName = change.name;

            item.keys.forEach(function(key, index) {
                key = key.split(".").pop();
                if (key === effectedPropertyName)
                    item.values[index] = change.newValue;
            })

            Setters.prototype.__SetterTextNodes__(node, item);
        })
    }

    /**
     * Base Observer Class
     * Detects the changes over an object
     */

    /**
     * Base WebComponent Class
     */

    function WebComponent(webComponent, prototype) {
        this.initializeComponent(webComponent, prototype);
        var that = this;

        (function(webComponent) {
            var observer = new Observers(webComponent, prototype);

            webComponent.templateInstance = new Object();

            walkNodes(webComponent.shadowRoot, function(n) {
                var nodeObject = new Object();

                new Getters(n, nodeObject, webComponent, prototype);

                if (keys(nodeObject).length) {
                    new Setters(n, nodeObject, webComponent, prototype);
                    observer.__observe__(n, nodeObject);
                }

            });

            // observer.__destroy__();


        })(this.content);

        return this.content;
    }

    WebComponent.templateObject = {};


    WebComponent.prototype.initializeComponent = function(webComponent, proto) {
        this.content = webComponent;
        webComponent.$ = {};
        if (keys(webComponent.dataset).length)
            forLoop(webComponent.dataset, function(key, value) {
                proto[key] = value;
            });
    }



    /**
     * Base WebComponent Class
     */


    /**
     * Base Setters Class
     * Get every node binding request from template tag
     * Example text binding, event listeners
     */
    // todo :: refactor below code
    function Setters(n, nodeObject, webComponent, prototype) {
        this.webComponent = webComponent;
        this.prototype = prototype;

        this.__Init__(n, nodeObject);
    }

    Setters.prototype.__Init__ = function(n, nodeObject) {
        var that = this;
        forLoop(nodeObject, function(bindingType, item) {
            if (isArray(item))
                forLoop(item, function(bindingObject) {
                    if (bindingType === "TextContent")
                        that.__SetterTextNodes__(n, bindingObject);
                    if (bindingType === "Attribute")
                        that.__Setter__Attribute(n, bindingObject);
                    if (bindingType === "Event")
                        that.__Setter__Events(n, bindingObject);
                    if (bindingType === "Repeater")
                        that.__Setter__Repeaters(n, bindingObject);
                });
        })

    }

    Setters.prototype.__Setter__Repeaters = function(node, bindingObject) {

        forLoop(bindingObject.targetArray, function(item, index) {
            var instance = document.importNode(bindingObject.templateClone.content, true);
            (function(instance) {
                walkNodes(instance, function(n) {
                    n.processedNode = true;
                    n.keyFromTop = bindingObject.targetArrayName + "." + index;
                    n.index = index;
                    n.iteratorObjectName = bindingObject.iteratorObjectName;
                });
                bindingObject.parentNode.insertBefore(instance, bindingObject.nextSibling);
            })(instance);
        });
        WebComponent.templateObject = bindingObject;
    };

    Setters.prototype.__SetterTextNodes__ = function(n, bindingObject) {
        var _from = bindingObject.keys,
            _with = bindingObject.values;

        n.textContent = setBindingVariables(bindingObject.raw, _from, _with);
    };

    Setters.prototype.__Setter__Attribute = function(n, bindingObject) {
        var _from = bindingObject.keys,
            _with = bindingObject.values;

        var value = setBindingVariables(bindingObject.raw, _from, _with);
        n.setAttribute(bindingObject.attributeName, value);
    };

    Setters.prototype.__Setter__Events = function(n, bindingObject) {
        // if (bindingObject.arguments) {

        n.addEventListener(bindingObject.eventName, function(event) {
            event.stopPropagation();
            var arr = [event];
            if (bindingObject.arguments && bindingObject.arguments.length)
                arr = arr.concat(bindingObject.arguments);

            bindingObject.functionBody.apply({}, arr);
            event.preventDefault();
        }, true);
        return;

        // }

        // if (bindingObject.functionBody)
        //     addEventListener(n, bindingObject.eventName, bindingObject.functionBody);
    };

    /**
     * Base Setters Class
     * Get every node binding request from template tag
     * Example text binding, event listeners
     */


    /**
     * Base Getter Class
     * Get every node binding request from template tag
     * Example text binding, event listeners
     */

    // todo :: refactor below code
    function Getters(n, nodeObject, webComponent, prototype) {
        this.webComponent = webComponent;
        this.prototype = prototype;
        this.__FilterNode__(n, nodeObject);
    }

    Getters.prototype.__FilterNode__ = function(n, nodeObject) {
        if (n.nodeType === 8)
            return; // ignore comment nodes

        // only textNodes are available here
        // this part is important for text Binding
        if (hasTextContent(n) && n.childNodes.length < 1)
            this.__GetterTextNodes__(n, nodeObject);


        // non-textNodes
        // this part is important for attributes Binding and template repeat and conditions
        else if (n.nodeType === 1) {
            if (n.attributes.length)
                this.__GetterAttributes__(n, nodeObject);

            // // this section is for attribute binding such as events and binding attribute with scope object 
            // // node type===1

        }


    }


    Getters.prototype.__GetterAttributes__ = function(n, nodeObject) {
        var webComponent = this.webComponent;
        var prototype = this.prototype;

        if (n.nodeName === "INPUT" && n.value.indexOf("{{") !== -1) {
            this.__Getter__Input(n, prototype, nodeObject, webComponent);
        }

        if (n.id)
            webComponent.$[n.id] = n;

        attributeIterator(n, prototype, nodeObject, webComponent, function(bindingObject) {
            createBindingObject(nodeObject, bindingObject);
        });



    }

    Getters.prototype.__Getter__Input = function(n, prototype, nodeObject, webComponent) {
        var key = getBindingVariables(n.value)[0];
        if (key) {
            var processed = inputCallback.bind(webComponent);
            var attr = getAttributeByName("value", n);
            var bindingObject = utils.__CreateEvent__Object(attr[0], key, webComponent, inputCallback);

            function inputCallback(event) {
                webComponent.target = event.target;

                var key = bindingObject.valueAttribute;
                key = key.split(".").pop();

                var obj = bindingObject.obj[key];
                obj[key] = n.value;
            }

            n.bindingObject = bindingObject;
            bindingObject.valueAttribute = key;
            bindingObject.eventName = "input";

            if (n.processedNode) {
                key = handleRepeaterKeys([key], n, nodeObject, 'attribute', attr[0]);
            } else {
                key = [key];
            }


            n.value = getValuesFromKeys(key, prototype, bindingObject, n, webComponent);

            createBindingObject(nodeObject, bindingObject);

            n.removeAttribute("value");

        }
    }

    function getAttributeByName(attrName, n) {
        return Array.prototype.slice.call(n.attributes).filter(function(attr) {
            if (attrName === attr.name)
                return attr;
        });
    }


    function attributeIterator(n, prototype, nodeObject, webComponent, callback) {
        if (!n.attributes)
            return;

        forLoop(n.attributes, function(index, attr) {
            if (attr.value.indexOf("{{") !== -1) {


                if (attr.name.indexOf("on-") !== -1) {
                    if (attr.value.indexOf("(") !== -1) {
                        var functionName = attr.value.split("(")[0];
                        functionName = functionName + "}}";
                    } else
                        functionName = attr.value;

                    var _keys = getBindingVariables(functionName);

                    var obj = utils.__CreateEvent__Object(attr, _keys, webComponent);

                    if (isFunction(callback) && keys(obj).length)
                        callback(obj);
                } else {
                    var _keys = getBindingVariables(attr.value);

                    var obj = utils.__CreateAttribute__Object(attr, _keys, prototype, n, nodeObject, webComponent);

                    if (isFunction(callback) && keys(obj).length)
                        callback(obj);
                }





            } else if (attr.name === "repeat") {
                var obj = utils.__CreateRepeater__Object(n, attr, webComponent, prototype, nodeObject);
                if (isFunction(callback) && keys(obj).length)
                    callback(obj);
            }

        })
    }

    var utils = {
        __CreateRepeater__Object: function(n, attrValue, webComponent, prototype, nodeObject) {
            var bindingObject = ChantersConstants("repeaterObject").parsingLevel;

            bindingObject.nextSibling = n.nextSibling;
            bindingObject.parentNode = n.parentNode;

            bindingObject.raw = attrValue.value;

            bindingObject.template = n;
            bindingObject.templateClone = cloneHTMLNodes(n);

            bindingObject.iteratorObjectName = attrValue.value.split(" ")[0];

            bindingObject.targetArrayName = attrValue.value.split(" ")[2];



            var keys = [attrValue.value.split(" ")[2]];

            if (n.keyFromTop) {
                keys = handleRepeaterKeys(keys, n, nodeObject, 'template');
                bindingObject.targetArrayName = keys[0];
            }

            bindingObject.targetArray = getValuesFromKeys(keys, prototype, nodeObject, n, webComponent)[0];

            return bindingObject;

        },
        __CreateTextNode__Object: function(n, prototype, nodeObject, webComponent, keys) {
            var bindingObject = ChantersConstants("TextObect");
            bindingObject.keys = keys;
            bindingObject.raw = n.textContent.trim();
            bindingObject.values = getValuesFromKeys(keys, prototype, nodeObject, n, webComponent);

            createBindingObject(nodeObject, bindingObject);
        },
        __CreateAttribute__Object: function(attr, keys, prototype, n, nodeObject, webComponent) {
            var bindingObject = ChantersConstants("AttributeObect").Attribute;


            if (n.processedNode) {
                keys = handleRepeaterKeys(keys, n, nodeObject, 'attribute', attr);
            }

            var values = getValuesFromKeys(keys, prototype, nodeObject, n, webComponent);
            bindingObject.raw = attr.value,
                bindingObject.keys = keys,
                bindingObject.values = values,
                bindingObject.attributeName = attr.name;




            return bindingObject;

        },
        __CreateEvent__Object: function(attr, key, webComponent, _function, eventType) {
            var eventName = eventType || attr.name.split("on-")[1];
            var callback = _function || (webComponent[key] && webComponent[key].bind(webComponent)) || undefined;


            var bindingObject = ChantersConstants("EventObject");

            bindingObject.eventName = eventName,
                bindingObject.functionBody = callback,
                bindingObject.scopeVariable = key,
                bindingObject.raw = attr.value;


            if (attr.value.indexOf("(") !== -1) {
                bindingObject.arguments = getFunctionArguments(attr.value);
            }

            return bindingObject;
        },
        __checkValuesFromKeys__: function(o, s, mapper) {
            s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
            s = s.replace(/^\./, ''); // strip a leading dot
            var a = s.split('.');

            for (var i = 0, n = a.length; i < n; ++i) {
                var k = a[i];

                if (k in o) {

                    if (mapper[k] && i === a.length - 1)
                        return false;

                    if (isString(o[k]) || isNumber(o[k]) || typeof o[k] === "boolean")
                        mapper[k] = true;



                    if (isObject(o[k])) {
                        if (!mapper[k])
                            mapper[k] = {};

                        mapper = mapper[k];
                    }

                    o = o[k];
                } else {
                    return;
                }
            }

            return true;
        }
    }


    function getFunctionArguments(str) {
        var args = /\(\s*([^)]+?)\s*\)/.exec(str);

        if (args[1]) {
            return args[1].split(/\s*,\s*/);
        }

        return args[0];
    }

    Getters.prototype.__GetterTextNodes__ = function(n, nodeObject) {
        var keys = getBindingVariables(n.textContent),
            prototype = this.prototype,
            templateInstance = this.webComponent.templateInstance;

        if (!keys) return;


        if (n.processedNode)
            keys = handleRepeaterKeys(keys, n, nodeObject, "textContent");


        utils.__CreateTextNode__Object(n, prototype, nodeObject, this.webComponent, keys);
    }

    function handleRepeaterKeys(keys, n, nodeObject, type, attr) {
        var _from = keys;
        var _with = [];
        var iteratorKey = n.iteratorObjectName;
        var _keys = [];

        _with = keys.map(function(key) {

            if (key.indexOf(iteratorKey) !== -1) {
                key = key.replace(iteratorKey, n.keyFromTop);
            }

            _keys.push(key);
            return "{{" + key + "}}";

        })

        if (type === "textContent")
            n.textContent = setBindingVariables(n.textContent, _from, _with);

        else if (type === "attribute") {

            n.setAttribute(attr.name, setBindingVariables(attr.value, _from, _with));
        }

        return _keys;

    }



    // setBindingVariables(bindingObject.raw, _from, _with)

    function getValuesFromKeys(keys, prototype, nodeObject, n, webComponent) {
        var values = [];
        var templateInstance = webComponent && webComponent.templateInstance;

        forLoop(keys, function(key, i) {
            values.push(byString(prototype, key, nodeObject, n, templateInstance, webComponent));
        });

        return values;
    }

    function byString(prototype, s, bindingObject, node, templateInstance, webComponent) {
        s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        s = s.replace(/^\./, ''); // strip a leading dot
        var a = s.split('.');


        for (var i = 0, n = a.length; i < n; ++i) {
            var k = a[i];

            if (k in prototype) {

                if ((isString(prototype[k]) || isNumber(prototype[k])) && bindingObject) {
                    if (!bindingObject.obj) {
                        bindingObject.obj = {};
                        bindingObject.clone = {};
                    }


                    bindingObject.obj[k] = webComponent;
                    bindingObject.clone[k] = prototype;
                    mapNodes(node, bindingObject, templateInstance, k);
                    bindingObject.targetNodes = templateInstance[k];
                }

                if (isObject(prototype[k]) && bindingObject) {
                    if (!templateInstance[k])
                        templateInstance[k] = {};

                    templateInstance = templateInstance[k];
                }

                prototype = prototype[k];
                if (webComponent)
                    webComponent = webComponent[k];
            } else {
                return;
            }
        }
        return prototype;
    }

    function mapNodes(n, bindingObject, templateInstance, key) {
        if (!templateInstance[key]) {
            templateInstance[key] = [];
        }

        templateInstance[key].push({
            node: n,
            bindingObject: bindingObject
        });
    };

    // creates bindingObject from Getters class
    function createBindingObject(o, bindingObject) {
        var bindingType = bindingObject.bindingType;

        if (!o[bindingType])
            o[bindingType] = [];

        o[bindingType].push(bindingObject);
    }

    Chanters.getImageBrightness = function(imageSrc, callback) {
        var img = document.createElement("img");
        img.src = imageSrc;
        img.style.display = "none";
        document.body.appendChild(img);

        var colorSum = 0;

        img.onload = function() {
            // create canvas
            var canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;

            var ctx = canvas.getContext("2d");
            ctx.drawImage(this, 0, 0);

            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var data = imageData.data;
            var r, g, b, avg;

            for (var x = 0, len = data.length; x < len; x += 4) {
                r = data[x];
                g = data[x + 1];
                b = data[x + 2];

                avg = Math.floor((r + g + b) / 3);
                colorSum += avg;
            }

            var brightness = Math.floor(colorSum / (this.width * this.height));
            callback(brightness);
            img.remove();
        }
    }


    return Chanters;

});


// Use this code for setting Getters and Setters in webComponent Two-way binding
// var arrayChangeHandler = {
//   get: function(target, property) {
//     console.log('getting ' + property + ' for ' + target);
//     // property is index in this case
//     return target[property];
//   },
//   set: function(target, property, value, receiver) {
//     console.log('setting ' + property + ' for ' + target + ' with value ' + value);
//     target[property] = value;
//     // you have to return true to accept the changes
//     return true;
//   }
// };

// var arrayToObserve = new Proxy([], arrayChangeHandler);

// arrayToObserve.push('Test');
// console.log(arrayToObserve[0]);


// saurabhmakhija.27@gmail.comment