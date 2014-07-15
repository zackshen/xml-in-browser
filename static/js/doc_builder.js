(function($, _, root) {

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
            var tpl = '<span class="xib-node-value"><%=text%></span>';
            var nodeValue = node.nodeValue.trim();
            return _.template(tpl, {'text': nodeValue});
        },

        _makeElementNode: function(node, isChild) {
            var nodeName   = node.nodeName,
                childNodes = node.childNodes,
                attributes = this._getAttrDict(node),
                nodeValue  = node.nodeValue || node.firstChild;
                children   = this._makeChildNodes(node);

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

            var html = _.template(tpl, {
                'nodeName': nodeName,
                'attributes': attributes,
                'children': children||[],
                'child': isChild ? 'child': '',
                'inline': children.length > 1 ? '' : 'inline'
            });

            return html;
        },

        _makeCDataNode: function(node, isChild) {
            var nodeName   = node.nodeName,
                childNodes = node.childNodes,
                nodeValue  = node.nodeValue || node.firstChild,
                cdata      = node.nodeValue.trim();

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
                'nodeName': nodeName,
                'child': isChild ? 'child': '',
                'cdata': cdata
            });

            return html;
        },

        _makeCommentNode: function(node, isChild) {
            var nodeName   = node.nodeName,
                childNodes = node.childNodes,
                nodeValue  = node.nodeValue || node.firstChild,
                comment    = node.nodeValue;

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
                'child': isChild ? 'child': '',
                'comment': comment
            });

            return html;
        },

        _makeChildNodes: function(node) {

            var html = [],
                childNodes = node.childNodes,
                childCount = childNodes.length;

            if (childCount > 0) {

                for (var i=0,len=childCount; i < len; i++) {
                    var _node = childNodes[i];

                    if (_node.nodeType == _node.TEXT_NODE) {
                        html.push(this._makeTextNode(_node));
                    }
                    if (_node.nodeType == _node.COMMENT_NODE) {
                        html.push(this._makeCommentNode(_node, true));
                    }
                    if (_node.nodeType == _node.CDATA_SECTION_NODE) {
                        html.push(this._makeCDataNode(_node, true));
                    }
                    if (_node.nodeType == _node.ELEMENT_NODE) {
                        html.push(this._makeElementNode(_node, true));
                    }
                }
            }

            return html;
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
            var html = this._makeElementNode(this.doc.documentElement);
            this.$elem = $('<div class="xml-wrapper"></div>');
            this.$elem.append($(html));
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
