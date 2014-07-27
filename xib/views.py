import os
import json
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
    if request.method == 'POST':
        path = request.POST.get('path')
        if not os.path.exists(path):
            return HttpResponse('<info>file not exists</info>', mimetype='application/xml')
        xml_content = ''
        with open(path, 'r') as fp:
            xml_content = fp.read()
        return HttpResponse(xml_content, mimetype='application/xml')
    else:
        return HttpResponse('<info>no auth</info>', mimetype='application/xml')
