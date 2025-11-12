#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import threading
import time
import webbrowser


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proyecto_colibri.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    # Abrir automáticamente Django Admin al ejecutar `runserver` (desactivar con DISABLE_AUTO_BROWSER=1)
    try:
        is_runserver = len(sys.argv) > 1 and sys.argv[1] == 'runserver'
        is_reloader_child = os.environ.get('RUN_MAIN') in ('true', 'True') or not os.environ.get('RUN_MAIN')
        auto_browser_disabled = bool(os.environ.get('DISABLE_AUTO_BROWSER'))
        already_opened = bool(os.environ.get('DJANGO_AUTO_ADMIN_OPENED'))

        if is_runserver and is_reloader_child and not auto_browser_disabled and not already_opened:
            port = '8000'
            for arg in reversed(sys.argv[2:]):
                if ':' in arg:
                    _, maybe_port = arg.rsplit(':', 1)
                    if maybe_port.isdigit():
                        port = maybe_port
                        break
                elif arg.isdigit():
                    port = arg
                    break

            def _open_admin():
                time.sleep(1.5)
                try:
                    webbrowser.open(f'http://127.0.0.1:{port}/admin/')
                except Exception:
                    pass

            threading.Thread(target=_open_admin, daemon=True).start()
            os.environ['DJANGO_AUTO_ADMIN_OPENED'] = '1'
    except Exception:
        pass
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
