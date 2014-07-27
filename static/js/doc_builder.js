(function($, _, root) {
    /*================================= Edit ================================*/
    var EditInput = function($target, targetType) {
        this.$target = $target;
        this._node = this._getNode($target, targetType);
        this._targetType = targetType;
        this._init();
        this._bindEvents();
    };
    EditInput.prototype = {
        _init: function() {
            var targetType = this._targetType;
            if (targetType === 'name') {
                this._oldVal = this.$target.attr('name');
            } else if (targetType === 'key') {
                this._oldVal = this.$target.attr('key');
            } else if (targetType === 'value') {
                this._oldVal = this.$target.attr('value');
            } else if (targetType === 'content') {
                this._oldVal = this.$target.text();
            }
            this.$editBox = $('<input type="text" value="'+this._oldVal+'"/>');
            this.$target.after(this.$editBox);
        },
        _bindEvents: function() {
            var _this = this;
            var updateNode = function(val) {
                var newVal = val.trim(),
                targetType = _this._targetType;
                if (newVal.length == 0) {
                    return false;
                }
                if (newVal != this._oldVal) {
                    var info = {};
                    if (targetType === 'name') {
                        info['oldValue'] = _this.$target.attr('name');
                        info['newValue'] = newVal;
                    } else if (targetType === 'key') {
                        info['oldValue'] = _this._oldVal;
                        info['newValue'] = newVal;
                    } else if (targetType === 'value') {
                        info['newValue'] = newVal;
                        info['key'] = _this.$target.attr('key');
                    } else if (targetType === 'content') {
                        info['newValue'] = newVal;
                    }
                    _this._node.updateNode(_this._targetType, info);
                }
                _this.$editBox.remove();
                _this.$target.show();
            };
            this.$editBox.bind('keyup',  function(e) {
                if (e.keyCode === 13) {
                    updateNode($(this).val());
                }
            })
            this.$editBox.bind('blur',  function(e) {
                var val = $(this).val().trim();
                if (val.length == 0) {
                    return false;
                }
                updateNode(val);
            })

        },
        _getNode: function($target, targetType) {
            if (_.contains(['name', 'key', 'value'], targetType)) {
                return $target.parents('.xib-node').data('node');
            } else {
                return $target.data('node');
            }
        },
        show: function() {
            this.$editBox.show();
            this.$target.hide();
            this.$editBox.focus().select();
        }
    };

    /*================================= Nodes ===============================*/

    var ElementNode = function(nodeName, attributes, children, opts) {
        this._nodeName = nodeName;
        this._attributes = attributes;
        this._children = children;
        this._opts = $.extend(true, {}, opts)||{};
    };

    ElementNode.prototype = {
        elem: function() {
            var tpl = '<span class="xib-node <%=child%> <%=inline%> expand">'
                    + '<span class="xib-node-toggle fa fa-caret-down"></span>'
                    + '<span class="xib-node-open">'
                    + '<span>&lt;</span>'
                    + '<span class="xib-n-name" name="<%=nodeName%>"><%=nodeName%></span>'
                    + '<% _.each(attributes, function(value, key) {%>'
                    + '<span class="xib-n-attr" key=<%=key%> value=<%=value%>>'
                    + '<span class="xib-n-attr-key" key="<%=key%>"><%=key%></span>='
                    + '<span class="xib-n-attr-val" key="<%=key%>" value="<%=value%>"><%=value%></span>'
                    + '</span>'
                    + '<% })%>'
                    + '<span>&gt;</span>'
                    + '</span>'
                    + '<span class="xib-node-children">'
                    + '</span>'
                    + '<span class="xib-node-close">'
                    + '<span>&lt;/</span>'
                    + '<span class="xib-n-name" name="<%=nodeName%>"><%=nodeName%></span>'
                    + '<span>&gt;</span>'
                    + '</span>'
                    + '</span>';

            var childHtml = _.filter(_.map(this._children, function(child) {
                return child.elem();
            }), function(elem) {
                return elem.html().length > 0;
            });

            var html = _.template(tpl, {
                'nodeName': this._nodeName,
                'attributes': this._attributes,
                'children': childHtml,
                'child': this._opts.isChild ? 'child': '',
                'inline': childHtml.length > 1 ? '' : 'inline'
            });
            this.$elem = $(html);

            var childElem = this.$elem.find('.xib-node-children');
            for (var i in childHtml) {
                childElem.append(childHtml[i]);
            }
            this.$elem.data('node', this);
            return this.$elem;
        },

        search: function(text) {
            // check attributes
            text = text.toLowerCase();
            for(var key in this._attributes) {
                var value = this._attributes[key]+"";
                if (value.toLowerCase().indexOf(text) >= 0) {
                    this.$elem.find('.xib-n-attr[value="'+value+'"]').addClass('search-focus');
                }
                if (key.toLowerCase().indexOf(text) >= 0) {
                    this.$elem.find('.xib-n-attr[key="'+key+'"]').addClass('search-focus');
                }
            }

            // check nodeName
            if (this._nodeName.toLowerCase().indexOf(text) >= 0) {
                this.$elem.find('.xib-node-open  .xib-n-name[name='+this._nodeName+']').addClass('search-focus');
                this.$elem.find('.xib-node-close .xib-n-name[name='+this._nodeName+']').addClass('search-focus');
            }

            // check children nodes
            for(var i in this._children) {
                this._children[i].search(text);
            }
        },

        updateNode: function(type, info) {
            if (type === 'name') {
                var oldName = info.oldValue;
                var newName = info.newValue;
                this._nodeName = newName;
                this.$elem.find('.xib-n-name[name="'+oldName+'"]').attr('name', newName).text(newName);
            } else if (type === 'key') {
                var oldKey = info.oldValue;
                var newKey = info.newValue;
                if (oldKey in this._attributes) {
                    this._attributes[newKey] = this._attributes[oldKey];
                    delete this._attributes[oldKey];
                    this.$elem.find('.xib-n-attr-key[key="'+oldKey+'"]').attr('key', newKey).text(newKey);
                }
            } else if (type === 'value') {
                var newValue = info.newValue;
                var key = info.key;
                this._attributes[key] = newValue;
                this.$elem.find('.xib-n-attr-val[key="'+key+'"]').attr('value', newValue).text(newValue);
            }
        }
    };

    var TextNode = function(text) {
        this._text = text.trim();
    };

    TextNode.prototype = {
        elem: function() {
            var tpl = '<span class="xib-node-value"><%=text%></span>';
            this.$elem = $(_.template(tpl, {'text': this._text}));
            this.$elem.data('node', this);
            return this.$elem;
        },

        search:function(text) {
            text = text.toLowerCase();
            if (this._text.toLowerCase().indexOf(text) >= 0) {
                this.$elem.addClass('search-focus');
            }
        },

        updateNode: function(type, info) {
            var newVal = info.newValue;
            this._text = newVal;
            this.$elem.text(newVal);
        }
    };

    var CommentNode = function(comment, opts) {
        this._comment = comment;
        this._opts = opts||{};
    };

    CommentNode.prototype = {
        elem: function() {
            var tpl = '<span class="xib-node <%=child%>">'
                    + '<span class="xib-node-open">'
                    + '<span>&lt;!--</span>'
                    + '</span>'
                    + '<span class="xib-comment"><%=comment%></span>'
                    + '<span class="xib-node-close">'
                    + '<span>--&gt;</span>'
                    + '</span>'
                    + '</span>';

            var html = _.template(tpl, {
                'child': this._opts.isChild ? 'child': '',
                'comment': this._comment
            });
            this.$elem = $(html);
            this.$elem.data('node', this);
            return this.$elem;
        },
        search:function(text) {

        }
    }

    var CDataNode = function(cdata, opts) {
        this._cdata = cdata;
        this._opts = opts||{};
    };

    CDataNode.prototype = {
        elem: function() {
            var tpl = '<span class="xib-node <%=child%> expand">'
                    + '<span class="xib-node-toggle fa fa-caret-down"></span>'
                    + '<span class="xib-node-open">'
                    + '<span>&lt;![</span>'
                    + '<span class="xib-n-name">CDATA</span>'
                    + '<span>[</span>'
                    + '</span>'
                    + '<span class="xib-node-cdata"><%=cdata%></span>'
                    + '<span class="xib-node-close">'
                    + '<span>]]></span>'
                    + '</span>'
                    + '</span>';


            var html = _.template(tpl, {
                'child': this._opts.isChild ? 'child': '',
                'cdata': this._cdata
            });
            this.$elem = $(html);
            this.$elem.data('node', this);
            return this.$elem;
        },
        search:function(text) {

        }
    };

    /*================================= XibXml ==============================*/

    var XibXml = function(doc) {
        this.doc = doc;
    };

    XibXml.prototype = {

        _getAttrDict: function(node) {

            var attributes = {};
            if (!node.attributes) {
                return attributes;
            }

            for (var i=0, len=node.attributes.length;i<len;i++) {
                var attrNode = node.attributes[i];
                if (attrNode.nodeType == attrNode.ATTRIBUTE_NODE) {
                    attributes[attrNode.nodeName] = attrNode.nodeValue;
                }
            }

            return attributes;
        },

        _makeTextNode: function(node) {
            var text = node.nodeValue.trim();
            return new TextNode(text);
        },

        _makeElementNode: function(node, isChild) {
            var nodeName   = node.nodeName,
                childNodes = node.childNodes,
                attributes = this._getAttrDict(node),
                children   = this._makeChildNodes(node);
            return new ElementNode(nodeName, attributes, children, {'isChild': isChild});
        },

        _makeCDataNode: function(node, isChild) {
            var nodeValue  = node.nodeValue || node.firstChild,
                cdata      = node.nodeValue.trim();
            return new CDataNode(cdata, {'isChild': isChild});
        },

        _makeCommentNode: function(node, isChild) {
            var nodeValue  = node.nodeValue || node.firstChild,
                comment    = node.nodeValue;
            return new CommentNode(comment, {'isChild': isChild});
        },

        _makeChildNodes: function(node) {

            var nodes = [],
                childNodes = node.childNodes,
                childCount = childNodes.length;

            if (childCount > 0) {
                for (var i=0,len=childCount; i < len; i++) {
                    var _node = childNodes[i];
                    var _n = null;

                    if (_node.nodeType == _node.TEXT_NODE) {
                        nodes.push(this._makeTextNode(_node));
                    }
                    if (_node.nodeType == _node.COMMENT_NODE) {
                        nodes.push(this._makeCommentNode(_node, true));
                    }
                    if (_node.nodeType == _node.CDATA_SECTION_NODE) {
                        nodes.push(this._makeCDataNode(_node, true));
                    }
                    if (_node.nodeType == _node.ELEMENT_NODE) {
                        nodes.push(this._makeElementNode(_node, true));
                    }
                }
            }

            return nodes;
        },

        _bindEvents: function() {
            var _this = this;
            this.$elem.delegate('.xib-node .xib-node-toggle', 'click', function() {
                var node = $(this).parent('.xib-node');
                if (node.hasClass('expand')) {
                    node.find('> .xib-node-children').hide();
                    node.find('> .xib-node-close').hide();
                    node.removeClass('expand');
                    $(this).removeClass('fa-caret-down').addClass('fa-caret-right');
                } else {
                    node.find('> .xib-node-children').show();
                    node.find('> .xib-node-close').show();
                    node.addClass('expand');
                    $(this).addClass('fa-caret-down').removeClass('fa-caret-right');
                }
            });

            this.$elem.delegate('.xib-node-open .xib-n-name', 'click', function() {
                var node = $(this).parents('.xib-node').first();
                _this.$elem.find('.selected').removeClass('selected');
                node.find('> .xib-node-open').addClass('selected');
                node.find('> .xib-node-close').addClass('selected');
            });
            this.$elem.delegate('.xib-node-close .xib-n-name', 'click', function() {
                var node = $(this).parents('.xib-node').first();
                _this.$elem.find('.selected').removeClass('selected');
                node.find('> .xib-node-open').addClass('selected');
                node.find('> .xib-node-close').addClass('selected');
            });

            this.$elem.delegate('.xib-node-open .xib-n-name', 'dblclick', function() {
                var elem = $(this);
                var input = new EditInput(elem, 'name');
                input.show();
            });

            this.$elem.delegate('.xib-node-open .xib-n-attr-key', 'dblclick', function() {
                var elem = $(this);
                var input = new EditInput(elem, 'key');
                input.show();
            });

            this.$elem.delegate('.xib-node-open .xib-n-attr-val', 'dblclick', function() {
                var elem = $(this);
                var input = new EditInput(elem, 'value');
                input.show();
            });

            this.$elem.delegate('.xib-node-value', 'dblclick', function() {
                var elem = $(this);
                var input = new EditInput(elem, 'content');
                input.show();
            });

        },

        toHtml: function() {
            var rootNode = this._makeElementNode(this.doc.documentElement);
            this.rootNode = rootNode;
            this.$elem = $('<div class="xml-wrapper"></div>');
            this.$elem.append(rootNode.elem());
            this._bindEvents();
            return this.$elem;
        },

        search: function(text) {
            this.rootNode.search(text);
        }

    };

    /*================================= DobBuilder ==============================*/

    var DocBuilder = function() {
    };

    DocBuilder.prototype = {

        buildHtml: function(xmlDoc) {
            this.doc = new XibXml(xmlDoc);
            return this.doc;
        },

        search: function(text) {
            this.doc.search(text);
        }

    };

    window.DocBuilder = window.DocBuilder ? window.DocBuilder : DocBuilder;

})(jQuery, _, window);
