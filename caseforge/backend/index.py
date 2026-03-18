import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

# Simple test - just return health
def handler(event, context):
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': '{"status": "ok", "message": "CaseForge API working"}'
    }