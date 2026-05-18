#!/usr/bin/env python3
"""
Sync user and message data from MySQL to Elasticsearch.
"""

import pymysql
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk

# MySQL connection config
MYSQL_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': 'Cydia4384!',
    'database': 'chen_im',
    'charset': 'utf8mb4'
}

# Elasticsearch config
ES_HOST = 'http://localhost:9200'

# Batch size for bulk operations
BATCH_SIZE = 100


def create_es_client():
    """Create Elasticsearch client."""
    return Elasticsearch(
        ES_HOST,
        verify_certs=False,
        ssl_show_warn=False
    )


def create_mysql_connection():
    """Create MySQL connection."""
    return pymysql.connect(**MYSQL_CONFIG)


def create_indexes(es_client):
    """Create ES indexes if they don't exist."""

    # User index mapping
    # 说明：user_server / friend_server 在搜索用户时使用 match 查询同时落到
    # user_id / phone / nickname 三个字段（见 Common/elasticsearch_user.hpp::ESUser::search），
    # 同时还需要 user_id 上的 term 过滤排除自己和已有好友。
    # 因此把这三个字段都做成 text + .keyword 双映射：text 用于 match（标准分词），
    # keyword 子字段用于精确 term 过滤。description 仅做全文搜索，avatar_id 仅作 ID 用。
    user_mapping = {
        "mappings": {
            "properties": {
                "user_id":     {"type": "text", "fields": {"keyword": {"type": "keyword", "ignore_above": 256}}},
                "nickname":    {"type": "text", "fields": {"keyword": {"type": "keyword", "ignore_above": 256}}},
                "phone":       {"type": "text", "fields": {"keyword": {"type": "keyword", "ignore_above": 256}}},
                "description": {"type": "text"},
                "avatar_id":   {"type": "keyword"}
            }
        }
    }

    # Message index mapping - 使用 chat_session_id 匹配后端搜索字段
    message_mapping = {
        "mappings": {
            "properties": {
                "message_id": {"type": "keyword"},
                "user_id": {"type": "keyword"},
                "chat_session_id": {"type": "keyword"},  # 改名匹配后端搜索
                "content": {"type": "text"},
                "create_time": {"type": "long"}  # 使用long类型存储时间戳
            }
        }
    }

    # Create user index
    if not es_client.indices.exists(index='user'):
        es_client.indices.create(index='user', body=user_mapping)
        print("Created 'user' index")
    else:
        print("'user' index already exists")

    # Create message index
    if not es_client.indices.exists(index='message'):
        es_client.indices.create(index='message', body=message_mapping)
        print("Created 'message' index")
    else:
        print("'message' index already exists")


def sync_users(mysql_conn, es_client):
    """Sync user data from MySQL to Elasticsearch."""
    print("\n=== Syncing Users ===")

    cursor = mysql_conn.cursor(pymysql.cursors.DictCursor)

    # Get total count
    cursor.execute("SELECT COUNT(*) as count FROM user")
    total = cursor.fetchone()['count']
    print(f"Total users to sync: {total}")

    if total == 0:
        print("No users to sync")
        return 0

    # Fetch all users
    cursor.execute("""
        SELECT user_id, nickname, phone, description, avatar_id
        FROM user
    """)

    synced = 0
    batch = []

    for row in cursor:
        doc = {
            '_index': 'user',
            '_id': str(row['user_id']),
            '_source': {
                'user_id': row['user_id'],
                'nickname': row['nickname'] or '',
                'phone': row['phone'] or '',
                'description': row['description'] or '',
                'avatar_id': row['avatar_id']
            }
        }
        batch.append(doc)

        if len(batch) >= BATCH_SIZE:
            success, failed = bulk(es_client, batch)
            synced += success
            if failed:
                print(f"  Failed: {len(failed)} documents")
            print(f"  Synced {synced}/{total} users...")
            batch = []

    # Sync remaining
    if batch:
        success, failed = bulk(es_client, batch)
        synced += success
        if failed:
            print(f"  Failed: {len(failed)} documents")

    cursor.close()
    print(f"User sync complete: {synced} users synced")
    return synced


def sync_messages(mysql_conn, es_client):
    """Sync message data from MySQL to Elasticsearch (text messages only)."""
    print("\n=== Syncing Messages ===")

    cursor = mysql_conn.cursor(pymysql.cursors.DictCursor)

    # Get total count (only text messages, message_type=0)
    cursor.execute("SELECT COUNT(*) as count FROM message WHERE message_type = 0")
    total = cursor.fetchone()['count']
    print(f"Total text messages to sync: {total}")

    if total == 0:
        print("No messages to sync")
        return 0

    # Fetch all text messages
    cursor.execute("""
        SELECT message_id, user_id, session_id, content, create_time
        FROM message
        WHERE message_type = 0
    """)

    synced = 0
    batch = []

    for row in cursor:
        # 转换时间为Unix时间戳
        create_time = row['create_time']
        if create_time:
            import time
            timestamp = int(time.mktime(create_time.timetuple()))
        else:
            timestamp = 0

        doc = {
            '_index': 'message',
            '_id': str(row['message_id']),
            '_source': {
                'message_id': row['message_id'],
                'user_id': row['user_id'],
                'chat_session_id': row['session_id'],  # 字段名改为 chat_session_id
                'content': row['content'] or '',
                'create_time': timestamp
            }
        }
        batch.append(doc)

        if len(batch) >= BATCH_SIZE:
            success, failed = bulk(es_client, batch)
            synced += success
            if failed:
                print(f"  Failed: {len(failed)} documents")
            print(f"  Synced {synced}/{total} messages...")
            batch = []

    # Sync remaining
    if batch:
        success, failed = bulk(es_client, batch)
        synced += success
        if failed:
            print(f"  Failed: {len(failed)} documents")

    cursor.close()
    print(f"Message sync complete: {synced} messages synced")
    return synced


def verify_sync(es_client):
    """Verify the synced data in Elasticsearch."""
    print("\n=== Verifying Sync ===")

    # Check user count
    user_count = es_client.count(index='user')
    print(f"Users in ES: {user_count['count']}")

    # Check message count
    msg_count = es_client.count(index='message')
    print(f"Messages in ES: {msg_count['count']}")

    # Sample user
    user_sample = es_client.search(index='user', size=1)
    if user_sample['hits']['hits']:
        print(f"Sample user: {user_sample['hits']['hits'][0]['_source']}")

    # Sample message
    msg_sample = es_client.search(index='message', size=1)
    if msg_sample['hits']['hits']:
        print(f"Sample message: {msg_sample['hits']['hits'][0]['_source']}")


def main():
    print("Starting MySQL to Elasticsearch sync...")

    # Create connections
    es_client = create_es_client()
    mysql_conn = create_mysql_connection()

    try:
        # Check ES connection
        if not es_client.ping():
            print("ERROR: Cannot connect to Elasticsearch")
            return
        print("Connected to Elasticsearch")

        # Create indexes
        create_indexes(es_client)

        # Sync data
        users_synced = sync_users(mysql_conn, es_client)
        messages_synced = sync_messages(mysql_conn, es_client)

        # Verify
        verify_sync(es_client)

        print("\n=== Sync Complete ===")
        print(f"Total users synced: {users_synced}")
        print(f"Total messages synced: {messages_synced}")

    finally:
        mysql_conn.close()
        print("\nMySQL connection closed")


if __name__ == '__main__':
    main()