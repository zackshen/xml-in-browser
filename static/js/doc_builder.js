(function($, _, root) {

    var XibXml = function(doc) {
        this.doc = doc;
    };

    var ElementNode = function(nodeName, attributes, children, opts) {
        this._nodeName = nodeName;
        this._attributes = attributes;
        this._children = children;
        this._opts = opts||{};
    };

    ElementNode.prototype = {
        html: function() {
            var tpl = '<span class="xib-node <%=child%> <%=inline%> expand">'
                    + '<span class="xib-node-toggle fa fa-caret-down"></span>'
                    + '<span class="xib-node-open">'
                    + '<span>&lt;</span>'
                    + '<span class="xib-n-name"><%=nodeName%></span>'
                    + '<% _.each(attributes, function(value, key) {%>'
                    + '<span class="xib-n-attr"><%=key%>="<%=value%>"</span>'
                    + '<% })%>'
                    + '<span>&gt;</span>'
                    + '</span>'
                    + '<span class="xib-node-children">'
                    + '<% _.each(children, function(child) { %>'
                    + '<%=child%>'
                    + '<% }) %>'
                    + '</span>'
                    + '<span class="xib-node-close">'
                    + '<span>&lt;/</span>'
                    + '<span class="xib-n-name"><%=nodeName%></span>'
                    + '<span>&gt;</span>'
                    + '</span>'
                    + '</span>';
            var childHtml = _.map(this._children, function(child) {
                return child.html();
            })||[];

            var html = _.template(tpl, {
                'nodeName': this._nodeName,
                'attributes': this._attributes,
                'children': childHtml,
                'child': this._opts.isChild ? 'child': '',
                'inline': childHtml.length > 1 ? '' : 'inline'
            });
            return html;
        }
    };

    var TextNode = function(text) {
        this._text = text.trim();
    };

    TextNode.prototype = {
        html: function() {
            var tpl = '<span class="xib-node-value"><%=text%></span>';
            return _.template(tpl, {'text': this._text});
        }
    };

    var CommentNode = function(comment, opts) {
        this._comment = comment;
        this._opts = opts||{};
    };

    CommentNode.prototype = {
        html: function() {
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
            return html;
        }
    }

    var CDataNode = function(cdata, opts) {
        this._cdata = cdata;
        this._opts = opts||{};
    };

    CDataNode.prototype = {
        html: function() {
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
            return html;
        }
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
                _this.$elem.find('.highlight').removeClass('highlight');
                node.find('> .xib-node-open').addClass('highlight');
                node.find('> .xib-node-close').addClass('highlight');
            });
            this.$elem.delegate('.xib-node-close .xib-n-name', 'click', function() {
                var node = $(this).parents('.xib-node').first();
                _this.$elem.find('.highlight').removeClass('highlight');
                node.find('> .xib-node-open').addClass('highlight');
                node.find('> .xib-node-close').addClass('highlight');
            });
        },

        toHtml: function() {
            var rootNode = this._makeElementNode(this.doc.documentElement);
            this.$elem = $('<div class="xml-wrapper"></div>');
            this.$elem.append($(rootNode.html()));
            this._bindEvents();
            return this.$elem;
        },


    };

    var DocBuilder = function(buildContainer) {
        this.buildContainer = buildContainer;
    };

    DocBuilder.prototype = {

        buildHtml: function(xmlDoc) {
            var xibXml = new XibXml(xmlDoc);
            return xibXml.toHtml();
        },

    };

    window.DocBuilder = window.DocBuilder ? window.DocBuilder : DocBuilder;

})(jQuery, _, window);
