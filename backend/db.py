import os
import pymysql
import pymysql.cursors
import sqlite3
from config import Config

_memory_sqlite_conn = None

def init_sqlite_db(conn):
    """Initialize in-memory SQLite schema and sample data for fallback/test mode."""
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            department TEXT NOT NULL,
            position TEXT NOT NULL,
            salary REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    # Check if table is empty, insert sample data
    cursor.execute("SELECT COUNT(*) FROM employees")
    count = cursor.fetchone()[0]
    if count == 0:
        sample_data = [
            ('Alice Johnson', 'alice.johnson@example.com', 'Engineering', 'Senior Developer', 95000.00),
            ('Bob Smith', 'bob.smith@example.com', 'Marketing', 'Marketing Specialist', 62000.00),
            ('Carol White', 'carol.white@example.com', 'Human Resources', 'HR Manager', 78000.00),
            ('David Lee', 'david.lee@example.com', 'Finance', 'Financial Analyst', 70000.00),
            ('Eva Martinez', 'eva.martinez@example.com', 'Engineering', 'DevOps Engineer', 88000.00)
        ]
        cursor.executemany("""
            INSERT INTO employees (name, email, department, position, salary)
            VALUES (?, ?, ?, ?, ?)
        """, sample_data)
    conn.commit()

def get_connection():
    """Returns a database connection and connection type ('mysql' or 'sqlite')."""
    global _memory_sqlite_conn

    if os.environ.get('TESTING') == 'true':
        if _memory_sqlite_conn is None:
            _memory_sqlite_conn = sqlite3.connect(':memory:', check_same_thread=False)
            _memory_sqlite_conn.row_factory = sqlite3.Row
            init_sqlite_db(_memory_sqlite_conn)
        return _memory_sqlite_conn, 'sqlite'

    try:
        conn = pymysql.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            cursorclass=pymysql.cursors.DictCursor,
            connect_timeout=3,
            autocommit=True
        )
        return conn, 'mysql'
    except Exception as e:
        # Fallback to SQLite in-memory mode if MySQL is not running locally
        if _memory_sqlite_conn is None:
            _memory_sqlite_conn = sqlite3.connect(':memory:', check_same_thread=False)
            _memory_sqlite_conn.row_factory = sqlite3.Row
            init_sqlite_db(_memory_sqlite_conn)
        return _memory_sqlite_conn, 'sqlite'

def execute_query(sql, params=(), fetch_one=False, fetch_all=False, commit=False):
    """
    Executes a SQL query safely abstraction layer for MySQL and SQLite.
    Returns dictionary results for SELECT queries or lastrowid / affected rows.
    """
    conn, db_type = get_connection()

    if db_type == 'mysql':
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql, params)
                if fetch_one:
                    return cursor.fetchone()
                if fetch_all:
                    return cursor.fetchall()
                if commit:
                    conn.commit()
                return cursor.lastrowid
        finally:
            conn.close()
    else:
        # SQLite query handling
        sqlite_sql = sql.replace('%s', '?')
        cursor = conn.cursor()
        cursor.execute(sqlite_sql, params)
        if commit:
            conn.commit()

        if fetch_one:
            row = cursor.fetchone()
            return dict(row) if row else None
        if fetch_all:
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        
        return cursor.lastrowid
