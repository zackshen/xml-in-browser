(function(root, $, _) {

    var XibInterface = function(elem, opts) {
        this.$elem = elem;
        this.$fileTree = elem.find('.file-tree');
        this.$docXml = elem.find('.doc-xml');
        this.$ctrlBar = elem.find('.ctrl-bar');
        this.$searchBtn = elem.find('.search .search-btn');
        this._opts = opts;

        this._init();
    };

    XibInterface.prototype = {

        _init:function() {
            this._bindEvents();
            this._setCss();
        },

        _bindEvents: function() {
            this.$searchBtn.bind('click', $.proxy(this._startSearch, this));
        },

        _setCss: function() {
            var winHeight = $(window).height();
            var docXmlOffset = this.$docXml.offset();
            var ctrlBarHeight = this.$ctrlBar.outerHeight();
            this.$docXml.outerHeight(winHeight-docXmlOffset.top-ctrlBarHeight);
            this.$fileTree.outerHeight(winHeight-docXmlOffset.top);
        },

        _startSearch: function() {
            var searchText = this.$elem.find('.search .search-text').val().trim();
            if (searchText.length == 0) {
                return;
            }
            this.xmlTree.search(searchText);
        },

        load: function() {
            var _this = this;
            $.ajax({
                url: _this._opts['url'],
                success: function(result) {
                    var docBuilder = new DocBuilder();
                    var xmlTree = docBuilder.buildHtml(result);
                    _this.xmlTree = xmlTree;
                    _this.$docXml.empty().html(xmlTree.toHtml());
                }
            });
        }
    };

    root.XibInterface = XibInterface;

})(window, jQuery, _);
