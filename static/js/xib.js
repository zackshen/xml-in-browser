(function(root, $, _) {

    var XibInterface = function(elem, opts) {
        this.$elem = elem;
        this.$fileTree = elem.find('.file-tree');
        this.$docXml = elem.find('.doc-xml');
        this.$ctrlBar = elem.find('.ctrl-bar');
        this._opts = opts;

        this._init();
    };

    XibInterface.prototype = {

        _init:function() {
            this._bindEvents();
            this._setCss();
        },

        _bindEvents: function() {

        },

        _setCss: function() {
            var winHeight = $(window).height();
            var docXmlOffset = this.$docXml.offset();
            var ctrlBarHeight = this.$ctrlBar.outerHeight();
            this.$docXml.outerHeight(winHeight-docXmlOffset.top-ctrlBarHeight);
            this.$fileTree.outerHeight(winHeight-docXmlOffset.top);
        },

        load: function() {
            var _this = this;
            $.ajax({
                url: _this._opts['url'],
                success: function(result) {
                    var docBuilder = new DocBuilder(_this.$docXml);
                    var html = docBuilder.buildHtml(result);
                    _this.$docXml.empty().html(html);
                }
            });
        }
    };

    root.XibInterface = XibInterface;

})(window, jQuery, _);
