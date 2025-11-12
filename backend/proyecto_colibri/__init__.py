try:
    import pymysql  # Permite usar MySQL sin compilar mysqlclient en Windows
    pymysql.install_as_MySQLdb()
except Exception:
    # Si no está instalado PyMySQL, Django intentará usar mysqlclient (MySQLdb)
    pass
