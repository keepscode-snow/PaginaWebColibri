from rest_framework.permissions import BasePermission

class IsAdminGroup(BasePermission):
    def has_permission(self, request, view):
        return request.user and (request.user.is_superuser or request.user.groups.filter(name='ADMIN').exists())

class IsCajaOrAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        names = set(request.user.groups.values_list('name', flat=True))
        return bool(names & {'ADMIN','CAJA'})
