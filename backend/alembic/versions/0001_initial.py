"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-02-28

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("username", sa.String(50), nullable=False),
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("balance", sa.Integer(), nullable=False, server_default="1000"),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
    )
    op.create_index("idx_users_username", "users", ["username"])

    op.create_table(
        "bet_cards",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("closes_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("resolves_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("status", sa.String(10), nullable=False, server_default="open"),
        sa.Column("outcome", sa.String(3), nullable=True),
        sa.Column("total_pool", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.CheckConstraint(
            "status IN ('open', 'closed', 'resolved')", name="ck_bet_card_status"
        ),
        sa.CheckConstraint(
            "outcome IS NULL OR outcome IN ('yes', 'no')", name="ck_bet_card_outcome"
        ),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_bet_cards_status", "bet_cards", ["status"])
    op.create_index("idx_bet_cards_created_by", "bet_cards", ["created_by"])
    op.create_index("idx_bet_cards_closes_at", "bet_cards", ["closes_at"])

    op.create_table(
        "bets",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("bet_card_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("choice", sa.String(3), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("payout", sa.Integer(), nullable=True),
        sa.Column(
            "placed_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.CheckConstraint("amount > 0", name="ck_bet_amount_positive"),
        sa.CheckConstraint("choice IN ('yes', 'no')", name="ck_bet_choice"),
        sa.ForeignKeyConstraint(["bet_card_id"], ["bet_cards.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "bet_card_id", name="uq_one_bet_per_user_card"),
    )
    op.create_index("idx_bets_user_id", "bets", ["user_id"])
    op.create_index("idx_bets_bet_card_id", "bets", ["bet_card_id"])


def downgrade() -> None:
    op.drop_table("bets")
    op.drop_table("bet_cards")
    op.drop_table("users")
