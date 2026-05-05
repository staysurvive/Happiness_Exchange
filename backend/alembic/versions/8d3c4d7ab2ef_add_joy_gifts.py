"""add joy gifts

Revision ID: 8d3c4d7ab2ef
Revises: 50f479a36c32
Create Date: 2026-05-02 18:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8d3c4d7ab2ef'
down_revision: Union[str, Sequence[str], None] = '50f479a36c32'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'joy_gifts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('sender_id', sa.Integer(), nullable=False),
        sa.Column('recipient_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('delivery_type', sa.String(length=30), server_default='anonymous_stranger', nullable=False),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['product_id'], ['emotion_products.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['recipient_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_joy_gifts_id'), 'joy_gifts', ['id'], unique=False)
    op.create_index(op.f('ix_joy_gifts_product_id'), 'joy_gifts', ['product_id'], unique=False)
    op.create_index(op.f('ix_joy_gifts_recipient_id'), 'joy_gifts', ['recipient_id'], unique=False)
    op.create_index(op.f('ix_joy_gifts_sender_id'), 'joy_gifts', ['sender_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_joy_gifts_sender_id'), table_name='joy_gifts')
    op.drop_index(op.f('ix_joy_gifts_recipient_id'), table_name='joy_gifts')
    op.drop_index(op.f('ix_joy_gifts_product_id'), table_name='joy_gifts')
    op.drop_index(op.f('ix_joy_gifts_id'), table_name='joy_gifts')
    op.drop_table('joy_gifts')
