from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^$', 'xib.views.home', name='home'),
    url(r'^tree/$', 'xib.views.get_tree', name='get-folder-tree'),
    url(r'^xml/$', 'xib.views.get_xml_content', name='get-xml-content'),
)
