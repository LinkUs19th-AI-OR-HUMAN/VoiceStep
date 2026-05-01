"""Initial migration with job field

Revision ID: 001
Revises:
Create Date: 2026-05-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.CHAR(36), nullable=False),
        sa.Column('firebase_uid', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('display_name', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('firebase_uid')
    )
    op.create_index(op.f('ix_users_firebase_uid'), 'users', ['firebase_uid'])

    # Create sessions table
    op.create_table(
        'sessions',
        sa.Column('id', sa.CHAR(36), nullable=False),
        sa.Column('user_id', sa.CHAR(36), nullable=False),
        sa.Column('scenario_type', sa.String(50), nullable=False),
        sa.Column('job', sa.String(100), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='active'),
        sa.Column('turn_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('ended_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sessions_user_id'), 'sessions', ['user_id'])

    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', sa.CHAR(36), nullable=False),
        sa.Column('session_id', sa.CHAR(36), nullable=False),
        sa.Column('role', sa.String(50), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('original_stt_text', sa.Text(), nullable=True),
        sa.Column('corrected_text', sa.Text(), nullable=True),
        sa.Column('turn_index', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_messages_session_id'), 'messages', ['session_id'])

    # Create reports table
    op.create_table(
        'reports',
        sa.Column('id', sa.CHAR(36), nullable=False),
        sa.Column('session_id', sa.CHAR(36), nullable=False),
        sa.Column('user_id', sa.CHAR(36), nullable=False),
        sa.Column('scenario_type', sa.String(50), nullable=False),
        sa.Column('job', sa.String(100), nullable=True),
        sa.Column('title', sa.String(255), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('total_score', sa.Integer(), nullable=True),
        sa.Column('report_json', postgresql.JSONB(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['sessions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reports_session_id'), 'reports', ['session_id'])
    op.create_index(op.f('ix_reports_user_id'), 'reports', ['user_id'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_reports_user_id'), table_name='reports')
    op.drop_index(op.f('ix_reports_session_id'), table_name='reports')
    op.drop_index(op.f('ix_messages_session_id'), table_name='messages')
    op.drop_index(op.f('ix_sessions_user_id'), table_name='sessions')
    op.drop_index(op.f('ix_users_firebase_uid'), table_name='users')

    # Drop tables
    op.drop_table('reports')
    op.drop_table('messages')
    op.drop_table('sessions')
    op.drop_table('users')
