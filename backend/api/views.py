from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def health_check(request):
    """
    Base health-check endpoint to verify backend connectivity.
    """
    return Response({
        'status': 'online',
        'backend': 'Django + Django REST Framework',
        'app': 'api',
        'message': 'Django backend initialized successfully. Ready for feature development.'
    })
