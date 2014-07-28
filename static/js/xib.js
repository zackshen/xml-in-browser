(function(root, $, _) {

    var FileTree = root.FileTree;

    var XibInterface = function(elem, opts) {
        this.$elem = elem;
        this.$fileTree = elem.find('.file-tree');
        this.$docXml = elem.find('.doc-xml');
        this.$ctrlBar = elem.find('.ctrl-bar');
        this.$searchBtn = elem.find('.search .search-btn');
        this.$saveBtn = elem.find('.save-btn');
        this.$clearSearchBtn = elem.find('.search .clear-search-btn');
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
            this.$clearSearchBtn.bind('click', $.proxy(this._clearSearch, this));
            this.$saveBtn.bind('click', $.proxy(this._saveXml, this));
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
            this._clearSearch();
            this.xmlTree.search(searchText);
        },

        _clearSearch: function() {
            this.$elem.find('.search .search-text').val('');
            this.$elem.find('.search-focus').removeClass('search-focus');
            this.$elem.find('.selected').removeClass('selected');
        },

        _saveXml: function() {
            var file = this.tree.getSelectFile();
            if (file) {
                console.log(file);
                var xmlContent = this.xmlTree.getContent();

                $.ajax({
                    url: this._opts.saveXmlUrl,
                    type: 'POST',
                    dataType: 'JSON',
                    data: {'xml': xmlContent, 'file': file},
                    success: function(result) {

                    },
                    error: function(err) {

                    }
                });
            }
        },

        _loadXml: function(path) {
            var _this = this;
            var drawXml = function(result) {
                var docBuilder = new DocBuilder();
                var xmlTree = docBuilder.buildHtml(result);
                _this.xmlTree = xmlTree;
                _this.$docXml.empty().html(xmlTree.toHtml());
            };
            $.ajax({
                url: _this._opts.contentUrl,
                type: 'POST',
                dataType: 'xml',
                data: {'path': path},
                success: function(result) {
                    drawXml(result);
                },
                error: function() {
                    var doc = document.implementation.createDocument(null, "info", null);
                    var elem = doc.createElement('fail');
                    var txt = doc.createTextNode("get remote xml fail");
                    elem.appendChild(txt);
                    doc.documentElement.appendChild(elem);
                    drawXml(doc);
                }
            });
        },

        load: function() {
            this.tree = new FileTree(this.$fileTree, this._opts);
            this.tree.addListener('node.selected', $.proxy(this._loadXml, this));
            this.tree.load();

            return;
        }
    };

    root.XibInterface = XibInterface;

})(window, jQuery, _);
