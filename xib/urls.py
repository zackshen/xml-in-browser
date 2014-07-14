from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^$', 'xib.views.home', name='home'),
    url(r'^xml/$', 'xib.views.get_xml_content', name='get-xml-content'),
)
