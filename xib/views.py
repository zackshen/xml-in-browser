import os
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponse
from django.conf import settings


def home(request):
    """@todo: Docstring for home.

    :request: @todo
    :returns: @todo

    """
    return render_to_response('home.html', {}, context_instance=RequestContext(request))


def get_xml_content(request):
    if hasattr(settings, 'PROJECT_PATH'):
        project_path = getattr(settings, 'PROJECT_PATH')

    tmp_xml = os.path.join(project_path, 'cd_catalog_with_css.xml')
    xml_content = ''
    with open(tmp_xml, 'r') as fp:
        xml_content = fp.read()

    return HttpResponse(xml_content, mimetype='application/xml')
