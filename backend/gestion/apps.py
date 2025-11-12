# gestion/apps.py
from django.apps import AppConfig

class GestionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'gestion'

    def ready(self):
        # Importa el módulo de roles solo cuando las apps ya están listas.
        # Esto registra señales (post_migrate) sin romper el arranque.
        import gestion.roles  # noqa: F401

