"""add admin fields to users and search requests"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0002_add_admin_fields"
down_revision = "0001_create_users"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column("search_requests", sa.Column("admin_notes", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("search_requests", "admin_notes")
    op.drop_column("users", "is_admin")
