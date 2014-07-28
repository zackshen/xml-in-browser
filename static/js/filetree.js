(function(root, $, _) {

    var FileTree = function(elem, opts) {
        this.$elem = elem;
        this._opts = opts;
    }

    FileTree.prototype = {
        load: function() {
            var _this = this;
            $.ajax({
                url: _this._opts['treeUrl'],
                success: function(result) {
                    _this._makeTree(result);
                }
            });
        },

        getSelectFile: function() {
            var node = this.tree.get_node(this.tree.get_selected())
            if (node) {
                if (node.original.type === 'file') {
                    return node.original.path;
                }
            }
            return '';
        },

        _makeTree: function(paths) {
            var _this = this;
            this.$elem.jstree(
                {
                    'core' : {
                        'data' : paths
                    },
                    "types" : {
                      "default" : {
                              "icon" : "fa fa-folder"
                            },
                      "file" : {
                              "icon" : "fa fa-file-code-o"
                            }
                    },
                    "plugins" : ["types"]
                }
            ).on('select_node.jstree', function(event, selected) {
                var data = selected.node.original;
                if (data.path) {
                    _this.emitEvent('node.selected', [data.path]);
                }
            });

            this.tree = this.$elem.jstree();
        }
    }

    $.extend(FileTree.prototype, EventEmitter.prototype);

    root.FileTree = FileTree;

})(window, $, _);
