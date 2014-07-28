import os
import json
import xml.etree.cElementTree as ET
import xml.dom.minidom as minidom
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponse
from django.conf import settings
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from .models import get_folder_tree


def home(request):
    """@todo: Docstring for home.

    :request: @todo
    :returns: @todo

    """
    return render_to_response('home.html', {}, context_instance=RequestContext(request))

def get_tree(request):
    project_path = getattr(settings, 'PROJECT_PATH')
    folder_tree = get_folder_tree(os.path.join(project_path))
    return HttpResponse(json.dumps(folder_tree), mimetype='application/json')

@csrf_exempt
@require_POST
def get_xml_content(request):
    path = request.POST.get('path')
    if not os.path.exists(path):
        return HttpResponse('<info>file not exists</info>', mimetype='application/xml')
    xml_content = ''
    with open(path, 'r') as fp:
        xml_content = fp.read()
    return HttpResponse(xml_content, mimetype='application/xml')

@csrf_exempt
@require_POST
def save_xml(request):
    xml = request.POST.get('xml')
    fpath = request.POST.get('file')
    try:
        xml = minidom.parseString(xml)
        xml = xml.toprettyxml(encoding='utf-8')
    except:
        return HttpResponse(json.dumps({'ok': False, 'msg': 'xml parse error'}), mimetype='application/json')

    if os.path.exists(fpath):
        with open(fpath, 'w') as fp:
            fp.write(xml)
    return HttpResponse(json.dumps({'ok': True}), mimetype='application/json')
