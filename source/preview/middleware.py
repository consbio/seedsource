from django.conf import settings
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext

PREVIEW_MODE = getattr(settings, "PREVIEW_MODE", False)
PREVIEW_PASSWORD = getattr(settings, "PREVIEW_PASSWORD", "")


class PreviewAccessMiddleware(object):
    """
    When PREVIEW_MODE = True in settings, requires users to provide a site-level password before accessing any part
    of the site.
    """

    def process_request(self, request):
        if not PREVIEW_MODE or request.session.get('authorized_for_preview', False):
            return
        elif request.POST.get("password") == PREVIEW_PASSWORD and PREVIEW_PASSWORD:
            request.session['authorized_for_preview'] = True
            return HttpResponseRedirect(request.path)
        else:
            response = render_to_response("preview_login.html", {}, RequestContext(request))
            response.status_code = 401
            return response
