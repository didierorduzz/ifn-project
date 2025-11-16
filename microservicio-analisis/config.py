import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5001))
    ORACLE_USER = os.getenv('ORACLE_USER')
    ORACLE_PASSWORD = os.getenv('ORACLE_PASSWORD')
    ORACLE_DSN = os.getenv('ORACLE_DSN')
    NODE_BACKEND_URL = os.getenv('NODE_BACKEND_URL', 'http://localhost:5000')