"""
数据库迁移脚本 - 添加缺失的列
"""
from sqlalchemy import text
from app.core.database import engine

def migrate():
    with engine.connect() as conn:
        columns_to_add = [
            ("face_exams", "doctor_confirmed", "BOOLEAN DEFAULT 0"),
            ("face_exams", "doctor_notes", "TEXT"),
            ("face_exams", "doctor_confirmed_at", "DATETIME"),
            ("face_exams", "image_hash", "VARCHAR"),
            ("face_exams", "image_width", "INTEGER"),
            ("face_exams", "image_height", "INTEGER"),
            ("face_exams", "status", "VARCHAR DEFAULT 'done'"),
        ]
        
        for table, column, col_type in columns_to_add:
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}"))
                print(f"✅ Added {table}.{column}")
            except Exception as e:
                if "duplicate column" in str(e).lower():
                    print(f"⏭️  {table}.{column} already exists")
                else:
                    print(f"⏭️  {table}.{column}: {e}")
        
        conn.commit()
        print("\n✅ Migration complete!")

if __name__ == "__main__":
    migrate()
