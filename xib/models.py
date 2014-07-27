import os
from collections import defaultdict

def get_folder_tree(folder, file_ext="xml"):
    flatten_folders = []
    id_cache = defaultdict(int)
    folder_basename = os.path.basename(os.path.abspath(folder))

    def gen_id():
        _id = [0]
        def _inner():
            _id[0] += 1
            return _id[0]
        return _inner

    id_generator = gen_id()

    if not os.path.exists(folder):
        return flatten_folders

    for dirpath, dirnames, filenames in os.walk(folder):
        dirpath_basename = os.path.basename(os.path.abspath(dirpath))
        if dirpath_basename.startswith('.'):
            continue

        if '.git' in dirnames:
            dirnames.remove('.git')
        for dirname in dirnames:
            dir_abspath = os.path.abspath(os.path.join(dirpath, dirname))
            parent_dir_abspath = os.path.abspath(os.path.join(dir_abspath, os.pardir))
            parent = os.path.basename(parent_dir_abspath)

            _id = id_generator()
            id_cache[dir_abspath] = _id
            if folder_basename == parent:
                parent = '#'
            else:
                parent = id_cache[parent_dir_abspath]
            flatten_folders.append({
                'id': _id,
                'text': dirname,
                'parent': parent,
            })

        for filename in filenames:
            file_abspath = os.path.abspath(os.path.join(dirpath, filename))
            parent_dir_abspath = os.path.abspath(dirpath)
            fname, fext = os.path.splitext(filename)

            if fext[1:] == file_ext:
                _id = id_generator()
                id_cache[file_abspath] = _id
                parent = os.path.basename(parent_dir_abspath)
                if folder_basename == parent:
                    parent = '#'
                else:
                    parent = id_cache[parent_dir_abspath]
                flatten_folders.append({
                    'id': _id,
                    'text': filename,
                    'parent': parent,
                    'path': os.path.join(dirpath, filename),
                    'type': 'file'
                })

    return flatten_folders
